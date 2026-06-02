import { CELL_TYPE } from '../utils/constants.js';
import { CellIcon } from './Cell.jsx';

const LEGEND = [
  { type: CELL_TYPE.CATALYST, title: 'CATALYST', text: 'Lower critical mass creates early chain triggers.' },
  { type: CELL_TYPE.VOID, title: 'VOID', text: 'Charged shields absorb one incoming explosion route.' },
  { type: CELL_TYPE.AMPLIFIER, title: 'AMPLIFIER', text: 'Explosions fire two orbs into every neighbor.' },
];

export default function Menu({ onPlay }) {
  return (
    <main className="screen menu-screen">
      <div className="top-rail" aria-hidden="true">
        <span className="brand-mark">f</span>
        <nav>
          <span>Reactor</span>
          <span>Cells</span>
          <span>Strategy</span>
        </nav>
      </div>
      <section className="menu-panel">
        <div className="hero-core" aria-hidden="true">
          <div className="core-inner" />
          <div className="core-ring" />
          <div className="core-ring" />
          <div className="core-ring" />
          <div className="core-orbits" />
        </div>
        <div className="title-block">
          <span className="eyebrow">Chain Reaction Strategy</span>
          <h1>FISSION</h1>
          <p>Territory strategy. Chain reactions. Three cells that change everything.</p>
        </div>
        <button className="primary-button" onClick={onPlay}>Play</button>
        <div className="legend-row">
          {LEGEND.map((item) => (
            <article className="legend-item" key={item.type}>
              <span className={`legend-icon icon-${item.type}`}>
                <CellIcon type={item.type} charged />
              </span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
