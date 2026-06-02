import { useState, useEffect } from 'react';
import { GAME_MODE, PLAYER } from '../utils/constants.js';

function AnimatedValue({ value, label }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!value || value === '—') return;
    const num = typeof value === 'number' ? value : parseInt(value, 10);
    if (isNaN(num)) return;
    const duration = 800;
    const steps = 20;
    const increment = num / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= num) {
        setDisplay(num);
        clearInterval(interval);
      } else {
        setDisplay(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="stat-card">
      <strong>{label}</strong>
      <span>{display || value || '—'}</span>
    </div>
  );
}

export default function GameOver({ winner, mode, isTwoPlayer = false, scores, stats, onPlayAgain, onMainMenu }) {
  const title = winner === 'draw' ? 'STALEMATE' : winner === PLAYER.HUMAN ? (isTwoPlayer ? 'P1 WINS' : 'VICTORY') : (isTwoPlayer ? 'P2 WINS' : 'DEFEAT');
  const resultClass = winner === 'draw' ? 'stalemate' : winner === PLAYER.HUMAN ? 'victory' : 'defeat';
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const who = winner === PLAYER.HUMAN ? (isTwoPlayer ? 'Player 1' : 'I') : winner === 'draw' ? 'Nobody' : (isTwoPlayer ? 'Player 2' : 'I');
    const verb = winner === 'draw' ? 'drew' : 'won';
    const text = `${who} ${verb} at FISSION!\n` +
      `Mode: ${mode.toUpperCase()}\n` +
      (mode === GAME_MODE.CASCADE ? `Score: ${scores?.human} - ${scores?.ai}\n` : `Result: ${title}\n`) +
      (stats ? `Longest chain: ${stats.longestChain}\n` : '') +
      `Play at: https://fission-game.vercel.app`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  const statItems = stats ? [
    { label: 'TURNS', value: stats.totalTurns || '—' },
    { label: 'LONGEST CHAIN', value: stats.longestChain || '—' },
    { label: 'CELLS CONVERTED', value: stats.cellsConverted || '—' },
    { label: 'SPECIAL CELLS', value: stats.specialCells || '—' },
  ] : [];

  return (
    <main className="screen gameover-screen">
      <section className={`gameover-panel ${resultClass}`}>
        <h2>{title}</h2>
        {mode === GAME_MODE.CASCADE && scores && (
          <p className="final-score">
            {isTwoPlayer ? `P1: ${scores.human} | P2: ${scores.ai}` : `YOU: ${scores.human} | AI: ${scores.ai}`}
          </p>
        )}
        {stats && (
          <div className="stats-grid">
            {statItems.map((item) => (
              <AnimatedValue key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        )}
        <div className="gameover-actions">
          <button className="primary-button" onClick={onPlayAgain}>PLAY AGAIN</button>
          <button className="ghost-button" onClick={onMainMenu}>MAIN MENU</button>
          <button className="ghost-button" onClick={handleShare}>
            {copied ? 'COPIED!' : 'SHARE RESULT'}
          </button>
        </div>
      </section>
    </main>
  );
}
