import { CELL_TYPE, COLS, PLAYER, ROWS } from './constants.js';

export function getCriticalMass(row, col, cellType) {
  const isCorner = (row === 0 || row === ROWS - 1) && (col === 0 || col === COLS - 1);
  const isEdge = row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1;
  const base = isCorner ? 2 : isEdge ? 3 : 4;

  if (cellType === CELL_TYPE.CATALYST) {
    return Math.max(1, base - 1);
  }

  return base;
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

function collectCriticalCells(board) {
  const queue = [];

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = board[row][col];
      if (cell.orbs >= getCriticalMass(row, col, cell.type)) {
        queue.push([row, col]);
      }
    }
  }

  return queue;
}

export function processExplosions(inputBoard) {
  const board = inputBoard;
  const queue = collectCriticalCells(board);
  const steps = [];
  let chainLength = 0;
  let iterations = 0;
  const maxIterations = ROWS * COLS * 20;

  while (queue.length > 0) {
    if (iterations > maxIterations) {
      break;
    }
    iterations += 1;

    const [row, col] = queue.shift();
    const cell = board[row][col];
    const cm = getCriticalMass(row, col, cell.type);

    if (cell.orbs < cm || cell.owner === null) {
      continue;
    }

    const owner = cell.owner;
    const orbsToSend = cell.type === CELL_TYPE.AMPLIFIER ? 2 : 1;
    const explodingCells = new Set([`${row},${col}`]);

    cell.orbs -= cm;
    if (cell.orbs === 0) {
      cell.owner = null;
    }

    for (const [nr, nc] of getNeighbors(row, col)) {
      const neighbor = board[nr][nc];

      if (neighbor.type === CELL_TYPE.VOID && neighbor.voidCharge) {
        neighbor.voidCharge = false;
      } else {
        neighbor.orbs += orbsToSend;
        neighbor.owner = owner;
        if (neighbor.orbs >= getCriticalMass(nr, nc, neighbor.type)) {
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
  return Boolean(cell && (cell.owner === null || cell.owner === player));
}

export function placeOrb(board, row, col, player) {
  if (!canPlace(board, row, col, player)) {
    return null;
  }

  const nextBoard = cloneBoard(board);
  nextBoard[row][col].orbs += 1;
  nextBoard[row][col].owner = player;

  const result = processExplosions(nextBoard);
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
      if (cell.owner) {
        counts[cell.owner] += cell.orbs;
      }
    }
  }

  return counts;
}

export function checkWinner(board, totalMoves) {
  if (totalMoves < 2) {
    return null;
  }

  const counts = countOrbs(board);
  if (counts[PLAYER.HUMAN] === 0 && counts[PLAYER.AI] > 0) {
    return PLAYER.AI;
  }
  if (counts[PLAYER.AI] === 0 && counts[PLAYER.HUMAN] > 0) {
    return PLAYER.HUMAN;
  }

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
