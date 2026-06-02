import { DIFFICULTY } from '../utils/constants.js';

const DIFFICULTIES = [
  { id: DIFFICULTY.EASY, title: 'Easy', text: 'Makes mistakes. Good for learning.' },
  { id: DIFFICULTY.NORMAL, title: 'Normal', text: 'Plays solid, finds combos.' },
  { id: DIFFICULTY.HARD, title: 'Hard', text: 'Reads 3 moves ahead. Fights for amplifiers.' },
];

export default function DifficultySelect({ onSelect, onBack }) {
  return (
    <main className="screen select-screen">
      <div className="top-rail" aria-hidden="true">
        <span className="brand-mark">f</span>
        <nav>
          <span>Signal</span>
          <span>AI</span>
          <span>Depth</span>
        </nav>
      </div>
      <button className="ghost-button back-button" onClick={onBack}>Back</button>
      <div className="select-heading">
        <span className="eyebrow">Choose opposition</span>
        <h2>Select Difficulty</h2>
      </div>
      <div className="difficulty-row">
        {DIFFICULTIES.map((difficulty) => (
          <button className="difficulty-button" key={difficulty.id} onClick={() => onSelect(difficulty.id)}>
            <span>{difficulty.title}</span>
            <small>{difficulty.text}</small>
          </button>
        ))}
      </div>
    </main>
  );
}
