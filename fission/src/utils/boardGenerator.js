import { CELL_TYPE, COLS, ROWS, SPECIAL_CELLS, GAME_MODE, PLAYER, SINGULARITY_CELLS } from './constants.js';

function createBaseBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      owner: null,
      orbs: 0,
      type: CELL_TYPE.NORMAL,
      voidCharge: false,
    }))
  );
}

function applySpecialCells(board) {
  for (const [row, col] of SPECIAL_CELLS.CATALYST) {
    board[row][col].type = CELL_TYPE.CATALYST;
  }
  for (const [row, col] of SPECIAL_CELLS.VOID) {
    board[row][col].type = CELL_TYPE.VOID;
    board[row][col].voidCharge = true;
  }
  for (const [row, col] of SPECIAL_CELLS.AMPLIFIER) {
    board[row][col].type = CELL_TYPE.AMPLIFIER;
  }
}

export function generateBoard(mode = GAME_MODE.CONQUEST) {
  if (mode === GAME_MODE.BREACH) return generateBreachBoard();
  if (mode === GAME_MODE.SINGULARITY) return generateSingularityBoard();

  const board = createBaseBoard();
  applySpecialCells(board);
  return board;
}

function generateSingularityBoard() {
  const board = createBaseBoard();
  applySpecialCells(board);
  for (const [r, c] of SINGULARITY_CELLS) {
    board[r][c] = {
      owner: null,
      orbs: 0,
      type: CELL_TYPE.SINGULARITY,
      voidCharge: false,
    };
  }
  return board;
}

function generateBreachBoard() {
  const board = createBaseBoard();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const isPerimeter = r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;
      const isCore = r >= 2 && r <= 5 && c >= 2 && c <= 5;

      if (isCore) {
        board[r][c].owner = PLAYER.AI;
        board[r][c].orbs = 2;
      }

      if (isPerimeter) {
        board[r][c].owner = PLAYER.HUMAN;
        board[r][c].orbs = 1;
      }
    }
  }

  return board;
}
