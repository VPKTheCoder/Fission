import { useEffect, useState } from 'react';
import { GAME_MODE, PLAYER } from '../utils/constants.js';

const THINKING_MSGS = [
  'npm run think',
  'compiling strategy...',
  'git pushing orbs...',
  'analyzing permutations',
  'training on your moves',
  'allocating reactor cycles',
  'calculating chain depth',
  'optimizing explosion path',
  'warming up minimax tree',
  'importing tactics from __future__',
];

const TOTAL_CELLS = 64;

function OrbEnergyBar({ count, side }) {
  const pct = Math.min(100, (count / TOTAL_CELLS) * 100);
  const label = side === 'human' ? 'HUMAN' : side === 'p1' ? 'P1' : side === 'p2' ? 'P2' : 'AI';
  const cssSide = side === 'p1' ? 'human' : side === 'p2' ? 'ai' : side;
  return (
    <div className="energy-bar">
      <strong>{label}</strong>
      <div className="energy-track">
        <div
          className={`energy-fill energy-fill-${cssSide}`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
      <span>{count}</span>
    </div>
  );
}

export default function HUD({ mode, turn, scores, counts, currentPlayer, isThinking, isTwoPlayer = false, soundEnabled, onToggleSound, overdriveEnergy }) {
  const MODE_LABELS = {
    [GAME_MODE.CONQUEST]: 'CONQUEST',
    [GAME_MODE.CASCADE]: 'CASCADE',
    [GAME_MODE.MELTDOWN]: 'MELTDOWN',
    [GAME_MODE.SINGULARITY]: 'SINGULARITY',
    [GAME_MODE.OVERDRIVE]: 'OVERDRIVE',
    [GAME_MODE.BREACH]: 'BREACH',
  };
  const modeLabel = MODE_LABELS[mode] || 'CONQUEST';
  const isHuman = currentPlayer === PLAYER.HUMAN;

  const [msgIndex, setMsgIndex] = useState(0);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    if (!isThinking) return;
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % THINKING_MSGS.length);
    }, 1200);
    const dotInterval = setInterval(() => {
      setDotCount((c) => (c + 1) % 4);
    }, 400);
    return () => {
      clearInterval(msgInterval);
      clearInterval(dotInterval);
    };
  }, [isThinking]);

  return (
    <header className={`hud${isHuman ? ' hud-turn-human' : ' hud-turn-ai'}`}>
      <div className="hud-player">
        <span className="dot dot-human" />
        <OrbEnergyBar count={counts.human} side={isTwoPlayer ? 'p1' : 'human'} />
      </div>
      <div className="hud-center">
        {isThinking ? (
          <div className="thinking-line">
            <span className="dot dot-ai" style={{ width: '0.5rem', height: '0.5rem' }} />
            {THINKING_MSGS[msgIndex]}
            <span className="thinking-dots">{'.'.repeat(dotCount)}</span>
          </div>
        ) : isTwoPlayer ? (
          <>
            <span className={`turn-label turn-${isHuman ? 'human' : 'ai'}`}>
              {isHuman ? "P1's TURN" : "P2's TURN"}
            </span>
            <span className="mode-label">{modeLabel} · TURN {turn + 1}</span>
          </>
        ) : (
          <>
            <span className={`turn-label turn-${isHuman ? 'human' : 'ai'}`}>
              {isHuman ? 'YOUR TURN' : 'AI TURN'}
            </span>
            <span className="mode-label">{modeLabel} · TURN {turn + 1}</span>
          </>
        )}
        {(mode === GAME_MODE.CASCADE || mode === GAME_MODE.OVERDRIVE) && !isThinking && (
          <span className="score-line">
            {isTwoPlayer ? `P1: ${scores.human} | P2: ${scores.ai}` : `YOU: ${scores.human} | AI: ${scores.ai}`}
            {mode === GAME_MODE.OVERDRIVE && overdriveEnergy && (
              <> ⚡ {overdriveEnergy.human ?? 0}</>
            )}
          </span>
        )}
        <div className="hud-keyhints">
          <span>?</span>
          <span>↑↓←→</span>
          <span>⏎</span>
        </div>
      </div>
      <div className="hud-player hud-ai">
        <OrbEnergyBar count={counts.ai} side={isTwoPlayer ? 'p2' : 'ai'} />
        <span className="dot dot-ai" />
        <button
          className={`sound-toggle ${soundEnabled ? '' : 'muted'}`}
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          aria-pressed={!soundEnabled}
          title="Toggle sound (M)"
        >
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
            {soundEnabled ? (
              <>
                <path d="M8 3L4 7H1v6h3l4 4V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M13 7a5 5 0 010 6M16 4a9 9 0 010 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M8 3L4 7H1v6h3l4 4V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.4" />
                <path d="M12 7l6 6M18 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
