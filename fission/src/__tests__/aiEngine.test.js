import { describe, it, expect } from 'vitest';
import { CELL_TYPE, PLAYER, GAME_MODE, DIFFICULTY, ROWS, COLS } from '../utils/constants.js';
import { evalConquest, evalCascade, getAIMove } from '../utils/aiEngine.js';

function emptyCell(type = CELL_TYPE.NORMAL) {
  return { owner: null, orbs: 0, type, voidCharge: type === CELL_TYPE.VOID };
}

function makeBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => emptyCell())
  );
}

describe('evalConquest', () => {
  it('returns 0 for empty board', () => {
    const board = makeBoard();
    expect(evalConquest(board, PLAYER.HUMAN)).toBe(0);
  });

  it('gives positive score for owned orbs', () => {
    const board = makeBoard();
    board[3][3].orbs = 2;
    board[3][3].owner = PLAYER.HUMAN;
    expect(evalConquest(board, PLAYER.HUMAN)).toBeGreaterThan(0);
  });

  it('gives negative score for opponent orbs', () => {
    const board = makeBoard();
    board[3][3].orbs = 2;
    board[3][3].owner = PLAYER.AI;
    expect(evalConquest(board, PLAYER.HUMAN)).toBeLessThan(0);
  });

  it('values amplifier cells higher', () => {
    const board = makeBoard();
    const board2 = makeBoard();
    board[3][3].orbs = 1;
    board[3][3].owner = PLAYER.HUMAN;
    board[3][3].type = CELL_TYPE.NORMAL;
    board2[3][3].orbs = 1;
    board2[3][3].owner = PLAYER.HUMAN;
    board2[3][3].type = CELL_TYPE.AMPLIFIER;
    expect(evalConquest(board2, PLAYER.HUMAN)).toBeGreaterThan(evalConquest(board, PLAYER.HUMAN));
  });
});

describe('evalCascade', () => {
  it('returns the score difference', () => {
    const scores = { [PLAYER.HUMAN]: 10, [PLAYER.AI]: 5 };
    expect(evalCascade(scores, PLAYER.HUMAN)).toBe(5);
    expect(evalCascade(scores, PLAYER.AI)).toBe(-5);
  });

  it('returns 0 when no scores exist', () => {
    expect(evalCascade(null, PLAYER.HUMAN)).toBe(0);
  });
});

describe('getAIMove', () => {
  it('returns a valid move on a fresh board', async () => {
    const board = makeBoard();
    const move = await getAIMove(board, DIFFICULTY.EASY, GAME_MODE.CONQUEST);
    expect(move).not.toBeNull();
    expect(typeof move.row).toBe('number');
    expect(typeof move.col).toBe('number');
    expect(move.row).toBeGreaterThanOrEqual(0);
    expect(move.row).toBeLessThan(ROWS);
    expect(move.col).toBeGreaterThanOrEqual(0);
    expect(move.col).toBeLessThan(COLS);
  }, 10000);

  it('returns null when no moves are available', async () => {
    const board = makeBoard();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        board[r][c].type = CELL_TYPE.SINGULARITY;
      }
    }
    const move = await getAIMove(board, DIFFICULTY.HARD, GAME_MODE.CONQUEST);
    expect(move).toBeNull();
  }, 10000);

  it('handles cascade mode without crashing', async () => {
    const board = makeBoard();
    const scores = { [PLAYER.HUMAN]: 0, [PLAYER.AI]: 0 };
    const move = await getAIMove(board, DIFFICULTY.NORMAL, GAME_MODE.CASCADE, scores);
    expect(move).not.toBeNull();
  }, 10000);

  it('handles hard difficulty without crashing', async () => {
    const board = makeBoard();
    const move = await getAIMove(board, DIFFICULTY.HARD, GAME_MODE.CONQUEST);
    expect(move).not.toBeNull();
  }, 15000);
});
