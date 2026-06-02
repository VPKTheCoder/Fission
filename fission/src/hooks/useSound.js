import { useRef, useCallback, useState } from 'react';

export function useSound() {
  const ctxRef = useRef(null);
  const ambientRef = useRef(null);
  const [muted, setMuted] = useState(false);

  const getCtx = useCallback(() => {
    if (muted) return null;
    if (!ctxRef.current) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, [muted]);

  const playTone = useCallback((freq, duration, type = 'sine', volume = 0.12, delay = 0) => {
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    gain.gain.setValueAtTime(volume, c.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duration);
  }, [getCtx]);

  const playNoise = useCallback((duration, volume = 0.06) => {
    const c = getCtx();
    if (!c) return;
    const bufferSize = c.sampleRate * duration;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
    }
    const source = c.createBufferSource();
    const gain = c.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    source.connect(gain);
    gain.connect(c.destination);
    source.start();
  }, [getCtx]);

  const startAmbient = useCallback(() => {
    if (ambientRef.current) return;
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, c.currentTime);
    gain.gain.setValueAtTime(0.015, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.025, c.currentTime + 2);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    ambientRef.current = { osc, gain };
  }, [getCtx]);

  const stopAmbient = useCallback(() => {
    if (!ambientRef.current) return;
    const { osc, gain } = ambientRef.current;
    const c = getCtx();
    if (c) {
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
      setTimeout(() => { try { osc.stop(); } catch {} }, 500);
    }
    ambientRef.current = null;
  }, [getCtx]);

  const playPlace = useCallback(() => {
    playTone(1200, 0.06, 'sine', 0.08);
    playTone(1600, 0.05, 'sine', 0.04, 0.02);
  }, [playTone]);

  const playExplosion = useCallback(() => {
    playTone(90, 0.25, 'sawtooth', 0.1);
    playNoise(0.15, 0.08);
  }, [playTone, playNoise]);

  const playChain = useCallback(() => {
    playTone(440, 0.1, 'square', 0.06);
    playTone(220, 0.12, 'sawtooth', 0.05, 0.04);
  }, [playTone]);

  const playVictory = useCallback(() => {
    [523, 659, 784, 1047].forEach((f, i) => {
      playTone(f, 0.35, 'sine', 0.12, i * 0.12);
    });
    setTimeout(() => {
      playTone(1047, 0.6, 'sine', 0.08, 0);
    }, 500);
  }, [playTone]);

  const playDefeat = useCallback(() => {
    playTone(180, 0.5, 'sawtooth', 0.1);
    setTimeout(() => playTone(120, 0.6, 'sawtooth', 0.08), 200);
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(660, 0.035, 'sine', 0.05);
  }, [playTone]);

  return {
    playPlace, playExplosion, playChain, playVictory, playDefeat, playClick,
    startAmbient, stopAmbient, muted, setMuted,
  };
}
