import { useState, useCallback, useEffect, useRef } from 'react';
import Menu from './components/Menu.jsx';
import ModeSelect from './components/ModeSelect.jsx';
import PlayerTypeSelect from './components/PlayerTypeSelect.jsx';
import DifficultySelect from './components/DifficultySelect.jsx';
import Game from './components/Game.jsx';
import GameOver from './components/GameOver.jsx';
import ParticleCanvas from './components/ParticleCanvas.jsx';
import Tutorial from './components/Tutorial.jsx';
import { useSound } from './hooks/useSound.js';
import { GAME_MODE, DIFFICULTY, PLAYER } from './utils/constants.js';

const SCREEN_TITLES = {
  menu: 'FISSION — Chain Reaction Territory Strategy Game',
  mode: 'Select Mode | FISSION',
  playertype: 'Choose Opponent | FISSION',
  difficulty: 'Select Difficulty | FISSION',
  game: 'Playing | FISSION',
  gameover: 'Game Over | FISSION',
  tutorial: 'Tutorial | FISSION',
};

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [mode, setMode] = useState(GAME_MODE.CONQUEST);
  const [difficulty, setDifficulty] = useState(DIFFICULTY.NORMAL);
  const [isTwoPlayer, setIsTwoPlayer] = useState(false);
  const [gameResult, setGameResult] = useState({ winner: null, scores: null, stats: null });
  const [gameKey, setGameKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const statusTimeout = useRef(null);
  const mainRef = useRef(null);
  const sound = useSound();

  const isVictory = screen === 'gameover' && gameResult.winner === PLAYER.HUMAN;
  const isThinking = false;

  useEffect(() => {
    document.title = SCREEN_TITLES[screen] || SCREEN_TITLES.menu;
  }, [screen]);

  useEffect(() => {
    const el = mainRef.current;
    if (el) {
      const focusable = el.querySelector('h1, h2, button, [tabindex]');
      if (focusable) focusable.focus();
    }
  }, [screen]);

  function announce(message, duration = 3000) {
    if (statusTimeout.current) clearTimeout(statusTimeout.current);
    setStatusMessage(message);
    statusTimeout.current = setTimeout(() => setStatusMessage(''), duration);
  }

  function getAmbiance() {
    if (screen === 'game') return 'game';
    if (screen === 'gameover') return 'gameover';
    return 'menu';
  }

  function startMode(nextMode) {
    sound.playClick();
    setMode(nextMode);
    setScreen('playertype');
  }

  function startGame(nextDifficulty) {
    sound.playClick();
    setDifficulty(nextDifficulty);
    setIsTwoPlayer(false);
    setGameResult({ winner: null, scores: null, stats: null });
    setGameKey((key) => key + 1);
    setScreen('game');
  }

  function startTwoPlayer() {
    sound.playClick();
    setIsTwoPlayer(true);
    setGameResult({ winner: null, scores: null, stats: null });
    setGameKey((key) => key + 1);
    setScreen('game');
  }

  const handleGameOver = useCallback((winner, scores, stats) => {
    if (winner === 'draw') {
      announce('Draw! The game ended in a stalemate.');
    } else if (winner === PLAYER.HUMAN) {
      announce('Victory! You won the game!');
      sound.playVictory();
    } else if (isTwoPlayer) {
      announce('Player 2 wins!');
      sound.playVictory();
    } else {
      announce('Defeat! The AI won the game.');
      sound.playDefeat();
    }
    setGameResult({ winner, scores, stats });
    setScreen('gameover');
  }, [sound, isTwoPlayer]);

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
  } else if (screen === 'playertype') {
    content = (
      <PlayerTypeSelect
        onSelectAI={() => { sound.playClick(); setScreen('difficulty'); }}
        onSelect2P={startTwoPlayer}
        onBack={() => { sound.playClick(); setScreen('mode'); }}
      />
    );
  } else if (screen === 'difficulty') {
    content = <DifficultySelect onSelect={startGame} onBack={() => { sound.playClick(); setScreen('playertype'); }} />;
  } else if (screen === 'game') {
    content = (
      <Game
        key={gameKey}
        mode={mode}
        difficulty={difficulty}
        isTwoPlayer={isTwoPlayer}
        onGameOver={handleGameOver}
        onMainMenu={goToMenu}
        onAnnounce={announce}
      />
    );
  } else if (screen === 'gameover') {
    content = (
      <GameOver
        winner={gameResult.winner}
        mode={mode}
        isTwoPlayer={isTwoPlayer}
        scores={gameResult.scores}
        stats={gameResult.stats}
        onPlayAgain={playAgain}
        onMainMenu={goToMenu}
      />
    );
  } else if (screen === 'tutorial') {
    content = (
      <Tutorial onClose={() => { sound.playClick(); setScreen('menu'); }} />
    );
  } else {
    content = <Menu onPlay={() => { sound.playClick(); setScreen('mode'); }} onTutorial={() => { sound.playClick(); setScreen('tutorial'); }} />;
  }

  return (
    <>
      <ParticleCanvas ambiance={getAmbiance()} victory={isVictory} thinking={isThinking} difficulty={difficulty} />
      <div className="page-transition" key={screen} ref={mainRef}>
        {content}
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>
    </>
  );
}
