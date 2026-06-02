import { useEffect, useState } from 'react';
import { PLAYER } from '../utils/constants.js';
import { getAIMove } from '../utils/aiEngine.js';

export function useAI({ board, currentPlayer, difficulty, mode, scores, isAnimating, winner, onMove }) {
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function think() {
      if (currentPlayer !== PLAYER.AI || isAnimating || winner) {
        return;
      }

      setIsThinking(true);
      const startedAt = Date.now();
      const move = await getAIMove(board, difficulty, mode, scores);
      const delay = Math.max(0, 450 - (Date.now() - startedAt));

      window.setTimeout(() => {
        if (!cancelled) {
          onMove(move);
          setIsThinking(false);
        }
      }, delay);
    }

    think();

    return () => {
      cancelled = true;
    };
  }, [board, currentPlayer, difficulty, mode, scores, isAnimating, winner, onMove]);

  return { isThinking };
}
