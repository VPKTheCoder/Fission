import { useState, useEffect, useRef } from 'react';
import Cell from './Cell.jsx';
import { PLAYER, CELL_TYPE, ROWS, COLS } from '../utils/constants.js';
import { generateBoard } from '../utils/boardGenerator.js';
import { placeOrb } from '../utils/gameLogic.js';

const STEP_DELAY = 80;

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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

const STEPS = [
  {
    id: 'welcome',
    type: 'info',
    title: 'Welcome to FISSION',
    subtitle: 'Interactive Guided Tutorial',
    description: `FISSION is a two-player territory strategy game played on an 8×8 grid.

You (cyan) play against an AI opponent (coral).

Place orbs on cells to claim territory. When a cell reaches its critical mass, it explodes — sending orbs to neighboring cells and converting them to your color. This can trigger devastating chain reactions.

There are two game modes:
  CONQUEST — Eliminate all enemy orbs. Last player standing wins.
  CASCADE — Chain reactions score points. 20 turns each. Highest score wins.

Let's play through every scenario you'll face.`,
  },
  {
    id: 'board-layout',
    type: 'info',
    title: 'The Board',
    description: `The 8×8 board is divided into three cell types by position:
  CORNERS — Critical mass: 2 (red boundary)
  EDGES   — Critical mass: 3 (orange boundary)
  INTERIOR — Critical mass: 4 (blue boundary)

Three special cells are fixed on every board:
  CATALYST (gold, ⚡) — Lower critical mass by 1 (min 1)
  VOID (purple, 🛡️) — Absorbs one incoming explosion, then depletes
  AMPLIFIER (green, 📡) — Sends 2 orbs to each neighbor when exploding

The board below shows these regions and cells.`,
    showBoard: true,
    highlightRegions: true,
  },
  {
    id: 'placement',
    type: 'interact',
    title: 'Orb Placement',
    instruction: 'Click the highlighted cell to place your first orb.',
    setupBoard: (board) => {},
    getTargets: () => [[4, 4]],
    onComplete: () => 'Your orb has been placed! That cell now belongs to you (cyan).',
    hint: 'Click the glowing cell at row 4, column 4.',
  },
  {
    id: 'build-up',
    type: 'interact',
    title: 'Building Orbs',
    instruction: 'Place an orb on your own cell to increase its orb count.',
    setupBoard: (board) => {
      setCell(board, 4, 4, 1, PLAYER.HUMAN);
    },
    getTargets: () => [[4, 4]],
    onComplete: () => 'Now this cell has 2 orbs. The more orbs a cell has, the closer it is to exploding!',
    hint: 'Click your own cell at (4,4) again.',
  },
  {
    id: 'critical-mass',
    type: 'interact',
    title: 'Critical Mass & Explosions',
    instruction: 'This edge cell needs 1 more orb to reach critical mass (3). Click it to trigger an explosion!',
    setupBoard: (board) => {
      setCell(board, 0, 4, 2, PLAYER.HUMAN);
    },
    getTargets: () => [[0, 4]],
    onComplete: () => 'The cell reached critical mass and exploded! Orbs were sent to neighboring cells, converting them to your color. After an explosion, a cell loses orbs equal to its critical mass.',
    hint: 'Click cell (0,4) to trigger the explosion.',
  },
  {
    id: 'chain-reaction',
    type: 'interact',
    title: 'Chain Reactions',
    instruction: 'This setup will trigger a chain reaction. Click the highlighted cell to start the cascade!',
    setupBoard: (board) => {
      setCell(board, 2, 2, 3, PLAYER.HUMAN);
      setCell(board, 2, 3, 3, PLAYER.HUMAN);
      setCell(board, 2, 4, 3, PLAYER.HUMAN);
    },
    getTargets: () => [[2, 2]],
    onComplete: (len) => len >= 2
      ? `Chain reaction! ${len} cells exploded in sequence. Each explosion triggered the next. Watch for these — they can flip large sections of the board in a single move!`
      : 'The cell exploded! Try to set up chains where one explosion feeds into another.',
    hint: 'Click (2,2) to start the chain reaction.',
  },
  {
    id: 'catalyst',
    type: 'interact',
    title: 'Catalyst Cells',
    instruction: 'Catalyst cells have lower critical mass. This catalyst needs 1 more orb to explode (normally 4, reduced to 3). Click it!',
    setupBoard: (board) => {
      board[1][1].owner = PLAYER.HUMAN;
      board[1][1].orbs = 2;
    },
    getTargets: () => [[1, 1]],
    onComplete: () => 'The Catalyst exploded sooner than a normal cell would! Catalysts reduce critical mass by 1 — great for starting chain reactions early.',
    hint: 'Click the golden Catalyst cell at (1,1).',
    specialHighlight: CELL_TYPE.CATALYST,
  },
  {
    id: 'void',
    type: 'interact',
    title: 'Void Cells',
    instruction: 'The cell at (0,3) is a charged Void — it will absorb the first explosion directed at it. Click (0,2) to trigger an explosion toward the Void.',
    setupBoard: (board) => {
      board[0][3].voidCharge = true;
      setCell(board, 0, 2, 2, PLAYER.HUMAN);
    },
    getTargets: () => [[0, 2]],
    onComplete: () => 'The Void absorbed the explosion from that direction! It is now depleted (grayed out). A depleted Void no longer blocks explosions — use this strategically.',
    hint: 'Click (0,2) to trigger an explosion and see the Void in action.',
  },
  {
    id: 'amplifier',
    type: 'interact',
    title: 'Amplifier Cells',
    instruction: 'Amplifiers send 2 orbs to each neighbor when they explode (instead of 1). This one has 3 orbs — place one more to set it off!',
    setupBoard: (board) => {
      setCell(board, 3, 3, 3, PLAYER.HUMAN);
    },
    getTargets: () => [[3, 3]],
    onComplete: () => 'The Amplifier sent 2 orbs to every neighbor! That is double the normal output. Amplifiers are the most powerful cells on the board — contest them aggressively.',
    hint: 'Click the green Amplifier at (3,3).',
    specialHighlight: CELL_TYPE.AMPLIFIER,
  },
  {
    id: 'conquest',
    type: 'info',
    title: 'Conquest Mode',
    description: `OBJECTIVE: Eliminate all enemy orbs.

• The game starts counting elimination after both players have placed at least one orb.
• If either player has 0 orbs on the board, the opponent wins.
• Chain reactions can wipe out clusters of enemy cells in one move.
• Focus on building stable territory while creating pressure near enemy cells.
• Catalysts and Amplifiers are key battlegrounds.

Tip: Avoid giving the AI easy chain reactions. Watch their cells nearing critical mass.`,
    showBoard: true,
    showConquestDemo: true,
  },
  {
    id: 'cascade',
    type: 'info',
    title: 'Cascade Mode',
    description: `OBJECTIVE: Score the most points through chain reactions.

• Both players get 20 turns each (40 total turns).
• Each move scores: Max(1, chain length).
  — No explosion or 1-step = 1 point
  — 6-step chain = 6 points
• Highest score after all turns wins. Draws are possible.
• Cascade rewards planned chain reactions even if they don't eliminate.
• Long chains are worth more — set up cascades across the board.

Tip: Watch for chains of 10+ — a "CHAIN REACTION: CRITICAL MASS" banner appears!`,
    showBoard: true,
    showCascadeDemo: true,
  },
  {
    id: 'tips',
    type: 'info',
    title: 'Pro Tips',
    description: `CONTROLS:
  Click — Place orb on selected cell
  Arrow keys — Navigate board cursor
  Enter/Space — Place orb at cursor
  ? or / — Show hint (suggested move)
  H — Toggle move history
  M — Toggle sound

STRATEGY:
  • Catalysts explode sooner — use them to start chains
  • Amplifiers are the most valuable cells — fight for the center
  • Voids can block a chain route — deplete them when convenient
  • A small explosion near an Amplifier can become a large chain
  • Pressure cells near critical mass to create threats
  • In Conquest, removing the opponent's last orb wins instantly
  • In Cascade, a high-scoring chain matters more than board control`,
  },
  {
    id: 'complete',
    type: 'info',
    title: 'You Are Ready!',
    description: `You have learned all the scenarios in FISSION:

✓ Orb placement and building
✓ Critical mass and explosions
✓ Chain reactions
✓ Catalyst, Void, and Amplifier cells
✓ Conquest and Cascade modes

Now it's time to play! Apply these skills to defeat the AI.`,
    isFinal: true,
  },
];

const HIGHLIGHT_REGIONS = [
  { label: 'Corner (CM: 2)', cells: [[0, 0], [0, 7], [7, 0], [7, 7]], color: 'var(--coral)' },
  { label: 'Edge (CM: 3)', cells: [[0, 1], [0, 2], [0, 4], [0, 5], [0, 6], [1, 0], [1, 7], [2, 0], [2, 7], [3, 0], [3, 7], [4, 0], [4, 7], [5, 0], [5, 7], [6, 0], [6, 7], [7, 1], [7, 2], [7, 3], [7, 5], [7, 6]], color: 'var(--gold)' },
  { label: 'Interior (CM: 4)', cells: [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6]], color: 'var(--cyan)' },
];

function getRegionClass(row, col) {
  for (const region of HIGHLIGHT_REGIONS) {
    for (const [r, c] of region.cells) {
      if (r === row && c === col) return region.color;
    }
  }
  return null;
}

export default function Tutorial({ onClose }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [board, setBoard] = useState(() => buildBoard(STEPS[0]));
  const [explodingCells, setExplodingCells] = useState(new Set());
  const [phase, setPhase] = useState('ready');
  const [message, setMessage] = useState('');
  const [animDots, setAnimDots] = useState('');

  const busyRef = useRef(false);
  const boardRef = useRef(board);
  const stepRef = useRef(STEPS[0]);
  boardRef.current = board;
  stepRef.current = STEPS[stepIndex];

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

  function goToStep(index) {
    const step = STEPS[index];
    const needsBoard = step.type === 'interact' || step.showBoard;
    if (needsBoard) {
      setBoard(buildBoard(step));
    }
    boardRef.current = needsBoard ? buildBoard(step) : boardRef.current;
    stepRef.current = step;
    setStepIndex(index);
    setPhase('ready');
    setMessage('');
    setExplodingCells(new Set());
    busyRef.current = false;
  }

  async function handleCellClick(row, col) {
    const step = stepRef.current;
    if (busyRef.current || step.type !== 'interact') return;

    const targets = step.getTargets();
    if (!targets.some(([r, c]) => r === row && c === col)) return;

    busyRef.current = true;
    setPhase('animating');

    const currentBoard = boardRef.current;
    const result = placeOrb(currentBoard, row, col, PLAYER.HUMAN);
    if (!result) {
      busyRef.current = false;
      setPhase('ready');
      return;
    }

    for (const s of result.steps) {
      if (busyRef.current === false) return;
      setExplodingCells(s.explodingCells);
      setBoard(s.boardSnapshot);
      await wait(STEP_DELAY);
    }

    if (busyRef.current === false) return;
    setExplodingCells(new Set());
    setBoard(result.board);
    setPhase('done');
    busyRef.current = false;
    setMessage(step.onComplete(result.chainLength));
  }

  const step = STEPS[stepIndex];
  const isInteract = step.type === 'interact';
  const targets = isInteract ? step.getTargets() : [];
  const isTargetCell = (r, c) => targets.some(([tr, tc]) => tr === r && tc === c);
  const showBoard = step.showBoard || isInteract;
  const totalSteps = STEPS.length;
  const stepNumber = stepIndex + 1;
  const interactionDone = phase === 'done';

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true">
      <div className="tutorial-panel glass-panel">
        <div className="tutorial-header">
          <div>
            <span className="tutorial-step-badge">STEP {stepNumber}/{totalSteps}</span>
            <h2 className="tutorial-step-title">{step.title}</h2>
          </div>
          <button className="ghost-button" onClick={onClose}>Close</button>
        </div>

        {step.subtitle && (
          <p className="tutorial-subtitle">{step.subtitle}</p>
        )}

        <div className="tutorial-progress">
          <div className="tutorial-progress-track">
            <div className="tutorial-progress-fill" style={{ width: `${(stepNumber / totalSteps) * 100}%` }} />
          </div>
          <div className="tutorial-dots">
            {STEPS.map((s, i) => (
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
                    const regionColor = step.highlightRegions ? getRegionClass(rowIndex, colIndex) : null;
                    const isSpecialTarget = step.specialHighlight && cell.type === step.specialHighlight && isTarget;
                    const cellIsValid = isTarget && !interactionDone && phase !== 'animating';
                    const cellIsHint = isTarget && !interactionDone;

                    return (
                      <div key={`${rowIndex}-${colIndex}`} className="tutorial-cell-wrapper">
                        {step.highlightRegions && regionColor && (
                          <div className="tutorial-region-border" style={{ '--region-color': regionColor }} />
                        )}
                        {isSpecialTarget && (
                          <div className="tutorial-special-glow" />
                        )}
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
                        {step.highlightRegions && (rowIndex === 0 || rowIndex === 7 || colIndex === 0 || colIndex === 7) && (
                          <span className="tutorial-edge-marker" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {step.highlightRegions && (
              <div className="tutorial-legend-bar">
                {HIGHLIGHT_REGIONS.map((r) => (
                  <span key={r.label} className="tutorial-legend-item">
                    <span className="tutorial-legend-swatch" style={{ background: r.color }} />
                    {r.label}
                  </span>
                ))}
                <span className="tutorial-legend-item">
                  <span className="tutorial-legend-swatch tutorial-legend-special" />
                  Catalyst / Void / Amplifier
                </span>
              </div>
            )}

            {step.showConquestDemo && (
              <div className="tutorial-conquest-demo">
                <div className="tutorial-demo-info">
                  <strong>Conquest Scenario:</strong> Two players battle for board control.
                  Each orb you place brings you closer to eliminating your opponent.
                  Chain reactions can wipe out entire clusters — aim for high-pressure setups.
                </div>
              </div>
            )}

            {step.showCascadeDemo && (
              <div className="tutorial-conquest-demo">
                <div className="tutorial-demo-info">
                  <strong>Cascade Scenario:</strong> Every move scores points based on chain length.
                  A move with no explosion scores 1 point. A 10-cell chain scores 10.
                  Plan chains that cascade across the board for maximum points!
                </div>
              </div>
            )}

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
          <p className="tutorial-hint-text">{step.hint}</p>
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
          <button
            className="ghost-button"
            onClick={() => goToStep(stepIndex - 1)}
            disabled={stepIndex === 0}
          >
            Prev
          </button>

          <div className="tutorial-footer-center">
            {step.id === 'welcome' && (
              <button className="primary-button" onClick={() => goToStep(1)}>
                Begin Tutorial
              </button>
            )}
          </div>

          {stepIndex >= STEPS.length - 1 ? (
            <button className="primary-button" onClick={onClose}>
              Play Game
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
