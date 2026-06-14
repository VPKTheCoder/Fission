import { CELL_TYPE, DIFFICULTY, GAME_MODE, PLAYER, OVERDRIVE_STABILIZE_COST, OVERDRIVE_QUANTUM_COST, ROWS, COLS, SINGULARITY_CELLS } from './constants.js';
import {
  checkWinner, checkBreachWinner, getCriticalMass, getOpponent,
  getValidMoves, placeOrb, getMeltdownBonus, applySingularityDrain, getNeighbors,
} from './gameLogic.js';

const NEIGHBORS_CACHE = Array.from({ length: ROWS }, (_, row) =>
  Array.from({ length: COLS }, (_, col) => {
    const n = [];
    if (row > 0) n.push([row - 1, col]);
    if (row < ROWS - 1) n.push([row + 1, col]);
    if (col > 0) n.push([row, col - 1]);
    if (col < COLS - 1) n.push([row, col + 1]);
    return n;
  })
);

function getPosWeight(row, col) {
  const isEdge = row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1;
  const isCorner = (row === 0 || row === ROWS - 1) && (col === 0 || col === COLS - 1);
  return isCorner ? 0.9 : isEdge ? 1.0 : 1.15;
}

function countMobility(board, player) {
  const opponent = getOpponent(player);
  let ours = 0;
  let theirs = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (!cell || cell.type === CELL_TYPE.SINGULARITY) continue;
      if (cell.owner === null) { ours++; theirs++; }
      else if (cell.owner === player) ours++;
      else theirs++;
    }
  }
  return ours - theirs;
}

function evalConquest(board, player, meltBonus = 0) {
  const opponent = getOpponent(player);
  let score = 0;

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const cell = board[row][col];
      if (cell.type === CELL_TYPE.SINGULARITY) continue;
      const cm = getCriticalMass(row, col, cell.type, meltBonus);
      const pw = getPosWeight(row, col);
      const pressure = (cell.orbs / cm) - 1;

      if (cell.owner === player) {
        score += cell.orbs * 2 * pw;
        score += pressure * 5;
        if (cell.type === CELL_TYPE.AMPLIFIER) score += 16;
        if (cell.type === CELL_TYPE.CATALYST) score += 9;
        if (cell.orbs + 1 >= cm) score += 3;
        if (cell.type === CELL_TYPE.VOID && cell.voidCharge) score += 5;
        for (const [nr, nc] of NEIGHBORS_CACHE[row][col]) {
          if (board[nr][nc]?.owner === player) score += 0.4;
        }
      }

      if (cell.owner === opponent) {
        score -= cell.orbs * 2 * pw;
        score -= pressure * 5;
        if (cell.type === CELL_TYPE.AMPLIFIER) score -= 19;
        if (cell.type === CELL_TYPE.CATALYST) score -= 11;
        if (cell.orbs + 1 >= cm) score -= 5;
        if (cell.type === CELL_TYPE.VOID && cell.voidCharge) score -= 5;
        for (const [nr, nc] of NEIGHBORS_CACHE[row][col]) {
          if (board[nr][nc]?.owner === opponent) score -= 0.4;
        }
      }
    }
  }

  return score;
}

function evalCascade(scores, player) {
  const opponent = getOpponent(player);
  return (scores?.[player] ?? 0) - (scores?.[opponent] ?? 0);
}

function evalBreach(board, player, meltBonus = 0) {
  const opponent = getOpponent(player);
  let score = evalConquest(board, player, meltBonus);

  const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
  for (const [r, c] of corners) {
    if (board[r][c]?.owner === player) score += 50;
    if (board[r][c]?.owner === opponent) score -= 80;
  }

  for (let r = 2; r <= 5; r++) {
    for (let c = 2; c <= 5; c++) {
      const cell = board[r][c];
      if (cell?.owner === player) score += 10;
      if (cell?.owner === opponent) score -= 5;
    }
  }

  return score;
}

function evalSingularityBonus(board, player) {
  const opponent = getOpponent(player);
  let bonus = 0;
  for (const [sr, sc] of SINGULARITY_CELLS) {
    for (const [nr, nc] of NEIGHBORS_CACHE[sr][sc]) {
      const cell = board[nr][nc];
      if (!cell.owner) continue;
      if (cell.owner === player) {
        bonus -= cell.orbs * 0.6;
        if (cell.orbs === 0) bonus += 2;
      } else {
        bonus += cell.orbs * 0.4;
        if (cell.orbs === 0) bonus -= 1;
      }
    }
  }
  return bonus;
}

function evaluate(board, player, mode, scores, meltBonus = 0) {
  if (mode === GAME_MODE.BREACH) return evalBreach(board, player, meltBonus);
  const conquest = evalConquest(board, player, meltBonus);
  const mobility = countMobility(board, player) * 1.5;
  if (mode === GAME_MODE.CASCADE || mode === GAME_MODE.OVERDRIVE) {
    return evalCascade(scores, player) + conquest * 0.12 + mobility;
  }
  if (mode === GAME_MODE.SINGULARITY) {
    return conquest + evalSingularityBonus(board, player) + mobility;
  }
  return conquest + mobility;
}

function movePriority(board, row, col, mode, turn) {
  const cell = board[row][col];
  if (!cell || cell.type === CELL_TYPE.SINGULARITY) return 99;
  const bonus = mode === GAME_MODE.MELTDOWN ? getMeltdownBonus(turn) : 0;
  const cm = getCriticalMass(row, col, cell.type, bonus);
  const willExplode = cell.orbs + 1 >= cm;

  if (cell.type === CELL_TYPE.AMPLIFIER) return 0;
  if (willExplode) return 1;
  if (cell.orbs + 2 >= cm) return 2;
  if (cell.type === CELL_TYPE.CATALYST) return 3;
  return 4;
}

function orderMoves(board, moves, mode, turn) {
  return [...moves].sort((a, b) => {
    const pa = movePriority(board, a[0], a[1], mode, turn);
    const pb = movePriority(board, b[0], b[1], mode, turn);
    if (pa !== pb) return pa - pb;
    const aDr = a[0] - 3.5;
    const aDc = a[1] - 3.5;
    const bDr = b[0] - 3.5;
    const bDc = b[1] - 3.5;
    return (aDr * aDr + aDc * aDc) - (bDr * bDr + bDc * bDc);
  });
}

function nextScores(scores, player, chainLength, mode) {
  if (mode === GAME_MODE.CASCADE || mode === GAME_MODE.OVERDRIVE) {
    return { ...scores, [player]: (scores?.[player] ?? 0) + Math.max(1, chainLength) };
  }
  return scores;
}

function getGameWinner(board, mode) {
  if (mode === GAME_MODE.BREACH) return checkBreachWinner(board, 99);
  return checkWinner(board, 99);
}

function quiescence(board, alpha, beta, isMaximizing, player, mode, scores, startTime, timeLimit, turn, searchState, qDepth) {
  if (Date.now() - startTime > timeLimit) {
    if (searchState) searchState.timedOut = true;
    const meltBonus = mode === GAME_MODE.MELTDOWN ? getMeltdownBonus(turn) : 0;
    return evaluate(board, player, mode, scores, meltBonus);
  }

  const winner = getGameWinner(board, mode);
  if (winner === player) return 10000;
  if (winner === getOpponent(player)) return -10000;

  const meltBonus = mode === GAME_MODE.MELTDOWN ? getMeltdownBonus(turn) : 0;
  const standPat = evaluate(board, player, mode, scores, meltBonus);

  if (isMaximizing) {
    if (standPat >= beta) return standPat;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return standPat;
    if (standPat < beta) beta = standPat;
  }

  const activePlayer = isMaximizing ? player : getOpponent(player);
  const moves = getValidMoves(board, activePlayer);

  const volatile = [];
  for (const [row, col] of moves) {
    const cell = board[row][col];
    const cm = getCriticalMass(row, col, cell.type, meltBonus);
    if (cell.orbs + 1 >= cm) volatile.push([row, col]);
  }

  if (volatile.length === 0) return standPat;
  if (qDepth >= 10) return standPat;

  if (isMaximizing) {
    let best = -Infinity;
    for (const [row, col] of volatile) {
      const result = placeOrb(board, row, col, activePlayer, meltBonus);
      if (!result) continue;
      let simBoard = result.board;
      if (mode === GAME_MODE.SINGULARITY) {
        simBoard = applySingularityDrain(simBoard).board;
      }
      const scoreState = nextScores(scores, activePlayer, result.chainLength, mode);
      const score = quiescence(simBoard, alpha, beta, false, player, mode, scoreState, startTime, timeLimit, turn, searchState, qDepth + 1);
      if (score > best) best = score;
      if (score > alpha) alpha = score;
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const [row, col] of volatile) {
    const result = placeOrb(board, row, col, activePlayer, meltBonus);
    if (!result) continue;
    let simBoard = result.board;
    if (mode === GAME_MODE.SINGULARITY) {
      simBoard = applySingularityDrain(simBoard).board;
    }
    const scoreState = nextScores(scores, activePlayer, result.chainLength, mode);
    const score = quiescence(simBoard, alpha, beta, true, player, mode, scoreState, startTime, timeLimit, turn, searchState, qDepth + 1);
    if (score < best) best = score;
    if (score < beta) beta = score;
    if (beta <= alpha) break;
  }
  return best;
}

function minimax(board, depth, alpha, beta, isMaximizing, player, mode, scores, startTime, timeLimit, turn, searchState) {
  if (Date.now() - startTime > timeLimit) {
    if (searchState) searchState.timedOut = true;
    const meltBonus = mode === GAME_MODE.MELTDOWN ? getMeltdownBonus(turn) : 0;
    return { score: evalConquest(board, player, meltBonus) };
  }
  if (depth === 0) {
    return { score: quiescence(board, alpha, beta, isMaximizing, player, mode, scores, startTime, timeLimit, turn, searchState, 0) };
  }

  const opponent = getOpponent(player);
  const meltBonus = mode === GAME_MODE.MELTDOWN ? getMeltdownBonus(turn) : 0;

  const winner = getGameWinner(board, mode);
  if (winner === player) return { score: 10000 + depth };
  if (winner === opponent) return { score: -10000 - depth };

  const activePlayer = isMaximizing ? player : opponent;
  const moves = orderMoves(board, getValidMoves(board, activePlayer), mode, turn);
  if (moves.length === 0) return { score: 0 };

  let bestMove = null;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const [row, col] of moves) {
      const result = placeOrb(board, row, col, activePlayer, meltBonus);
      if (!result) continue;
      let simBoard = result.board;
      if (mode === GAME_MODE.SINGULARITY) {
        simBoard = applySingularityDrain(simBoard).board;
      }
      const scoreState = nextScores(scores, activePlayer, result.chainLength, mode);
      const nextTurn = turn + 1;
      const child = minimax(simBoard, depth - 1, alpha, beta, false, player, mode, scoreState, startTime, timeLimit, nextTurn, searchState);
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
    const result = placeOrb(board, row, col, activePlayer, meltBonus);
    if (!result) continue;
    let simBoard = result.board;
    if (mode === GAME_MODE.SINGULARITY) {
      simBoard = applySingularityDrain(simBoard).board;
    }
    const scoreState = nextScores(scores, activePlayer, result.chainLength, mode);
      const nextTurn = turn + 1;
      const child = minimax(simBoard, depth - 1, alpha, beta, true, player, mode, scoreState, startTime, timeLimit, nextTurn, searchState);
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
  [DIFFICULTY.HARD]: { depth: 6, timeLimit: 2500, randomChance: 0 },
};

const MODE_DEPTH_BOOST = {
  [GAME_MODE.CONQUEST]: 1,
  [GAME_MODE.SINGULARITY]: 1,
  [GAME_MODE.BREACH]: 1,
  [GAME_MODE.OVERDRIVE]: 1,
  [GAME_MODE.MELTDOWN]: 1,
  [GAME_MODE.CASCADE]: 1,
};

function getEffectiveSettings(difficulty, mode) {
  const base = DIFFICULTY_SETTINGS[difficulty] ?? DIFFICULTY_SETTINGS[DIFFICULTY.NORMAL];
  if (difficulty !== DIFFICULTY.HARD) return base;
  const boost = MODE_DEPTH_BOOST[mode] ?? 0;
  return { depth: base.depth + boost, timeLimit: base.timeLimit + boost * 400, randomChance: base.randomChance };
}

function pickRandom(moves) {
  return moves[Math.floor(Math.random() * moves.length)];
}

export function tryOverdriveAbilities(board, mode, difficulty, scores, overdriveEnergy, settings, orderedMoves, turn = 0) {
  if (mode !== GAME_MODE.OVERDRIVE || difficulty !== DIFFICULTY.HARD) return null;

  const energy = overdriveEnergy?.[PLAYER.AI] ?? 0;
  const topMoves = (orderedMoves || orderMoves(board, getValidMoves(board, PLAYER.AI), mode, turn)).slice(0, 8);
  if (topMoves.length === 0) return null;

  let normalBestScore = -Infinity;
  for (const [row, col] of topMoves) {
    const result = placeOrb(board, row, col, PLAYER.AI, 0);
    if (!result) continue;
    let simBoard = result.board;
    if (mode === GAME_MODE.SINGULARITY) {
      simBoard = applySingularityDrain(simBoard).board;
    }
    const scoreState = { ...scores, [PLAYER.AI]: (scores?.[PLAYER.AI] ?? 0) + Math.max(1, result.chainLength) };
    const score = evaluate(simBoard, PLAYER.AI, mode, scoreState);
    if (score > normalBestScore) normalBestScore = score;
  }

  let bestResult = null;

  if (energy >= OVERDRIVE_QUANTUM_COST) {
    for (const [row, col] of topMoves) {
      const result = placeOrb(board, row, col, PLAYER.AI, 0, { quantumMultiplier: 2 });
      if (!result) continue;
      let simBoard = result.board;
      if (mode === GAME_MODE.SINGULARITY) {
        simBoard = applySingularityDrain(simBoard).board;
      }
      const scoreState = { ...scores, [PLAYER.AI]: (scores?.[PLAYER.AI] ?? 0) + Math.max(1, result.chainLength) };
      const score = evaluate(simBoard, PLAYER.AI, mode, scoreState);
      if (score > (bestResult?.score ?? -Infinity)) {
        bestResult = { row, col, ability: 'quantum', score };
      }
    }
  }

  if (energy >= OVERDRIVE_STABILIZE_COST) {
    const threatened = [];
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        const cell = board[r][c];
        if (cell.owner === PLAYER.AI && cell.type !== CELL_TYPE.SINGULARITY) {
          const cm = getCriticalMass(r, c, cell.type);
          if (cell.orbs + 1 >= cm) threatened.push([r, c]);
        }
      }
    }
    const topThreatened = threatened.sort((a, b) => board[b[0]][b[1]].orbs - board[a[0]][a[1]].orbs).slice(0, 3);
    for (const [tr, tc] of topThreatened) {
      for (const [row, col] of topMoves) {
        if (row === tr && col === tc) continue;
        const result = placeOrb(board, row, col, PLAYER.AI, 0, { stabilizeCells: [[tr, tc]] });
        if (!result) continue;
        let simBoard = result.board;
        const scoreState = { ...scores, [PLAYER.AI]: (scores?.[PLAYER.AI] ?? 0) + Math.max(1, result.chainLength) };
        const score = evaluate(simBoard, PLAYER.AI, mode, scoreState);
        if (score > (bestResult?.score ?? -Infinity)) {
          bestResult = { row, col, stabilizeTarget: { row: tr, col: tc }, ability: 'stabilize', score };
        }
      }
    }
  }

  if (bestResult && bestResult.score > normalBestScore + 15) {
    return bestResult;
  }

  return null;
}

export function getAIMove(board, difficulty, mode, scores = { human: 0, ai: 0 }, overdriveEnergy = { human: 0, ai: 0 }, turn = 0) {
  return new Promise((resolve) => {
    const run = () => {
      const moves = orderMoves(board, getValidMoves(board, PLAYER.AI), mode, turn);
      if (moves.length === 0) {
        resolve(null);
        return;
      }

      const settings = getEffectiveSettings(difficulty, mode);
      if (Math.random() < settings.randomChance) {
        const [row, col] = pickRandom(difficulty === DIFFICULTY.NORMAL ? moves.slice(0, 3) : moves);
        resolve({ row, col });
        return;
      }

      const abilityResult = tryOverdriveAbilities(board, mode, difficulty, scores, overdriveEnergy, settings, moves, turn);
      if (abilityResult) {
        resolve(abilityResult);
        return;
      }

      const startTime = Date.now();
      const maxDepth = settings.depth;
      const timeLimit = settings.timeLimit;

      let bestResult = null;
      let prevScore = 0;
      let windowSize = 150;
      const searchState = {};

      for (let depth = 1; depth <= maxDepth; depth++) {
        const elapsed = Date.now() - startTime;
        const remaining = timeLimit - elapsed;
        if (remaining < 300) break;

        searchState.timedOut = false;

        let result;
        if (depth <= 2 || !bestResult) {
          result = minimax(
            board, depth, -Infinity, Infinity, true,
            PLAYER.AI, mode, scores, startTime, remaining, 0, searchState,
          );
        } else {
          const aspAlpha = prevScore - windowSize;
          const aspBeta = prevScore + windowSize;
          result = minimax(
            board, depth, aspAlpha, aspBeta, true,
            PLAYER.AI, mode, scores, startTime, remaining, 0, searchState,
          );

          if (!searchState.timedOut && (result.score <= aspAlpha || result.score >= aspBeta)) {
            searchState.timedOut = false;
            const remaining2 = timeLimit - (Date.now() - startTime);
            if (remaining2 > 200) {
              result = minimax(
                board, depth, -Infinity, Infinity, true,
                PLAYER.AI, mode, scores, startTime, remaining2, 0, searchState,
              );
            }
          }
        }

        if (result && result.move && !searchState.timedOut) {
          bestResult = result;
          if (depth > 1) {
            prevScore = result.score;
            windowSize = Math.max(80, Math.abs(result.score) * 0.15);
          } else {
            prevScore = result.score;
          }
        } else {
          break;
        }
      }

      const move = bestResult?.move ?? { row: moves[0][0], col: moves[0][1] };
      resolve(move);
    };

    setTimeout(run, 0);
  });
}

export { evalConquest, evalCascade };
