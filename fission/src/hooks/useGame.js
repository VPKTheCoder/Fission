import { useCallback, useState } from 'react';
import { generateBoard } from '../utils/boardGenerator.js';
import {
  CASCADE_TURNS_EACH, GAME_MODE, PLAYER,
  MELTDOWN_DEGRADE_INTERVAL,
  OVERDRIVE_STABILIZE_COST, OVERDRIVE_QUANTUM_COST,
} from '../utils/constants.js';
import {
  canPlace, checkWinner, checkBreachWinner, countOrbs, placeOrb,
  getMeltdownBonus, applySingularityDrain, applyMeltdownDegradation,
} from '../utils/gameLogic.js';

const STEP_DELAY = 150;
const MAX_ANIM_FRAMES = 25;
const FAST_STEP_DELAY = 60;

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getAnimationPlan(steps) {
  if (steps.length <= MAX_ANIM_FRAMES) {
    return { frames: steps, delay: STEP_DELAY };
  }
  const rate = Math.ceil(steps.length / MAX_ANIM_FRAMES);
  const indices = new Set();
  indices.add(0);
  for (let i = rate; i < steps.length - 1; i += rate) indices.add(i);
  indices.add(steps.length - 1);
  return {
    frames: Array.from(indices).sort((a, b) => a - b).map((i) => steps[i]),
    delay: FAST_STEP_DELAY,
  };
}

export function useGame({ mode, onGameOver, isTwoPlayer = false }) {
  const [board, setBoard] = useState(() => generateBoard(mode));
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER.HUMAN);
  const [turn, setTurn] = useState(0);
  const [scores, setScores] = useState({ [PLAYER.HUMAN]: 0, [PLAYER.AI]: 0 });
  const [winner, setWinner] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [explodingCells, setExplodingCells] = useState(new Set());
  const [lastChainLength, setLastChainLength] = useState(0);

  const [meltdownBonus, setMeltdownBonus] = useState(0);
  const [meltdownEvents, setMeltdownEvents] = useState([]);
  const [singularityDrain, setSingularityDrain] = useState(null);
  const [overdriveEnergy, setOverdriveEnergy] = useState({ [PLAYER.HUMAN]: 0, [PLAYER.AI]: 0 });
  const [usedAbility, setUsedAbility] = useState(false);
  const [quantumPending, setQuantumPending] = useState(false);
  const [activeAbility, setActiveAbility] = useState(null);
  const [stabilizeTarget, setStabilizeTarget] = useState(null);

  const finishGame = useCallback((gameWinner, finalScores) => {
    setWinner(gameWinner);
    onGameOver?.(gameWinner, finalScores);
  }, [onGameOver]);

  const resolveWinner = useCallback((nextBoard, nextTurn, nextScores) => {
    if (nextTurn < 2) return null;

    const counts = countOrbs(nextBoard);
    if (counts[PLAYER.HUMAN] === 0 && counts[PLAYER.AI] > 0) return PLAYER.AI;
    if (counts[PLAYER.AI] === 0 && counts[PLAYER.HUMAN] > 0) return PLAYER.HUMAN;

    if (mode === GAME_MODE.CASCADE || mode === GAME_MODE.OVERDRIVE) {
      const maxTurns = mode === GAME_MODE.OVERDRIVE ? 20 : CASCADE_TURNS_EACH;
      if (nextTurn >= maxTurns * 2) {
        if (nextScores[PLAYER.HUMAN] === nextScores[PLAYER.AI]) return 'draw';
        return nextScores[PLAYER.HUMAN] > nextScores[PLAYER.AI] ? PLAYER.HUMAN : PLAYER.AI;
      }
      return null;
    }

    if (mode === GAME_MODE.BREACH) {
      return checkBreachWinner(nextBoard, nextTurn);
    }

    return checkWinner(nextBoard, nextTurn);
  }, [mode]);

  const applyPlayerMove = useCallback(async (row, col, player, extraOptions = {}) => {
    if (winner || isAnimating || currentPlayer !== player) return false;
    if (!canPlace(board, row, col, player)) return false;

    const currentBonus = mode === GAME_MODE.MELTDOWN ? getMeltdownBonus(turn) : 0;
    const result = placeOrb(board, row, col, player, currentBonus, { ...extraOptions, gameMode: mode });
    if (!result) return false;

    setIsAnimating(true);

    const plan = getAnimationPlan(result.steps);
    for (const step of plan.frames) {
      setExplodingCells(step.explodingCells);
      await wait(plan.delay);
      setBoard(step.boardSnapshot);
    }

    setExplodingCells(new Set());
    setLastChainLength(result.chainLength);
    setTimeout(() => setLastChainLength(0), 500);

    let nextTurn = turn + 1;
    let nextScores = { ...scores };
    let nextBoard = result.board;

    if (mode === GAME_MODE.CASCADE || mode === GAME_MODE.OVERDRIVE) {
      nextScores[player] += Math.max(1, result.chainLength);
    }

    if (mode === GAME_MODE.OVERDRIVE) {
      const energyGain = Math.max(0, result.chainLength - 1);
      setOverdriveEnergy((e) => ({
        ...e,
        [player]: e[player] + energyGain,
      }));
    }

    if (mode === GAME_MODE.SINGULARITY) {
      const drainResult = applySingularityDrain(nextBoard);
      nextBoard = drainResult.board;
      setSingularityDrain(drainResult.drained);
      setTimeout(() => setSingularityDrain(null), 1500);
    }

    if (mode === GAME_MODE.MELTDOWN && nextTurn % MELTDOWN_DEGRADE_INTERVAL === 0 && nextTurn > 0) {
      const newBonus = getMeltdownBonus(nextTurn);
      setMeltdownBonus(newBonus);
      const degResult = applyMeltdownDegradation(nextBoard, newBonus);
      nextBoard = degResult.board;
      if (degResult.triggered.length > 0) {
        setMeltdownEvents(degResult.triggered);
        setTimeout(() => setMeltdownEvents([]), 2000);
        if (degResult.steps) {
          const degPlan = getAnimationPlan(degResult.steps);
          for (const s of degPlan.frames) {
            setExplodingCells(s.explodingCells);
            await wait(degPlan.delay);
            setBoard(s.boardSnapshot);
          }
          setExplodingCells(new Set());
        }
      }
    }

    setBoard(nextBoard);
    const nextWinner = resolveWinner(nextBoard, nextTurn, nextScores);

    setTurn(nextTurn);
    setScores(nextScores);
    setIsAnimating(false);
    setUsedAbility(false);
    setActiveAbility(null);
    setStabilizeTarget(null);

    if (nextWinner) {
      finishGame(nextWinner, nextScores);
    } else {
      setCurrentPlayer(player === PLAYER.HUMAN ? PLAYER.AI : PLAYER.HUMAN);
    }

    return true;
  }, [board, currentPlayer, finishGame, isAnimating, mode, resolveWinner, scores, turn, winner]);

  const handleCellClick = useCallback(async (row, col) => {
    const player = isTwoPlayer ? currentPlayer : PLAYER.HUMAN;
    if (mode === GAME_MODE.OVERDRIVE && activeAbility === 'stabilize') {
      if (!stabilizeTarget) {
        setStabilizeTarget({ row, col });
        return true;
      }
      const result = await applyPlayerMove(row, col, player, {
        stabilizeCells: [[stabilizeTarget.row, stabilizeTarget.col]],
      });
      setActiveAbility(null);
      setStabilizeTarget(null);
      return result;
    }
    if (mode === GAME_MODE.OVERDRIVE && activeAbility === 'quantum') {
      const result = await applyPlayerMove(row, col, player, { quantumMultiplier: 2 });
      setActiveAbility(null);
      setQuantumPending(false);
      return result;
    }
    return applyPlayerMove(row, col, player);
  }, [applyPlayerMove, mode, activeAbility, stabilizeTarget, isTwoPlayer, currentPlayer]);

  const handleAIMove = useCallback((move) => {
    if (!move) {
      finishGame(PLAYER.HUMAN, scores);
      return false;
    }
    const options = {};
    if (move.ability === 'quantum') {
      setOverdriveEnergy((e) => ({ ...e, [PLAYER.AI]: e[PLAYER.AI] - OVERDRIVE_QUANTUM_COST }));
      options.quantumMultiplier = 2;
    } else if (move.ability === 'stabilize' && move.stabilizeTarget) {
      setOverdriveEnergy((e) => ({ ...e, [PLAYER.AI]: e[PLAYER.AI] - OVERDRIVE_STABILIZE_COST }));
      options.stabilizeCells = [[move.stabilizeTarget.row, move.stabilizeTarget.col]];
    }
    return applyPlayerMove(move.row, move.col, PLAYER.AI, options);
  }, [applyPlayerMove, finishGame, scores]);

  const useAbility = useCallback((ability, player) => {
    if (mode !== GAME_MODE.OVERDRIVE || usedAbility) return { ok: false };

    if (ability === 'stabilize' && overdriveEnergy[player] >= OVERDRIVE_STABILIZE_COST) {
      setOverdriveEnergy((e) => ({ ...e, [player]: e[player] - OVERDRIVE_STABILIZE_COST }));
      setUsedAbility(true);
      setActiveAbility('stabilize');
      setStabilizeTarget(null);
      return { ok: true, type: 'stabilize' };
    }

    if (ability === 'quantum' && overdriveEnergy[player] >= OVERDRIVE_QUANTUM_COST) {
      setOverdriveEnergy((e) => ({ ...e, [player]: e[player] - OVERDRIVE_QUANTUM_COST }));
      setUsedAbility(true);
      setActiveAbility('quantum');
      setQuantumPending(true);
      return { ok: true, type: 'quantum' };
    }

    return { ok: false };
  }, [mode, overdriveEnergy, usedAbility]);

  const resetGame = useCallback(() => {
    setBoard(generateBoard(mode));
    setCurrentPlayer(PLAYER.HUMAN);
    setTurn(0);
    setScores({ [PLAYER.HUMAN]: 0, [PLAYER.AI]: 0 });
    setWinner(null);
    setIsAnimating(false);
    setExplodingCells(new Set());
    setMeltdownBonus(0);
    setMeltdownEvents([]);
    setSingularityDrain(null);
    setOverdriveEnergy({ [PLAYER.HUMAN]: 0, [PLAYER.AI]: 0 });
    setUsedAbility(false);
    setQuantumPending(false);
    setActiveAbility(null);
    setStabilizeTarget(null);
  }, [mode]);

  return {
    board,
    currentPlayer,
    turn,
    scores,
    winner,
    isAnimating,
    explodingCells,
    handleCellClick,
    resetGame,
    handleAIMove,
    orbCounts: countOrbs(board),
    lastChainLength,
    mode,
    meltdownBonus,
    meltdownEvents,
    singularityDrain,
    overdriveEnergy,
    useAbility,
    usedAbility,
    quantumPending,
    activeAbility,
    stabilizeTarget,
  };
}
