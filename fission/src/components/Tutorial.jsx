import { useState, useEffect, useRef } from 'react';
import Cell from './Cell.jsx';
import { PLAYER, CELL_TYPE, ROWS, COLS, GAME_MODE } from '../utils/constants.js';
import { generateBoard } from '../utils/boardGenerator.js';
import { placeOrb } from '../utils/gameLogic.js';

const STEP_DELAY = 100;
const MAX_ANIM_FRAMES = 25;
const FAST_STEP_DELAY = 60;

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getAnimationPlan(steps) {
  if (steps.length <= MAX_ANIM_FRAMES) return { frames: steps, delay: STEP_DELAY };
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

function makeEmptyBoard() {
  const board = generateBoard();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      board[r][c].owner = null;
      board[r][c].orbs = 0;
    }
  }
  return board;
}

function setCell(board, row, col, orbs, owner) {
  board[row][col].orbs = orbs;
  board[row][col].owner = owner;
}

function buildBoard(step) {
  const b = makeEmptyBoard();
  if (step.setupBoard) step.setupBoard(b);
  return b;
}

const MODE_TUTORIALS = {
  [GAME_MODE.CONQUEST]: {
    title: 'Conquest',
    description: 'Eliminate all enemy orbs. Last player standing wins.',
    steps: [
      {
        id: 'cq-intro',
        type: 'info',
        title: 'Conquest Mode',
        description: `OBJECTIVE: Eliminate all enemy orbs.

• The game starts counting elimination after both players have placed at least one orb.
• If either player has 0 orbs on the board, the opponent wins.
• Chain reactions can wipe out clusters of enemy cells.
• Focus on building stable territory while creating pressure near enemy cells.
• Catalysts and Amplifiers are key battlegrounds.`,
      },
      {
        id: 'cq-placement',
        type: 'interact',
        title: 'Orb Placement',
        instruction: 'Click the highlighted cell to place your first orb.',
        setupBoard: () => {},
        getTargets: () => [[4, 4]],
        onComplete: () => 'Good! Your orb has been placed. That cell is now yours.',
      },
      {
        id: 'cq-explosion',
        type: 'interact',
        title: 'Critical Mass',
        instruction: 'This edge cell has 2 orbs. Click it to trigger an explosion!',
        setupBoard: (b) => { setCell(b, 0, 4, 2, PLAYER.HUMAN); },
        getTargets: () => [[0, 4]],
        onComplete: () => 'The cell exploded! Orbs were sent to neighbors, converting them to your color.',
      },
      {
        id: 'cq-chain',
        type: 'interact',
        title: 'Chain Reactions',
        instruction: 'Click to trigger a chain reaction across multiple cells!',
        setupBoard: (b) => {
          setCell(b, 2, 2, 3, PLAYER.HUMAN);
          setCell(b, 2, 3, 3, PLAYER.HUMAN);
          setCell(b, 2, 4, 3, PLAYER.HUMAN);
        },
        getTargets: () => [[2, 2]],
        onComplete: (len) => `Chain reaction! ${len} cells exploded in sequence.`,
      },
      {
        id: 'cq-catalyst',
        type: 'interact',
        title: 'Catalyst',
        instruction: 'Catalysts have lower critical mass. Click to explode it!',
        setupBoard: (b) => { b[1][1].owner = PLAYER.HUMAN; b[1][1].orbs = 2; },
        getTargets: () => [[1, 1]],
        onComplete: () => 'Catalysts explode with fewer orbs — great for starting chains.',
        specialHighlight: CELL_TYPE.CATALYST,
      },
      {
        id: 'cq-void',
        type: 'interact',
        title: 'Void',
        instruction: 'Click (0,2) to trigger an explosion toward the Void at (0,3).',
        setupBoard: (b) => { b[0][3].voidCharge = true; setCell(b, 0, 2, 2, PLAYER.HUMAN); },
        getTargets: () => [[0, 2]],
        onComplete: () => 'The Void absorbed the explosion! It is now depleted.',
      },
      {
        id: 'cq-amplifier',
        type: 'interact',
        title: 'Amplifier',
        instruction: 'Amplifiers send 2 orbs per neighbor. Click to trigger!',
        setupBoard: (b) => { setCell(b, 3, 3, 3, PLAYER.HUMAN); },
        getTargets: () => [[3, 3]],
        onComplete: () => 'The Amplifier sent 2 orbs in every direction! Powerful.',
        specialHighlight: CELL_TYPE.AMPLIFIER,
      },
      {
        id: 'cq-strategy',
        type: 'info',
        title: 'Conquest Strategy',
        description: `• Build stable territory before attacking.
• Watch enemy cells nearing critical mass.
• Catalysts trigger fast — use them to start chains.
• Amplifiers are the most valuable cells.
• Voids can block a chain route — deplete them when convenient.
• A single chain reaction can win the game.`,
      },
    ],
  },

  [GAME_MODE.CASCADE]: {
    title: 'Cascade',
    description: 'Chain reactions score points. 20 turns each. Highest score wins.',
    steps: [
      {
        id: 'ca-intro',
        type: 'info',
        title: 'Cascade Mode',
        description: `OBJECTIVE: Score the most points through chain reactions.

• Both players get 20 turns each (40 total).
• Each move scores: Max(1, chain length).
  — No explosion = 1 point
  — 6-step chain = 6 points
• Cascade rewards planned chain reactions.
• Long chains are worth far more than short ones.`,
      },
      {
        id: 'ca-placement',
        type: 'interact',
        title: 'Placing Orbs',
        instruction: 'Click to place an orb and see how scoring works.',
        setupBoard: () => {},
        getTargets: () => [[4, 4]],
        onComplete: () => 'No chain? You still get 1 point. Build chains for higher scores!',
      },
      {
        id: 'ca-explosion',
        type: 'interact',
        title: 'Scoring with Explosions',
        instruction: 'Click this cell to trigger an explosion and earn points.',
        setupBoard: (b) => { setCell(b, 0, 4, 2, PLAYER.HUMAN); },
        getTargets: () => [[0, 4]],
        onComplete: (len) => `That chain scored ${len} point${len > 1 ? 's' : ''}!`,
      },
      {
        id: 'ca-chain',
        type: 'interact',
        title: 'High Score Chains',
        instruction: 'Click to trigger a multi-cell chain for big points!',
        setupBoard: (b) => {
          setCell(b, 2, 2, 3, PLAYER.HUMAN);
          setCell(b, 2, 3, 3, PLAYER.HUMAN);
          setCell(b, 2, 4, 3, PLAYER.HUMAN);
        },
        getTargets: () => [[2, 2]],
        onComplete: (len) => `${len}-step chain! That scores ${len} points!`,
      },
      {
        id: 'ca-strategy',
        type: 'info',
        title: 'Cascade Strategy',
        description: `• A 10+ chain shows a "CHAIN REACTION: CRITICAL MASS" banner.
• Score matters more than board control.
• Plan chains across multiple turns.
• Use Catalysts for quick chain starts.
• Amplifiers double your chain potential.
• The highest single chain often decides the match.`,
      },
    ],
  },

  [GAME_MODE.MELTDOWN]: {
    title: 'Meltdown',
    description: 'Critical mass thresholds decrease every 5 turns. Survive the decay.',
    steps: [
      {
        id: 'md-intro',
        type: 'info',
        title: 'Meltdown Mode',
        description: `The reactor's containment field is decaying.

EVERY 5 TURNS: System Degradation reduces critical mass of ALL cells by 1 (minimum 1).

This triggers sudden, massive involuntary chain reactions as stable positions cross new thresholds.

WIN CONDITION: Elimination-based. The player who manages pressure best survives.`,
      },
      {
        id: 'md-demo',
        type: 'interact',
        title: 'Normal Explosion',
        instruction: 'Place an orb to see a normal explosion. In Meltdown, the same setup would eventually explode on its own!',
        setupBoard: (b) => { setCell(b, 0, 4, 2, PLAYER.HUMAN); },
        getTargets: () => [[0, 4]],
        onComplete: () => 'Now imagine: after 5 turns, this cell would need 1 fewer orb to explode. After 10 turns, 2 fewer. The whole board becomes volatile.',
      },
      {
        id: 'md-strategy',
        type: 'info',
        title: 'Meltdown Strategy',
        description: `• Track the turn counter — degradation is predictable.
• Before a degradation event, reduce pressure on your own cells.
• Force the AI to hold high-pressure cells when degradation hits.
• Low-orb cells are safe; high-orb cells are ticking bombs.
• The late game is chaos — build for it.`,
      },
    ],
  },

  [GAME_MODE.SINGULARITY]: {
    title: 'Singularity',
    description: 'A micro-black hole in the center warps the board.',
    steps: [
      {
        id: 'sg-intro',
        type: 'info',
        title: 'Singularity Mode',
        description: `A micro-black hole has opened at the center of the grid.

The center 2×2 cells (positions 3,3 3,4 4,3 4,4) are replaced by the SINGULARITY.

• The Singularity CANNOT be claimed or place orbs on.
• Explosions that hit the Singularity are swallowed — orbs do not propagate.
• At the end of every round, the Singularity pulls 1 orb from every adjacent cell, erasing them.

WIN CONDITION: Elimination-based. Fight for the outer rings while the center is an active hazard.`,
      },
      {
        id: 'sg-demo',
        type: 'interact',
        title: 'Singularity in Action',
        instruction: 'Click this edge cell to trigger an explosion toward the center and watch the Singularity swallow it.',
        setupBoard: (b) => {
          for (let r = 3; r <= 4; r++) {
            for (let c = 3; c <= 4; c++) {
              b[r][c] = { owner: null, orbs: 0, type: CELL_TYPE.SINGULARITY, voidCharge: false };
            }
          }
          setCell(b, 2, 3, 3, PLAYER.HUMAN);
        },
        getTargets: () => [[2, 3]],
        onComplete: () => 'The explosion hit the Singularity — those orbs were swallowed! The Singularity blocks chain propagation through the center.',
      },
      {
        id: 'sg-strategy',
        type: 'info',
        title: 'Singularity Strategy',
        description: `• The center is dead — don't fight for it.
• The Singularity drains orbs from adjacent cells every round — avoid stacking orbs next to it.
• Use the Singularity as a shield: explosions can't pass through it.
• Fight for the perimeter and corners.
• The drain affects both players equally — plan around it.`,
      },
    ],
  },

  [GAME_MODE.OVERDRIVE]: {
    title: 'Overdrive',
    description: 'Chain reactions charge energy for special abilities.',
    steps: [
      {
        id: 'od-intro',
        type: 'info',
        title: 'Overdrive Mode',
        description: `Every chain reaction step charges your ENERGY METER.

ENERGY: Each explosion step = +1 Energy (only chains of 2+ give energy).

ABILITIES (once per turn):
• STABILIZE (3 Energy): Add +1 critical mass to one of your cells to prevent an explosion.
• QUANTUM LEAP (5 Energy): Place two orbs at once on your turn.

WIN CONDITION: Follows Cascade scoring (20 turns each). Highest score wins.`,
      },
      {
        id: 'od-demo',
        type: 'interact',
        title: 'Building Energy',
        instruction: 'Trigger a chain reaction to see how energy builds.',
        setupBoard: (b) => {
          setCell(b, 2, 2, 3, PLAYER.HUMAN);
          setCell(b, 2, 3, 3, PLAYER.HUMAN);
          setCell(b, 2, 4, 3, PLAYER.HUMAN);
        },
        getTargets: () => [[2, 2]],
        onComplete: (len) => `That ${len}-step chain generated ${len - 1} Energy! Build energy to use special abilities.`,
      },
      {
        id: 'od-strategy',
        type: 'info',
        title: 'Overdrive Strategy',
        description: `• Energy only comes from chains of 2+ steps.
• Stabilize is defensive — use it to prevent your own cells from exploding at bad times.
• Quantum Leap lets you double-place — great for triggering a chain the AI can't counter.
• Save 5 energy for Quantum Leap — it's the most powerful ability.
• In the late game, every orb counts — use abilities wisely.`,
      },
    ],
  },

  [GAME_MODE.BREACH]: {
    title: 'Breach',
    description: 'Asymmetric siege. AI controls the core, you control the perimeter.',
    steps: [
      {
        id: 'br-intro',
        type: 'info',
        title: 'Breach Mode',
        description: `An asymmetric game mode with completely different starting positions.

AI (CORAL): Controls the central 4×4 grid with pressurized cells and Amplifiers.
YOU (CYAN): Control the entire outer perimeter with 1 orb per cell.

WIN CONDITIONS:
• AI wins if it converts even ONE corner cell.
• You win if you eliminate ALL AI orbs from the core.
• Standard elimination also applies.

The AI acts as an exploding infection trying to breach outward.
You act as containment trying to collapse inward.`,
      },
      {
        id: 'br-demo',
        type: 'interact',
        title: 'Breach Battlefield',
        instruction: 'Click one of your perimeter cells to place an orb and push inward.',
        setupBoard: (b) => {
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const isPerimeter = r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;
              const isCore = r >= 2 && r <= 5 && c >= 2 && c <= 5;
              if (isCore) { b[r][c].owner = PLAYER.AI; b[r][c].orbs = 2; }
              if (isPerimeter) { b[r][c].owner = PLAYER.HUMAN; b[r][c].orbs = 1; }
            }
          }
        },
        getTargets: () => [[0, 0], [0, 7], [7, 0], [7, 7]],
        onComplete: () => 'Every orb counts in Breach. You must collapse the AI core before they reach your corners!',
      },
      {
        id: 'br-strategy',
        type: 'info',
        title: 'Breach Strategy',
        description: `• Defend your corners at all costs — one AI orb there and you lose.
• Push inward methodically — chain reactions are your best weapon.
• The AI has Amplifiers in the core — be careful attacking them directly.
• Use the perimeter to build pressure before striking inward.
• Focus fire: collapsing one side of the core is better than spreading thin.`,
      },
    ],
  },
};

const MODE_LIST = Object.entries(MODE_TUTORIALS).map(([id, m]) => ({ id, ...m }));

export default function Tutorial({ onClose }) {
  const [screen, setScreen] = useState('select');
  const [selectedMode, setSelectedMode] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [board, setBoard] = useState(() => makeEmptyBoard());
  const [explodingCells, setExplodingCells] = useState(new Set());
  const [phase, setPhase] = useState('ready');
  const [message, setMessage] = useState('');
  const [animDots, setAnimDots] = useState('');

  const busyRef = useRef(false);
  const boardRef = useRef(board);
  const stepRef = useRef(null);

  boardRef.current = board;

  useEffect(() => {
    return () => { busyRef.current = true; };
  }, []);

  useEffect(() => {
    if (phase !== 'animating') { setAnimDots(''); return; }
    const dots = ['.', '..', '...', ''];
    let i = 0;
    const id = setInterval(() => { i = (i + 1) % dots.length; setAnimDots(dots[i]); }, 300);
    return () => clearInterval(id);
  }, [phase]);

  function selectMode(modeId) {
    const tut = MODE_TUTORIALS[modeId];
    if (!tut) return;
    setSelectedMode(modeId);
    setStepIndex(0);
    setScreen('learning');
    setPhase('ready');
    setMessage('');
    setExplodingCells(new Set());
    busyRef.current = false;
    const firstStep = tut.steps[0];
    stepRef.current = firstStep;
    if (firstStep.type === 'interact' || firstStep.showBoard) {
      const b = buildBoard(firstStep);
      setBoard(b);
      boardRef.current = b;
    }
  }

  function goToStep(index) {
    const tut = MODE_TUTORIALS[selectedMode];
    if (!tut) return;
    const step = tut.steps[index];
    if (!step) return;
    stepRef.current = step;
    setStepIndex(index);
    setPhase('ready');
    setMessage('');
    setExplodingCells(new Set());
    busyRef.current = false;
    if (step.type === 'interact' || step.showBoard) {
      const b = buildBoard(step);
      setBoard(b);
      boardRef.current = b;
    }
  }

  async function handleCellClick(row, col) {
    const step = stepRef.current;
    if (busyRef.current || !step || step.type !== 'interact') return;
    const targets = step.getTargets();
    if (!targets.some(([r, c]) => r === row && c === col)) return;
    busyRef.current = true;
    setPhase('animating');
    const currentBoard = boardRef.current;
    const result = placeOrb(currentBoard, row, col, PLAYER.HUMAN);
    if (!result) { busyRef.current = false; setPhase('ready'); return; }
    const plan = getAnimationPlan(result.steps);
    for (const s of plan.frames) {
      if (busyRef.current === false) return;
      setExplodingCells(s.explodingCells);
      setBoard(s.boardSnapshot);
      await wait(plan.delay);
    }
    if (busyRef.current === false) return;
    setExplodingCells(new Set());
    setBoard(result.board);
    setPhase('done');
    busyRef.current = false;
    setMessage(step.onComplete(result.chainLength));
  }

  if (screen === 'select') {
    return (
      <div className="tutorial-overlay" role="dialog" aria-modal="true">
        <div className="tutorial-panel glass-panel">
          <div className="tutorial-header">
            <div>
              <h2 className="tutorial-step-title">Learn a Game Mode</h2>
            </div>
            <button className="ghost-button" onClick={onClose}>Close</button>
          </div>
          <p className="tutorial-subtitle" style={{ marginBottom: '0.5rem' }}>
            Choose a mode to learn. Each tutorial covers the rules, mechanics, and strategy.
          </p>
          <div className="tutorial-mode-grid">
            {MODE_LIST.map((mode) => (
              <button
                key={mode.id}
                className="tutorial-mode-card"
                onClick={() => selectMode(mode.id)}
              >
                <strong className="tutorial-mode-title">{mode.title}</strong>
                <p className="tutorial-mode-desc">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tut = selectedMode ? MODE_TUTORIALS[selectedMode] : null;
  if (!tut) return null;

  const step = tut.steps[stepIndex];
  if (!step) return null;

  const isInteract = step.type === 'interact';
  const targets = isInteract ? step.getTargets() : [];
  const isTargetCell = (r, c) => targets.some(([tr, tc]) => tr === r && tc === c);
  const showBoard = step.showBoard || isInteract;
  const totalSteps = tut.steps.length;
  const stepNumber = stepIndex + 1;
  const interactionDone = phase === 'done';

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true">
      <div className="tutorial-panel glass-panel">
        <div className="tutorial-header">
          <div>
            <span className="tutorial-step-badge">
              {tut.title} · STEP {stepNumber}/{totalSteps}
            </span>
            <h2 className="tutorial-step-title">{step.title}</h2>
          </div>
          <button className="ghost-button" onClick={() => setScreen('select')}>Modes</button>
        </div>

        <div className="tutorial-progress">
          <div className="tutorial-progress-track">
            <div className="tutorial-progress-fill" style={{ width: `${(stepNumber / totalSteps) * 100}%` }} />
          </div>
          <div className="tutorial-dots">
            {tut.steps.map((s, i) => (
              <span
                key={s.id}
                className={`tutorial-dot ${i === stepIndex ? 'tutorial-dot-active' : ''} ${i < stepIndex ? 'tutorial-dot-done' : ''}`}
                style={{ '--dot-color': s.type === 'interact' ? 'var(--cyan)' : 'var(--gold)' }}
              />
            ))}
          </div>
        </div>

        {!showBoard && (
          <div className="tutorial-description">
            {step.description.split('\n').map((line, i) => (
              <p key={i} style={{ margin: line.trim() === '' ? '0.6rem 0' : '0.2rem 0' }}>
                {line.trim() || '\u00A0'}
              </p>
            ))}
          </div>
        )}

        {showBoard && (
          <div className="tutorial-board-area">
            <div className="tutorial-board-wrapper">
              <div className="tutorial-board-grid">
                {board.map((rowData, rowIndex) =>
                  rowData.map((cell, colIndex) => {
                    const isTarget = isTargetCell(rowIndex, colIndex);
                    const isSpecialTarget = step.specialHighlight && cell.type === step.specialHighlight && isTarget;
                    const cellIsValid = isTarget && !interactionDone && phase !== 'animating';
                    const cellIsHint = isTarget && !interactionDone;

                    return (
                      <div key={`${rowIndex}-${colIndex}`} className="tutorial-cell-wrapper">
                        {isSpecialTarget && <div className="tutorial-special-glow" />}
                        <Cell
                          cell={cell}
                          row={rowIndex}
                          col={colIndex}
                          isValidMove={cellIsValid}
                          isExploding={explodingCells.has(`${rowIndex},${colIndex}`)}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          currentPlayer={PLAYER.HUMAN}
                          isHint={cellIsHint}
                          isCursor={false}
                          isLastMove={false}
                          isPlacing={false}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {isInteract && !interactionDone && phase !== 'animating' && (
              <div className="tutorial-instruction">
                <span className="tutorial-instruction-icon">{'>'}</span>
                <span className="tutorial-instruction-text">{step.instruction}</span>
              </div>
            )}

            {phase === 'animating' && (
              <div className="tutorial-instruction tutorial-animating">
                <span className="tutorial-animating-dots">Exploding{animDots}</span>
              </div>
            )}
          </div>
        )}

        {isInteract && interactionDone && message && (
          <div className="tutorial-result">
            <div className="tutorial-result-icon">{'✓'}</div>
            <p className="tutorial-result-text">{message}</p>
          </div>
        )}

        {isInteract && !interactionDone && phase !== 'animating' && (
          <p className="tutorial-hint-text">{step.hint || 'Click the highlighted cell.'}</p>
        )}

        {showBoard && !isInteract && (
          <div className="tutorial-description">
            {step.description.split('\n').map((line, i) => (
              <p key={i} style={{ margin: line.trim() === '' ? '0.6rem 0' : '0.2rem 0' }}>
                {line.trim() || '\u00A0'}
              </p>
            ))}
          </div>
        )}

        <div className="tutorial-footer">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="ghost-button"
              onClick={() => goToStep(stepIndex - 1)}
              disabled={stepIndex === 0}
            >
              Prev
            </button>
            <button className="ghost-button" onClick={() => setScreen('select')}>
              All Modes
            </button>
          </div>

          {stepIndex >= totalSteps - 1 ? (
            <button className="primary-button" onClick={() => setScreen('select')}>
              More Modes
            </button>
          ) : (!isInteract || interactionDone) ? (
            <button className="primary-button" onClick={() => goToStep(stepIndex + 1)}>
              Next
            </button>
          ) : (
            <button className="ghost-button" disabled style={{ opacity: 0.4 }}>
              {phase === 'animating' ? 'Exploding...' : 'Complete the action'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
