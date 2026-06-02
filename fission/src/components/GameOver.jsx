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

export default function GameOver({ winner, mode, scores, stats, onPlayAgain, onMainMenu }) {
  const title = winner === 'draw' ? 'STALEMATE' : winner === PLAYER.HUMAN ? 'VICTORY' : 'DEFEAT';
  const resultClass = winner === 'draw' ? 'stalemate' : winner === PLAYER.HUMAN ? 'victory' : 'defeat';
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const text = `I ${winner === PLAYER.HUMAN ? 'won' : winner === 'draw' ? 'drew' : 'lost'} at FISSION!\n` +
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
          <p className="final-score">YOU: {scores.human} | AI: {scores.ai}</p>
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
