import { CELL_TYPE, COLS, ROWS, SPECIAL_CELLS } from './constants.js';

export function generateBoard() {
  const board = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      owner: null,
      orbs: 0,
      type: CELL_TYPE.NORMAL,
      voidCharge: false,
    }))
  );

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

  return board;
}
