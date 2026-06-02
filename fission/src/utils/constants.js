export const ROWS = 8;
export const COLS = 8;

export const PLAYER = { HUMAN: 'human', AI: 'ai' };

export const CELL_TYPE = {
  NORMAL: 'normal',
  CATALYST: 'catalyst',
  VOID: 'void',
  AMPLIFIER: 'amplifier',
};

export const GAME_MODE = {
  CONQUEST: 'conquest',
  CASCADE: 'cascade',
};

export const DIFFICULTY = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
};

export const CASCADE_TURNS_EACH = 20;

export const SPECIAL_CELLS = {
  CATALYST: [[1, 1], [1, 6], [6, 1], [6, 6]],
  VOID: [[0, 3], [3, 7], [7, 4]],
  AMPLIFIER: [[3, 3], [4, 4]],
};
