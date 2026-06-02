import { useCallback, useState } from 'react';
import { generateBoard } from '../utils/boardGenerator.js';
import { CASCADE_TURNS_EACH, GAME_MODE, PLAYER } from '../utils/constants.js';
import { canPlace, checkWinner, countOrbs, placeOrb } from '../utils/gameLogic.js';

const STEP_DELAY = 150;
const FLASH_DURATION = 300;

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function useGame({ mode, onGameOver }) {
  const [board, setBoard] = useState(() => generateBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER.HUMAN);
  const [turn, setTurn] = useState(0);
  const [scores, setScores] = useState({ [PLAYER.HUMAN]: 0, [PLAYER.AI]: 0 });
  const [winner, setWinner] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [explodingCells, setExplodingCells] = useState(new Set());
  const [lastChainLength, setLastChainLength] = useState(0);

  const finishGame = useCallback((gameWinner, finalScores) => {
    setWinner(gameWinner);
    onGameOver?.(gameWinner, finalScores);
  }, [onGameOver]);

  const resolveWinner = useCallback((nextBoard, nextTurn, nextScores) => {
    if (mode === GAME_MODE.CASCADE) {
      if (nextTurn >= CASCADE_TURNS_EACH * 2) {
        if (nextScores[PLAYER.HUMAN] === nextScores[PLAYER.AI]) {
          return 'draw';
        }
        return nextScores[PLAYER.HUMAN] > nextScores[PLAYER.AI] ? PLAYER.HUMAN : PLAYER.AI;
      }
      return null;
    }

    return checkWinner(nextBoard, nextTurn);
  }, [mode]);

  const applyPlayerMove = useCallback(async (row, col, player) => {
    if (winner || isAnimating || currentPlayer !== player) {
      return false;
    }
    if (!canPlace(board, row, col, player)) {
      return false;
    }

    const result = placeOrb(board, row, col, player);
    if (!result) {
      return false;
    }

    setIsAnimating(true);

    for (const step of result.steps) {
      setExplodingCells(step.explodingCells);
      await wait(STEP_DELAY);
      setBoard(step.boardSnapshot);
      await wait(Math.max(0, FLASH_DURATION - STEP_DELAY));
    }

    setExplodingCells(new Set());
    setLastChainLength(result.chainLength);
    setTimeout(() => setLastChainLength(0), 500);

    const nextTurn = turn + 1;
    const nextScores = mode === GAME_MODE.CASCADE
      ? { ...scores, [player]: scores[player] + Math.max(1, result.chainLength) }
      : scores;
    const nextWinner = resolveWinner(result.board, nextTurn, nextScores);

    setTurn(nextTurn);
    setScores(nextScores);
    setIsAnimating(false);

    if (nextWinner) {
      finishGame(nextWinner, nextScores);
    } else {
      setCurrentPlayer(player === PLAYER.HUMAN ? PLAYER.AI : PLAYER.HUMAN);
    }

    return true;
  }, [board, currentPlayer, finishGame, isAnimating, mode, resolveWinner, scores, turn, winner]);

  const handleCellClick = useCallback((row, col) => {
    return applyPlayerMove(row, col, PLAYER.HUMAN);
  }, [applyPlayerMove]);

  const handleAIMove = useCallback((move) => {
    if (!move) {
      finishGame(PLAYER.HUMAN, scores);
      return false;
    }
    return applyPlayerMove(move.row, move.col, PLAYER.AI);
  }, [applyPlayerMove, finishGame, scores]);

  const resetGame = useCallback(() => {
    setBoard(generateBoard());
    setCurrentPlayer(PLAYER.HUMAN);
    setTurn(0);
    setScores({ [PLAYER.HUMAN]: 0, [PLAYER.AI]: 0 });
    setWinner(null);
    setIsAnimating(false);
    setExplodingCells(new Set());
  }, []);

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
  };
}
