import { describe, it, expect } from 'vitest';
import { ROWS, COLS, CELL_TYPE, PLAYER, GAME_MODE, SINGULARITY_CELLS, MELTDOWN_DEGRADE_INTERVAL } from '../utils/constants.js';
import {
  getCriticalMass,
  getNeighbors,
  cloneBoard,
  processExplosions,
  canPlace,
  placeOrb,
  countOrbs,
  checkWinner,
  checkBreachWinner,
  getValidMoves,
  getOpponent,
  getMeltdownBonus,
  applySingularityDrain,
  applyMeltdownDegradation,
} from '../utils/gameLogic.js';

function emptyCell(type = CELL_TYPE.NORMAL) {
  return { owner: null, orbs: 0, type, voidCharge: type === CELL_TYPE.VOID };
}

function makeBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => emptyCell())
  );
}

describe('getCriticalMass', () => {
  it('returns 2 for corners', () => {
    expect(getCriticalMass(0, 0, CELL_TYPE.NORMAL)).toBe(2);
    expect(getCriticalMass(0, 7, CELL_TYPE.NORMAL)).toBe(2);
    expect(getCriticalMass(7, 0, CELL_TYPE.NORMAL)).toBe(2);
    expect(getCriticalMass(7, 7, CELL_TYPE.NORMAL)).toBe(2);
  });

  it('returns 3 for edges (non-corner)', () => {
    expect(getCriticalMass(0, 3, CELL_TYPE.NORMAL)).toBe(3);
    expect(getCriticalMass(3, 0, CELL_TYPE.NORMAL)).toBe(3);
    expect(getCriticalMass(7, 4, CELL_TYPE.NORMAL)).toBe(3);
  });

  it('returns 4 for center cells', () => {
    expect(getCriticalMass(3, 3, CELL_TYPE.NORMAL)).toBe(4);
    expect(getCriticalMass(4, 5, CELL_TYPE.NORMAL)).toBe(4);
  });

  it('reduces by 1 for catalyst (minimum 1)', () => {
    expect(getCriticalMass(0, 0, CELL_TYPE.CATALYST)).toBe(1);
    expect(getCriticalMass(3, 3, CELL_TYPE.CATALYST)).toBe(3);
  });

  it('returns Infinity for singularity', () => {
    expect(getCriticalMass(3, 3, CELL_TYPE.SINGULARITY)).toBe(Infinity);
  });

  it('applies meltdown bonus', () => {
    expect(getCriticalMass(3, 3, CELL_TYPE.NORMAL, 1)).toBe(3);
    expect(getCriticalMass(3, 3, CELL_TYPE.NORMAL, 3)).toBe(1);
    expect(getCriticalMass(3, 3, CELL_TYPE.NORMAL, 5)).toBe(1);
    expect(getCriticalMass(0, 0, CELL_TYPE.CATALYST, 1)).toBe(1);
  });
});

describe('getNeighbors', () => {
  it('returns 4 neighbors for center cell', () => {
    const n = getNeighbors(3, 3);
    expect(n).toHaveLength(4);
    expect(n).toContainEqual([2, 3]);
    expect(n).toContainEqual([4, 3]);
    expect(n).toContainEqual([3, 2]);
    expect(n).toContainEqual([3, 4]);
  });

  it('returns 2 neighbors for corner', () => {
    expect(getNeighbors(0, 0)).toHaveLength(2);
    expect(getNeighbors(7, 7)).toHaveLength(2);
  });

  it('returns 3 neighbors for edge', () => {
    expect(getNeighbors(0, 3)).toHaveLength(3);
    expect(getNeighbors(4, 0)).toHaveLength(3);
  });
});

describe('cloneBoard', () => {
  it('creates a deep copy', () => {
    const board = makeBoard();
    board[0][0].orbs = 3;
    board[0][0].owner = PLAYER.HUMAN;
    const clone = cloneBoard(board);
    expect(clone[0][0].orbs).toBe(3);
    expect(clone[0][0].owner).toBe(PLAYER.HUMAN);
    clone[0][0].orbs = 99;
    expect(board[0][0].orbs).toBe(3);
  });
});

describe('canPlace', () => {
  it('allows placing on empty normal cell', () => {
    const board = makeBoard();
    expect(canPlace(board, 3, 3, PLAYER.HUMAN)).toBe(true);
  });

  it('allows placing on owned cell', () => {
    const board = makeBoard();
    board[3][3].owner = PLAYER.HUMAN;
    board[3][3].orbs = 1;
    expect(canPlace(board, 3, 3, PLAYER.HUMAN)).toBe(true);
  });

  it('disallows placing on opponent cell', () => {
    const board = makeBoard();
    board[3][3].owner = PLAYER.AI;
    board[3][3].orbs = 1;
    expect(canPlace(board, 3, 3, PLAYER.HUMAN)).toBe(false);
  });

  it('disallows placing on singularity', () => {
    const board = makeBoard();
    board[3][3].type = CELL_TYPE.SINGULARITY;
    expect(canPlace(board, 3, 3, PLAYER.HUMAN)).toBe(false);
  });

  it('returns false for out of bounds', () => {
    const board = makeBoard();
    expect(canPlace(board, -1, 0, PLAYER.HUMAN)).toBe(false);
    expect(canPlace(board, 8, 8, PLAYER.HUMAN)).toBe(false);
  });
});

describe('processExplosions', () => {
  it('does nothing on a stable board', () => {
    const board = makeBoard();
    const result = processExplosions(board);
    expect(result.chainLength).toBe(0);
    expect(result.steps).toHaveLength(0);
  });

  it('handles a single explosion at a corner', () => {
    const board = makeBoard();
    board[0][0].orbs = 2;
    board[0][0].owner = PLAYER.HUMAN;
    const result = processExplosions(board);
    expect(result.chainLength).toBe(1);
    expect(result.board[0][0].orbs).toBe(0);
    expect(result.board[0][1].owner).toBe(PLAYER.HUMAN);
    expect(result.board[1][0].owner).toBe(PLAYER.HUMAN);
  });

  it('handles a chain reaction', () => {
    const board = makeBoard();
    board[0][0].orbs = 2;
    board[0][0].owner = PLAYER.HUMAN;
    board[0][1].orbs = 3;
    board[0][1].owner = PLAYER.HUMAN;
    const result = processExplosions(board);
    expect(result.chainLength).toBeGreaterThanOrEqual(1);
  });

  it('amplifier sends 2 orbs to each neighbor', () => {
    const board = makeBoard();
    board[3][3].type = CELL_TYPE.AMPLIFIER;
    board[3][3].orbs = 4;
    board[3][3].owner = PLAYER.HUMAN;
    const result = processExplosions(board);
    expect(result.board[2][3].orbs).toBe(2);
    expect(result.board[3][2].orbs).toBe(2);
    expect(result.board[3][4].orbs).toBe(2);
    expect(result.board[4][3].orbs).toBe(2);
  });

  it('void absorbs an explosion and becomes depleted', () => {
    const board = makeBoard();
    board[0][0].orbs = 2;
    board[0][0].owner = PLAYER.HUMAN;
    board[0][1].type = CELL_TYPE.VOID;
    board[0][1].voidCharge = true;
    const result = processExplosions(board);
    expect(result.board[0][1].voidCharge).toBe(false);
    expect(result.board[0][1].orbs).toBe(0);
  });

  it('singularity blocks explosion propagation', () => {
    const board = makeBoard();
    board[0][0].orbs = 2;
    board[0][0].owner = PLAYER.HUMAN;
    board[0][1].type = CELL_TYPE.SINGULARITY;
    const result = processExplosions(board);
    expect(result.board[0][1].owner).toBeNull();
    expect(result.chainLength).toBe(1);
  });

  it('does not mutate the input board', () => {
    const board = makeBoard();
    board[0][0].orbs = 2;
    board[0][0].owner = PLAYER.HUMAN;
    const snapshot = cloneBoard(board);
    processExplosions(board);
    expect(board).toEqual(snapshot);
  });
});

describe('placeOrb', () => {
  it('places an orb and triggers explosions', () => {
    const board = makeBoard();
    board[0][0].orbs = 1;
    board[0][0].owner = PLAYER.HUMAN;
    const result = placeOrb(board, 0, 0, PLAYER.HUMAN);
    expect(result).not.toBeNull();
    expect(result.board[0][0].orbs).toBe(0);
  });

  it('returns null for invalid placement', () => {
    const board = makeBoard();
    board[0][1].owner = PLAYER.AI;
    const result = placeOrb(board, 0, 1, PLAYER.HUMAN);
    expect(result).toBeNull();
  });

  it('includes a step even when no explosion occurs', () => {
    const board = makeBoard();
    const result = placeOrb(board, 3, 3, PLAYER.HUMAN);
    expect(result).not.toBeNull();
    expect(result.steps).toHaveLength(1);
    expect(result.chainLength).toBe(0);
  });
});

describe('countOrbs', () => {
  it('counts orbs for each player', () => {
    const board = makeBoard();
    board[0][0].orbs = 2;
    board[0][0].owner = PLAYER.HUMAN;
    board[1][1].orbs = 1;
    board[1][1].owner = PLAYER.AI;
    const counts = countOrbs(board);
    expect(counts[PLAYER.HUMAN]).toBe(2);
    expect(counts[PLAYER.AI]).toBe(1);
  });

  it('does not count singularity cells', () => {
    const board = makeBoard();
    board[3][3].type = CELL_TYPE.SINGULARITY;
    board[3][3].orbs = 99;
    board[3][3].owner = PLAYER.HUMAN;
    expect(countOrbs(board)[PLAYER.HUMAN]).toBe(0);
  });
});

describe('checkWinner', () => {
  it('returns null before any moves', () => {
    const board = makeBoard();
    expect(checkWinner(board, 0)).toBeNull();
  });

  it('returns null when both players have orbs', () => {
    const board = makeBoard();
    board[0][0].orbs = 1;
    board[0][0].owner = PLAYER.HUMAN;
    board[7][7].orbs = 1;
    board[7][7].owner = PLAYER.AI;
    expect(checkWinner(board, 2)).toBeNull();
  });

  it('returns PLAYER.HUMAN when AI has no orbs', () => {
    const board = makeBoard();
    board[0][0].orbs = 1;
    board[0][0].owner = PLAYER.HUMAN;
    expect(checkWinner(board, 2)).toBe(PLAYER.HUMAN);
  });
});

describe('checkBreachWinner', () => {
  it('detects AI corner capture', () => {
    const board = makeBoard();
    board[0][0].owner = PLAYER.AI;
    board[0][0].orbs = 1;
    board[0][1].owner = PLAYER.HUMAN;
    board[0][1].orbs = 1;
    expect(checkBreachWinner(board, 2)).toBe(PLAYER.AI);
  });

  it('detects human win when AI core eliminated', () => {
    const board = makeBoard();
    board[2][2].owner = PLAYER.HUMAN;
    board[2][2].orbs = 1;
    expect(checkBreachWinner(board, 2)).toBe(PLAYER.HUMAN);
  });
});

describe('getValidMoves', () => {
  it('returns all empty cells for a fresh board', () => {
    const board = makeBoard();
    board[3][3].type = CELL_TYPE.SINGULARITY;
    const moves = getValidMoves(board, PLAYER.HUMAN);
    expect(moves).toHaveLength(ROWS * COLS - 1);
  });
});

describe('getOpponent', () => {
  it('returns AI for human', () => {
    expect(getOpponent(PLAYER.HUMAN)).toBe(PLAYER.AI);
  });

  it('returns human for AI', () => {
    expect(getOpponent(PLAYER.AI)).toBe(PLAYER.HUMAN);
  });
});

describe('getMeltdownBonus', () => {
  it('increases every MELTDOWN_DEGRADE_INTERVAL turns', () => {
    expect(getMeltdownBonus(0)).toBe(0);
    expect(getMeltdownBonus(MELTDOWN_DEGRADE_INTERVAL)).toBe(1);
    expect(getMeltdownBonus(MELTDOWN_DEGRADE_INTERVAL * 3)).toBe(3);
  });
});

describe('applySingularityDrain', () => {
  it('drains 1 orb from each neighbor of each singularity', () => {
    const board = makeBoard();
    board[2][3].orbs = 3;
    board[2][3].owner = PLAYER.HUMAN;
    board[3][2].orbs = 2;
    board[3][2].owner = PLAYER.AI;
    const result = applySingularityDrain(board);
    expect(result.board[2][3].orbs).toBe(2);
    expect(result.board[3][2].orbs).toBe(1);
    expect(result.drained.human).toBe(1);
    expect(result.drained.ai).toBe(1);
  });

  it('sets owner to null when orbs reach 0', () => {
    const board = makeBoard();
    board[2][3].orbs = 1;
    board[2][3].owner = PLAYER.HUMAN;
    const result = applySingularityDrain(board);
    expect(result.board[2][3].orbs).toBe(0);
    expect(result.board[2][3].owner).toBeNull();
  });
});

describe('applyMeltdownDegradation', () => {
  it('does nothing when bonus is 0', () => {
    const board = makeBoard();
    const result = applyMeltdownDegradation(board, 0);
    expect(result.triggered).toHaveLength(0);
  });

  it('triggers explosions on cells that exceed reduced critical mass', () => {
    const board = makeBoard();
    board[3][3].orbs = 3;
    board[3][3].owner = PLAYER.HUMAN;
    const result = applyMeltdownDegradation(board, 1);
    expect(result.triggered.length).toBeGreaterThanOrEqual(1);
  });
});
