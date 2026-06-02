import { CELL_TYPE, COLS, PLAYER, ROWS, MELTDOWN_DEGRADE_INTERVAL, SINGULARITY_CELLS, GAME_MODE } from './constants.js';

export function getCriticalMass(row, col, cellType, meltdownBonus = 0) {
  if (cellType === CELL_TYPE.SINGULARITY) return Infinity;

  const isCorner = (row === 0 || row === ROWS - 1) && (col === 0 || col === COLS - 1);
  const isEdge = row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1;
  let base = isCorner ? 2 : isEdge ? 3 : 4;

  if (cellType === CELL_TYPE.CATALYST) {
    base = Math.max(1, base - 1);
  }

  return Math.max(1, base - meltdownBonus);
}

export function getNeighbors(row, col) {
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ].filter(([r, c]) => r >= 0 && r < ROWS && c >= 0 && c < COLS);
}

export function cloneBoard(board) {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function collectCriticalCells(board, meltdownBonus) {
  const queue = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = board[row][col];
      if (cell.orbs >= getCriticalMass(row, col, cell.type, meltdownBonus)) {
        queue.push([row, col]);
      }
    }
  }
  return queue;
}

export function processExplosions(inputBoard, meltdownBonus = 0) {
  const board = inputBoard;
  const queue = collectCriticalCells(board, meltdownBonus);
  const steps = [];
  let chainLength = 0;
  let iterations = 0;
  const maxIterations = ROWS * COLS * 20;

  while (queue.length > 0) {
    if (iterations > maxIterations) break;
    iterations += 1;

    const [row, col] = queue.shift();
    const cell = board[row][col];
    const cm = getCriticalMass(row, col, cell.type, meltdownBonus);

    if (cell.orbs < cm || cell.owner === null) continue;

    const owner = cell.owner;
    const orbsToSend = cell.type === CELL_TYPE.AMPLIFIER ? 2 : 1;
    const explodingCells = new Set([`${row},${col}`]);

    cell.orbs -= cm;
    if (cell.orbs === 0) cell.owner = null;

    for (const [nr, nc] of getNeighbors(row, col)) {
      const neighbor = board[nr][nc];

      if (neighbor.type === CELL_TYPE.SINGULARITY) {
        continue;
      }

      if (neighbor.type === CELL_TYPE.VOID && neighbor.voidCharge) {
        neighbor.voidCharge = false;
      } else {
        neighbor.orbs += orbsToSend;
        neighbor.owner = owner;
        if (neighbor.orbs >= getCriticalMass(nr, nc, neighbor.type, meltdownBonus)) {
          queue.push([nr, nc]);
        }
      }
    }

    chainLength += 1;
    steps.push({
      explodingCells,
      boardSnapshot: cloneBoard(board),
    });
  }

  return { board, chainLength, steps };
}

export function canPlace(board, row, col, player) {
  const cell = board[row]?.[col];
  return Boolean(cell && cell.type !== CELL_TYPE.SINGULARITY && (cell.owner === null || cell.owner === player));
}

export function placeOrb(board, row, col, player, meltdownBonus = 0) {
  if (!canPlace(board, row, col, player)) return null;

  const nextBoard = cloneBoard(board);
  nextBoard[row][col].orbs += 1;
  nextBoard[row][col].owner = player;

  const result = processExplosions(nextBoard, meltdownBonus);
  if (result.steps.length === 0) {
    result.steps.push({
      explodingCells: new Set(),
      boardSnapshot: cloneBoard(result.board),
    });
  }

  return result;
}

export function countOrbs(board) {
  const counts = { [PLAYER.HUMAN]: 0, [PLAYER.AI]: 0 };
  for (const row of board) {
    for (const cell of row) {
      if (cell.owner && cell.type !== CELL_TYPE.SINGULARITY) {
        counts[cell.owner] += cell.orbs;
      }
    }
  }
  return counts;
}

export function checkWinner(board, totalMoves) {
  if (totalMoves < 2) return null;
  const counts = countOrbs(board);
  if (counts[PLAYER.HUMAN] === 0 && counts[PLAYER.AI] > 0) return PLAYER.AI;
  if (counts[PLAYER.AI] === 0 && counts[PLAYER.HUMAN] > 0) return PLAYER.HUMAN;
  return null;
}

export function checkBreachWinner(board, totalMoves) {
  if (totalMoves < 2) return null;
  const counts = countOrbs(board);
  if (counts[PLAYER.HUMAN] === 0 && counts[PLAYER.AI] > 0) return PLAYER.AI;

  const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
  for (const [r, c] of corners) {
    if (board[r][c].owner === PLAYER.AI) return PLAYER.AI;
  }

  if (counts[PLAYER.AI] === 0 && counts[PLAYER.HUMAN] > 0) return PLAYER.HUMAN;

  let aiCoreAlive = false;
  for (let r = 2; r <= 5; r++) {
    for (let c = 2; c <= 5; c++) {
      if (board[r][c].owner === PLAYER.AI) aiCoreAlive = true;
    }
  }
  if (!aiCoreAlive && counts[PLAYER.HUMAN] > 0) return PLAYER.HUMAN;

  return null;
}

export function getValidMoves(board, player) {
  const moves = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (canPlace(board, row, col, player)) {
        moves.push([row, col]);
      }
    }
  }
  return moves;
}

export function getOpponent(player) {
  return player === PLAYER.HUMAN ? PLAYER.AI : PLAYER.HUMAN;
}

export function isSingularityCell(row, col) {
  for (const [r, c] of SINGULARITY_CELLS) {
    if (r === row && c === col) return true;
  }
  return false;
}

export function getMeltdownBonus(turn) {
  return Math.floor(turn / MELTDOWN_DEGRADE_INTERVAL);
}

export function applySingularityDrain(board) {
  const newBoard = cloneBoard(board);
  const drained = { human: 0, ai: 0 };
  for (const [sr, sc] of SINGULARITY_CELLS) {
    for (const [nr, nc] of getNeighbors(sr, sc)) {
      const cell = newBoard[nr][nc];
      if (cell.owner && cell.orbs > 0) {
        drained[cell.owner] += 1;
        cell.orbs -= 1;
        if (cell.orbs === 0) cell.owner = null;
      }
    }
  }
  return { board: newBoard, drained };
}

export function applyMeltdownDegradation(board, meltdownBonus) {
  if (meltdownBonus <= 0) return { board, triggered: [] };
  const newBoard = cloneBoard(board);
  const triggered = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = newBoard[r][c];
      if (cell.orbs > 0 && cell.type !== CELL_TYPE.SINGULARITY) {
        const cm = getCriticalMass(r, c, cell.type, meltdownBonus);
        if (cell.orbs >= cm) {
          triggered.push([r, c]);
        }
      }
    }
  }

  if (triggered.length > 0) {
    const result = processExplosions(newBoard, meltdownBonus);
    return { board: result.board, triggered, steps: result.steps };
  }

  return { board: newBoard, triggered: [] };
}
