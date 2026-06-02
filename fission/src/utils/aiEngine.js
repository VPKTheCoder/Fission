import { CELL_TYPE, DIFFICULTY, GAME_MODE, PLAYER } from './constants.js';
import {
  checkWinner,
  getCriticalMass,
  getOpponent,
  getValidMoves,
  placeOrb,
} from './gameLogic.js';

function evalConquest(board, player) {
  const opponent = getOpponent(player);
  let score = 0;

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const cell = board[row][col];
      const criticalMass = getCriticalMass(row, col, cell.type);
      const pressure = cell.orbs / criticalMass - 1;

      if (cell.owner === player) {
        score += cell.orbs * 2;
        score += pressure * 4;
        if (cell.type === CELL_TYPE.AMPLIFIER) score += 12;
        if (cell.type === CELL_TYPE.CATALYST) score += 6;
      }

      if (cell.owner === opponent) {
        score -= cell.orbs * 2;
        score -= pressure * 3;
        if (cell.type === CELL_TYPE.AMPLIFIER) score -= 14;
        if (cell.type === CELL_TYPE.CATALYST) score -= 7;
      }
    }
  }

  return score;
}

function evalCascade(scores, player) {
  const opponent = getOpponent(player);
  return (scores?.[player] ?? 0) - (scores?.[opponent] ?? 0);
}

function evaluate(board, player, mode, scores) {
  if (mode === GAME_MODE.CASCADE) {
    return evalCascade(scores, player) + evalConquest(board, player) * 0.08;
  }
  return evalConquest(board, player);
}

function movePriority(board, row, col) {
  const cell = board[row][col];
  const willExplode = cell.orbs + 1 >= getCriticalMass(row, col, cell.type);

  if (cell.type === CELL_TYPE.AMPLIFIER) return 0;
  if (willExplode) return 1;
  if (cell.type === CELL_TYPE.CATALYST) return 2;
  return 3;
}

function orderMoves(board, moves) {
  return [...moves].sort((a, b) => {
    const priority = movePriority(board, a[0], a[1]) - movePriority(board, b[0], b[1]);
    if (priority !== 0) return priority;
    const aDistance = Math.abs(a[0] - 3.5) + Math.abs(a[1] - 3.5);
    const bDistance = Math.abs(b[0] - 3.5) + Math.abs(b[1] - 3.5);
    return aDistance - bDistance;
  });
}

function nextScores(scores, player, chainLength, mode) {
  if (mode !== GAME_MODE.CASCADE) {
    return scores;
  }

  return {
    ...scores,
    [player]: (scores?.[player] ?? 0) + Math.max(1, chainLength),
  };
}

function minimax(board, depth, alpha, beta, isMaximizing, player, mode, scores, startTime, timeLimit) {
  if (Date.now() - startTime > timeLimit) {
    return { score: evalConquest(board, player) };
  }
  if (depth === 0) {
    return { score: evaluate(board, player, mode, scores) };
  }

  const opponent = getOpponent(player);
  const winner = checkWinner(board, 99);
  if (winner === player) return { score: 10000 + depth };
  if (winner === opponent) return { score: -10000 - depth };

  const activePlayer = isMaximizing ? player : opponent;
  const moves = orderMoves(board, getValidMoves(board, activePlayer));
  if (moves.length === 0) return { score: 0 };

  let bestMove = null;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const [row, col] of moves) {
      const result = placeOrb(board, row, col, activePlayer);
      if (!result) continue;

      const scoreState = nextScores(scores, activePlayer, result.chainLength, mode);
      const child = minimax(result.board, depth - 1, alpha, beta, false, player, mode, scoreState, startTime, timeLimit);
      if (child.score > bestScore) {
        bestScore = child.score;
        bestMove = { row, col };
      }
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break;
    }
    return { score: bestScore, move: bestMove };
  }

  let bestScore = Infinity;
  for (const [row, col] of moves) {
    const result = placeOrb(board, row, col, activePlayer);
    if (!result) continue;

    const scoreState = nextScores(scores, activePlayer, result.chainLength, mode);
    const child = minimax(result.board, depth - 1, alpha, beta, true, player, mode, scoreState, startTime, timeLimit);
    if (child.score < bestScore) {
      bestScore = child.score;
      bestMove = { row, col };
    }
    beta = Math.min(beta, bestScore);
    if (beta <= alpha) break;
  }
  return { score: bestScore, move: bestMove };
}

const DIFFICULTY_SETTINGS = {
  [DIFFICULTY.EASY]: { depth: 1, timeLimit: 200, randomChance: 0.6 },
  [DIFFICULTY.NORMAL]: { depth: 2, timeLimit: 500, randomChance: 0.1 },
  [DIFFICULTY.HARD]: { depth: 3, timeLimit: 800, randomChance: 0 },
};

function pickRandom(moves) {
  return moves[Math.floor(Math.random() * moves.length)];
}

export function getAIMove(board, difficulty, mode, scores = { human: 0, ai: 0 }) {
  return new Promise((resolve) => {
    const run = () => {
      const moves = orderMoves(board, getValidMoves(board, PLAYER.AI));
      if (moves.length === 0) {
        resolve(null);
        return;
      }

      const settings = DIFFICULTY_SETTINGS[difficulty] ?? DIFFICULTY_SETTINGS[DIFFICULTY.NORMAL];
      if (Math.random() < settings.randomChance) {
        const [row, col] = pickRandom(difficulty === DIFFICULTY.NORMAL ? moves.slice(0, 3) : moves);
        resolve({ row, col });
        return;
      }

      const result = minimax(
        board,
        settings.depth,
        -Infinity,
        Infinity,
        true,
        PLAYER.AI,
        mode,
        scores,
        Date.now(),
        settings.timeLimit
      );
      const move = result.move ?? { row: moves[0][0], col: moves[0][1] };
      resolve(move);
    };

    setTimeout(run, 0);
  });
}

export { evalConquest, evalCascade };
