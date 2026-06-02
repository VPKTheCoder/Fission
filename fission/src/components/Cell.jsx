import { CELL_TYPE, PLAYER } from '../utils/constants.js';

const ORB_POSITIONS = {
  1: [[50, 50]],
  2: [[50, 30], [50, 70]],
  3: [[30, 30], [70, 30], [50, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
};

export function CellIcon({ type, charged }) {
  if (type === CELL_TYPE.CATALYST) {
    return (
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === CELL_TYPE.VOID && charged) {
    return (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M10 2L3 5v5c0 4 3.5 7 7 8 3.5-1 7-4 7-8V5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === CELL_TYPE.VOID) {
    return (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M10 2L3 5v5c0 4 3.5 7 7 8 3.5-1 7-4 7-8V5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.4" />
        <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === CELL_TYPE.AMPLIFIER) {
    return (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="2" fill="currentColor" />
        <path d="M6.5 13.5a5 5 0 010-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13.5 13.5a5 5 0 000-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 16a8.5 8.5 0 010-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 16a8.5 8.5 0 000-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return null;
}

function getOrbPositions(count) {
  if (count <= 4) {
    return ORB_POSITIONS[count] ?? [];
  }
  return ORB_POSITIONS[4];
}

export default function Cell({
  cell, row, col, isValidMove, isExploding, onClick, currentPlayer,
  isLastMove, isCursor, isHint, isPlacing,
}) {
  const ownerClass = cell.owner ? `owner-${cell.owner}` : '';
  const typeClass = cell.type === CELL_TYPE.VOID && !cell.voidCharge ? 'cell-void-depleted' : `cell-${cell.type}`;
  const classes = [
    'cell',
    typeClass,
    ownerClass,
    isValidMove ? 'valid-move' : '',
    isExploding ? 'exploding' : '',
    isExploding && cell.type === CELL_TYPE.AMPLIFIER ? 'amplifier-explosion' : '',
    isCursor ? 'cell-cursor' : '',
    isHint ? 'cell-hint' : '',
    isPlacing ? 'cell-placing' : '',
  ].filter(Boolean).join(' ');
  const orbColor = cell.owner === PLAYER.AI ? 'var(--coral)' : 'var(--cyan)';
  const positions = getOrbPositions(cell.orbs);

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={!isValidMove}
      aria-label={`Row ${row + 1}, column ${col + 1}`}
      style={{ '--active-player': currentPlayer === PLAYER.AI ? 'var(--coral)' : 'var(--cyan)' }}
    >
      {cell.type !== CELL_TYPE.NORMAL && (
        <span className={`cell-icon icon-${cell.type}`} aria-hidden="true">
          <CellIcon type={cell.type} charged={cell.voidCharge} />
        </span>
      )}
      {isLastMove && (
        <span className="last-move-highlight" aria-hidden="true" />
      )}
      {isCursor && (
        <span className="cursor-highlight" aria-hidden="true" />
      )}
      {isHint && (
        <span className="hint-glow" aria-hidden="true" />
      )}
      {isExploding && (
        <span className="shockwave" aria-hidden="true" />
      )}
      {isExploding && (
        <span className="explosion-burst" aria-hidden="true" />
      )}
      {isValidMove && currentPlayer !== cell.owner && (
        <span className="ripple-ring" aria-hidden="true" />
      )}
      {isPlacing && (
        <span className="placement-burst" aria-hidden="true" />
      )}
      <span className="orb-layer" aria-hidden="true">
        {positions.map(([x, y], index) => (
          <span
            className="orb"
            key={`${x}-${y}-${index}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              background: orbColor,
              boxShadow: `0 0 6px 2px ${cell.owner === PLAYER.AI ? 'rgba(255,82,82,0.5)' : 'rgba(0,229,255,0.5)'}`,
            }}
          />
        ))}
        {cell.orbs > 4 && <span className="orb-count">{cell.orbs}</span>}
      </span>
    </button>
  );
}
