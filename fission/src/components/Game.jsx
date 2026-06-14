import { useState, useCallback, useEffect, useRef } from 'react';
import Board from './Board.jsx';
import HUD from './HUD.jsx';
import { useAI } from '../hooks/useAI.js';
import { useGame } from '../hooks/useGame.js';
import { useSound } from '../hooks/useSound.js';
import AbilityBar from './AbilityBar.jsx';
import { GAME_MODE, PLAYER, CELL_TYPE } from '../utils/constants.js';
import { getValidMoves, getCriticalMass, canPlace } from '../utils/gameLogic.js';

function getHint(board, mode) {
  const moves = getValidMoves(board, PLAYER.HUMAN);
  if (moves.length === 0) return null;
  let bestScore = -Infinity;
  let bestMove = null;
  for (const [row, col] of moves) {
    const cell = board[row][col];
    let score = 0;
    if (cell.type === CELL_TYPE.AMPLIFIER) score += 10;
    if (cell.type === CELL_TYPE.CATALYST) score += 5;
    const cm = getCriticalMass(row, col, cell.type);
    const pressure = cell.orbs / cm;
    score += pressure * 5;
    if (cell.owner === PLAYER.HUMAN) score += 2;
    if (cell.owner === null) score += 1;
    if (score > bestScore) {
      bestScore = score;
      bestMove = { row, col };
    }
  }
  return bestMove;
}

export default function Game({ mode, difficulty, isTwoPlayer = false, onGameOver, onMainMenu, onAnnounce }) {
  const sound = useSound();
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [chainBanner, setChainBanner] = useState(null);
  const [toast, setToast] = useState(null);
  const [cursorPos, setCursorPos] = useState({ row: 4, col: 4 });
  const [hintCell, setHintCell] = useState(null);
  const [placingCell, setPlacingCell] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const statsRef = useRef({ longestChain: 0, cellsConverted: 0, specialCells: 0, totalTurns: 0 });
  const prevBoardRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const gameRef = useRef(null);

  const wrappedOnGameOver = useCallback((winner, scores) => {
    const finalStats = { ...statsRef.current, totalTurns: statsRef.current.totalTurns };
    onGameOver(winner, scores, finalStats);
  }, [onGameOver]);

  const game = useGame({ mode, onGameOver: wrappedOnGameOver, isTwoPlayer });
  gameRef.current = game;

  const isHumanTurn = Boolean(game && !game.isAnimating && (isTwoPlayer || game.currentPlayer === PLAYER.HUMAN));

  const handleAIMoveWrapper = useCallback(async (move) => {
    const g = gameRef.current;
    if (!g) return false;
    const result = await g.handleAIMove(move);
    if (result && move) {
      setLastMove({ row: move.row, col: move.col });
      setMoveHistory((h) => [...h, {
        player: PLAYER.AI, row: move.row, col: move.col, chain: 0, score: 0,
      }]);
      setHintCell(null);
    }
    return result;
  }, []);

  const { isThinking } = useAI(isTwoPlayer ? {} : {
    board: game.board,
    currentPlayer: game.currentPlayer,
    difficulty,
    mode,
    scores: game.scores,
    isAnimating: game.isAnimating,
    winner: game.winner,
    onMove: handleAIMoveWrapper,
    overdriveEnergy: game.overdriveEnergy,
    turn: game.turn,
  });

  const handleCellClick = useCallback(async (row, col) => {
    const g = gameRef.current;
    if (!g) return false;
    const player = g.currentPlayer;
    if (!canPlace(g.board, row, col, player)) return false;
    setPlacingCell({ row, col });
    sound.playPlace();
    const result = await g.handleCellClick(row, col);
    if (result) {
      setLastMove({ row, col });
      setMoveHistory((h) => [...h, {
        player, row, col, chain: 0, score: 0,
      }]);
      setCursorPos({ row, col });
      setHintCell(null);
    }
    setPlacingCell(null);
    return result;
  }, [sound]);

  useEffect(() => {
    if (game.lastChainLength <= 0) return;
    const len = game.lastChainLength;
    const score = mode === GAME_MODE.CASCADE ? Math.max(1, len) : 0;

    setMoveHistory((h) => {
      if (h.length === 0) return h;
      const updated = [...h];
      const last = { ...updated[updated.length - 1] };
      last.chain = len;
      last.score = score;
      updated[updated.length - 1] = last;
      return updated;
    });

    if (len > statsRef.current.longestChain) {
      statsRef.current.longestChain = len;
    }
    statsRef.current.totalTurns += 1;

    if (len >= 10) {
      setChainBanner(`CHAIN REACTION: ${len} steps`);
      setTimeout(() => setChainBanner(null), 2500);
    }
    if (len >= 3) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      setStatusMessage(`Chain reaction: ${len} explosions!`);
      setTimeout(() => setStatusMessage(''), 2500);
    }
    if (mode === GAME_MODE.CASCADE && game.scores) {
      const humanScore = game.scores[PLAYER.HUMAN];
      if (humanScore === 42) {
        setToast('The answer to life, the universe, and everything.');
        setTimeout(() => setToast(null), 3500);
      }
    }
  }, [game.lastChainLength, game.scores, mode]);

  useEffect(() => {
    if (game.winner) {
      const label = game.winner === 'draw' ? 'Draw' : game.winner === PLAYER.HUMAN ? (isTwoPlayer ? 'Player 1 wins' : 'Victory') : (isTwoPlayer ? 'Player 2 wins' : 'Defeat');
      document.title = `${label} | FISSION`;
    } else if (isThinking) {
      document.title = 'AI is thinking... | FISSION';
    } else if (isTwoPlayer) {
      document.title = `Player ${game.currentPlayer === PLAYER.HUMAN ? '1' : '2'}'s turn | FISSION`;
    } else {
      document.title = game.currentPlayer === PLAYER.HUMAN ? 'Your turn | FISSION' : 'AI is thinking... | FISSION';
    }
  }, [game.currentPlayer, game.winner, isThinking, isTwoPlayer]);

  useEffect(() => {
    if (!isTwoPlayer && game.currentPlayer === PLAYER.AI && !game.isAnimating && !game.winner) {
      setStatusMessage('AI is thinking...');
    } else if (!game.winner) {
      const who = isTwoPlayer ? (game.currentPlayer === PLAYER.HUMAN ? 'Player 1' : 'Player 2') : 'Your';
      setStatusMessage(`${who} turn`);
      if (onAnnounce) onAnnounce(`${who} turn`);
    }
  }, [game.currentPlayer, game.isAnimating, game.winner, isTwoPlayer, onAnnounce]);

  useEffect(() => {
    if (!game.board || !prevBoardRef.current) {
      prevBoardRef.current = game.board;
      return;
    }
    if (!isTwoPlayer && game.currentPlayer === PLAYER.AI) return;

    const prev = prevBoardRef.current;
    const curr = game.board;
    let converted = 0;
    let special = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const pc = prev[r][c];
        const cc = curr[r][c];
        const ownerChanged = cc.owner !== pc.owner && cc.owner !== null && pc.owner !== null;
        if (ownerChanged) {
          converted++;
          if (cc.type !== CELL_TYPE.NORMAL) special++;
        }
      }
    }
    if (converted > 0) {
      statsRef.current.cellsConverted += converted;
      statsRef.current.specialCells += special;
    }
    prevBoardRef.current = game.board;
  }, [game.board, game.currentPlayer, isTwoPlayer]);

  useEffect(() => {
    if (game.isAnimating && game.explodingCells.size > 0) {
      sound.playExplosion();
    }
  }, [game.isAnimating, game.explodingCells, sound]);

  useEffect(() => {
    if (!game.singularityDrain) return;
    const { human, ai } = game.singularityDrain;
    const parts = [];
    if (human > 0) parts.push(`${human} of your orbs`);
    if (ai > 0) parts.push(`${ai} AI orbs`);
    if (parts.length > 0) {
      setToast(`Singularity drained ${parts.join(' and ')}`);
      setTimeout(() => setToast(null), 2000);
    }
  }, [game.singularityDrain]);

  useEffect(() => {
    if (!game.winner) {
      sound.startAmbient();
    } else {
      sound.stopAmbient();
      statsRef.current.totalTurns = game.turn + 1;
    }
    return () => sound.stopAmbient();
  }, [game.winner, game.turn, sound]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      setShowHistory((v) => !v);
      return;
    }
    if (e.key === 'D' && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      setShowDev((v) => !v);
      return;
    }
    if (e.key === '?' || e.key === '/') {
      e.preventDefault();
      if (isTwoPlayer || !game.board || isThinking || game.isAnimating || game.winner) return;
      const hint = getHint(game.board, mode);
      setHintCell(hint);
      if (hint) {
        setToast('Hint: try the highlighted cell');
        setTimeout(() => setToast(null), 2000);
      }
      return;
    }
    if (!isHumanTurn || game.winner) return;

    const cursor = { ...cursorPos };
    switch (e.key) {
      case 'ArrowUp':
        if (e.shiftKey) { cursor.row = Math.max(0, cursor.row - 1); break; }
        if (cursor.row > 0) cursor.row--;
        break;
      case 'ArrowDown':
        if (e.shiftKey) { cursor.row = Math.min(7, cursor.row + 1); break; }
        if (cursor.row < 7) cursor.row++;
        break;
      case 'ArrowLeft':
        if (cursor.col > 0) cursor.col--;
        break;
      case 'ArrowRight':
        if (cursor.col < 7) cursor.col++;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!game.isAnimating && !isThinking) {
          handleCellClick(cursorPos.row, cursorPos.col);
        }
        return;
      case 'm':
      case 'M':
        sound.setMuted((v) => !v);
        setSoundEnabled((v) => !v);
        return;
      default:
        return;
    }
    setCursorPos(cursor);
  }, [cursorPos, game.board, game.isAnimating, isHumanTurn, isThinking, game.winner, handleCellClick, mode, sound]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <main className={`game-shell${shaking ? ' shaking' : ''}`}>
      <div className="game-backdrop" aria-hidden="true" />
      <HUD
        mode={mode}
        turn={game.turn}
        scores={game.scores}
        counts={game.orbCounts}
        currentPlayer={game.currentPlayer}
        isThinking={isThinking}
        isTwoPlayer={isTwoPlayer}
        soundEnabled={soundEnabled}
        onToggleSound={() => { sound.setMuted((v) => !v); setSoundEnabled((v) => !v); }}
        overdriveEnergy={game.overdriveEnergy}
      />
      <AbilityBar
        mode={mode}
        energy={game.overdriveEnergy}
        currentPlayer={game.currentPlayer}
        usedAbility={game.usedAbility}
        activeAbility={game.activeAbility}
        onUseAbility={(ability) => game.useAbility(ability, isTwoPlayer ? game.currentPlayer : PLAYER.HUMAN)}
        disabled={game.isAnimating || isThinking || !!game.winner}
        isTwoPlayer={isTwoPlayer}
      />
      <Board
        board={game.board}
        currentPlayer={game.currentPlayer}
        explodingCells={game.explodingCells}
        isAnimating={game.isAnimating || isThinking}
        onCellClick={handleCellClick}
        lastMove={lastMove}
        cursorPos={isHumanTurn && !game.winner ? cursorPos : null}
        hintCell={hintCell}
        placingCell={placingCell}
        isTwoPlayer={isTwoPlayer}
        activeAbility={game.activeAbility}
        stabilizeTarget={game.stabilizeTarget}
      />
      <button className="ghost-button menu-button" onClick={onMainMenu}>Main Menu</button>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      {chainBanner && (
        <div className="chain-banner" key={chainBanner} role="status">{chainBanner}</div>
      )}
      {toast && (
        <div className="toast" key={toast} role="status">{toast}</div>
      )}

      {showHistory && (
        <div className="terminal-overlay" role="region" aria-label="Move history" aria-expanded={showHistory}>
          <div className="term-line" style={{ color: 'var(--gold)', fontWeight: 800, marginBottom: '0.3rem' }}>
            MOVE HISTORY
          </div>
          {moveHistory.length === 0 && (
            <div className="term-line" style={{ color: 'var(--dim)' }}>No moves yet</div>
          )}
          {moveHistory.map((entry, i) => (
            <div className="term-line" key={i}>
              <span className="term-ts">[{String(i + 1).padStart(2, '0')}]</span>{' '}
              <span className={`term-player term-${entry.player}`}>
                {entry.player.toUpperCase().padEnd(6)}
              </span>
              {' '}→ ({entry.row},{entry.col}){' '}
              {entry.chain > 0 && <span className="term-chain">[chain:{entry.chain}]</span>}
              {entry.score > 0 && <span className="term-chain"> [score:{entry.score}]</span>}
            </div>
          ))}
          <div className="term-line" style={{ color: 'var(--dim)', marginTop: '0.3rem', fontSize: '0.65rem' }}>
            Press H to toggle
          </div>
        </div>
      )}

      {showDev && (
        <div className="dev-panel" role="region" aria-label="Developer panel" aria-expanded={showDev}>
          <div className="dev-row">
            <span className="dev-label">MODE</span>
            <span className="dev-value">{mode.toUpperCase()}</span>
          </div>
          <div className="dev-row">
            <span className="dev-label">DIFFICULTY</span>
            <span className="dev-value">{difficulty.toUpperCase()}</span>
          </div>
          <div className="dev-row">
            <span className="dev-label">TURN</span>
            <span className="dev-value">{game.turn + 1}</span>
          </div>
          <div className="dev-row">
            <span className="dev-label">LONGEST CHAIN</span>
            <span className="dev-value">{statsRef.current.longestChain}</span>
          </div>
          <div className="dev-row">
            <span className="dev-label">CONVERTED</span>
            <span className="dev-value">{statsRef.current.cellsConverted}</span>
          </div>
          <div className="dev-row">
            <span className="dev-label">SPECIAL CELLS</span>
            <span className="dev-value">{statsRef.current.specialCells}</span>
          </div>
          <div className="dev-row" style={{ borderBottom: 'none', marginTop: '0.3rem' }}>
            <span className="dev-label" style={{ fontSize: '0.6rem' }}>
              Ctrl+Shift+D toggle
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
