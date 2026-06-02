export default function PlayerTypeSelect({ onSelectAI, onSelect2P, onBack }) {
  return (
    <main className="screen select-screen">
      <button className="ghost-button back-button" onClick={onBack}>Back</button>
      <div className="select-heading">
        <span className="eyebrow">Choose your opponent</span>
        <h2>Play Mode</h2>
      </div>
      <div className="select-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <button className="select-card" onClick={onSelectAI}>
          <span>Play with AI</span>
          <p>Face off against the reactor AI. Choose difficulty after this.</p>
        </button>
        <button className="select-card" onClick={onSelect2P}>
          <span>2 Player</span>
          <p>Pass-and-play on the same device. Take turns placing orbs.</p>
        </button>
      </div>
    </main>
  );
}
