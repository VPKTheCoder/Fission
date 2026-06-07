import { GAME_MODE, PLAYER, OVERDRIVE_STABILIZE_COST, OVERDRIVE_QUANTUM_COST } from '../utils/constants.js';

export default function AbilityBar({
  mode, energy, currentPlayer, usedAbility, activeAbility,
  onUseAbility, disabled, isTwoPlayer,
}) {
  if (mode !== GAME_MODE.OVERDRIVE) return null;

  const player = isTwoPlayer ? currentPlayer : PLAYER.HUMAN;
  const canStabilize = energy[player] >= OVERDRIVE_STABILIZE_COST && !usedAbility && !disabled;
  const canQuantum = energy[player] >= OVERDRIVE_QUANTUM_COST && !usedAbility && !disabled;
  const isStabilizeActive = activeAbility === 'stabilize';
  const isQuantumActive = activeAbility === 'quantum';

  return (
    <div className="ability-bar">
      <div className="ability-energy">
        <span className="ability-energy-label">ENERGY</span>
        <span className="ability-energy-value">{energy[player]}</span>
        <div className="ability-energy-track">
          <div
            className="ability-energy-fill"
            style={{ width: `${Math.min(100, (energy[player] / 25) * 100)}%` }}
          />
        </div>
      </div>
      <div className="ability-buttons">
        <button
          className={`ability-btn${isStabilizeActive ? ' ability-active' : ''}${!canStabilize && !isStabilizeActive ? ' ability-disabled' : ''}`}
          onClick={() => onUseAbility('stabilize')}
          disabled={!canStabilize && !isStabilizeActive}
          title="Next cell you click needs 1 more orb to explode (cost: 3 energy)"
        >
          <span className="ability-icon">◆</span>
          <span className="ability-name">STABILIZE</span>
          <span className="ability-cost">{OVERDRIVE_STABILIZE_COST}</span>
        </button>
        <button
          className={`ability-btn${isQuantumActive ? ' ability-active' : ''}${!canQuantum && !isQuantumActive ? ' ability-disabled' : ''}`}
          onClick={() => onUseAbility('quantum')}
          disabled={!canQuantum && !isQuantumActive}
          title="Your next explosion sends 2 orbs per neighbor instead of 1 (cost: 5 energy)"
        >
          <span className="ability-icon">✦</span>
          <span className="ability-name">SURGE</span>
          <span className="ability-cost">{OVERDRIVE_QUANTUM_COST}</span>
        </button>
      </div>
      {isStabilizeActive && (
        <div className="ability-status">Select a cell to stabilize, then make your move</div>
      )}
      {isQuantumActive && (
        <div className="ability-status">Your next explosion will send double orbs!</div>
      )}
    </div>
  );
}
