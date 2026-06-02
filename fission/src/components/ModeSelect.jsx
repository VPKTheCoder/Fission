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
  {
    id: GAME_MODE.MELTDOWN,
    title: 'Meltdown',
    text: 'Critical mass thresholds decrease every 5 turns. Survive the decay.',
  },
  {
    id: GAME_MODE.SINGULARITY,
    title: 'Singularity',
    text: 'Center 2×2 is a black hole. It swallows orbs and blocks explosions.',
  },
  {
    id: GAME_MODE.OVERDRIVE,
    title: 'Overdrive',
    text: 'Chain reactions charge energy. Spend it on special abilities.',
  },
  {
    id: GAME_MODE.BREACH,
    title: 'Breach',
    text: 'AI controls the core. You control the perimeter. Asymmetric war.',
  },
];

export default function ModeSelect({ onSelect, onBack }) {
  return (
    <main className="screen select-screen">
      <button className="ghost-button back-button" onClick={onBack}>Back</button>
      <div className="select-heading">
        <span className="eyebrow">Set the field condition</span>
        <h2>Select Mode</h2>
      </div>
      <div className="select-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
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
