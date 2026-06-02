import { useState, useCallback } from 'react';
import Menu from './components/Menu.jsx';
import ModeSelect from './components/ModeSelect.jsx';
import DifficultySelect from './components/DifficultySelect.jsx';
import Game from './components/Game.jsx';
import GameOver from './components/GameOver.jsx';
import ParticleCanvas from './components/ParticleCanvas.jsx';
import { useSound } from './hooks/useSound.js';
import { GAME_MODE, DIFFICULTY, PLAYER } from './utils/constants.js';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [mode, setMode] = useState(GAME_MODE.CONQUEST);
  const [difficulty, setDifficulty] = useState(DIFFICULTY.NORMAL);
  const [gameResult, setGameResult] = useState({ winner: null, scores: null, stats: null });
  const [gameKey, setGameKey] = useState(0);
  const sound = useSound();

  const isVictory = screen === 'gameover' && gameResult.winner === PLAYER.HUMAN;
  const isThinking = false;

  function getAmbiance() {
    if (screen === 'game') return 'game';
    if (screen === 'gameover') return 'gameover';
    return 'menu';
  }

  function startMode(nextMode) {
    sound.playClick();
    setMode(nextMode);
    setScreen('difficulty');
  }

  function startGame(nextDifficulty) {
    sound.playClick();
    setDifficulty(nextDifficulty);
    setGameResult({ winner: null, scores: null, stats: null });
    setGameKey((key) => key + 1);
    setScreen('game');
  }

  const handleGameOver = useCallback((winner, scores, stats) => {
    if (winner === PLAYER.HUMAN) {
      sound.playVictory();
    } else {
      sound.playDefeat();
    }
    setGameResult({ winner, scores, stats });
    setScreen('gameover');
  }, [sound]);

  function playAgain() {
    sound.playClick();
    setGameResult({ winner: null, scores: null, stats: null });
    setGameKey((key) => key + 1);
    setScreen('game');
  }

  function goToMenu() {
    sound.playClick();
    setScreen('menu');
  }

  let content;
  if (screen === 'mode') {
    content = <ModeSelect onSelect={startMode} onBack={() => { sound.playClick(); setScreen('menu'); }} />;
  } else if (screen === 'difficulty') {
    content = <DifficultySelect onSelect={startGame} onBack={() => { sound.playClick(); setScreen('mode'); }} />;
  } else if (screen === 'game') {
    content = (
      <Game
        key={gameKey}
        mode={mode}
        difficulty={difficulty}
        onGameOver={handleGameOver}
        onMainMenu={goToMenu}
      />
    );
  } else if (screen === 'gameover') {
    content = (
      <GameOver
        winner={gameResult.winner}
        mode={mode}
        scores={gameResult.scores}
        stats={gameResult.stats}
        onPlayAgain={playAgain}
        onMainMenu={goToMenu}
      />
    );
  } else {
    content = <Menu onPlay={() => { sound.playClick(); setScreen('mode'); }} />;
  }

  return (
    <>
      <ParticleCanvas ambiance={getAmbiance()} victory={isVictory} thinking={isThinking} />
      <div className="page-transition" key={screen}>
        {content}
      </div>
    </>
  );
}
