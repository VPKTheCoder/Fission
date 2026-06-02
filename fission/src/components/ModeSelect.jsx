import { GAME_MODE } from '../utils/constants.js';

const MODES = [
  {
    id: GAME_MODE.CONQUEST,
    title: 'Conquest',
    text: 'Eliminate all enemy orbs. Last player standing wins.',
  },
  {
    id: GAME_MODE.CASCADE,
    title: 'Cascade',
    text: 'Chain reactions score points. 20 turns each. Highest score wins.',
  },
];

export default function ModeSelect({ onSelect, onBack }) {
  return (
    <main className="screen select-screen">
      <div className="top-rail" aria-hidden="true">
        <span className="brand-mark">f</span>
        <nav>
          <span>Mode</span>
          <span>Reaction</span>
          <span>Control</span>
        </nav>
      </div>
      <button className="ghost-button back-button" onClick={onBack}>Back</button>
      <div className="select-heading">
        <span className="eyebrow">Set the field condition</span>
        <h2>Select Mode</h2>
      </div>
      <div className="select-grid">
        {MODES.map((mode) => (
          <button className="select-card" key={mode.id} onClick={() => onSelect(mode.id)}>
            <span>{mode.title}</span>
            <p>{mode.text}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
