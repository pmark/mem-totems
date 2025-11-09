import { useEffect, useRef } from 'react';
import { createGame } from '../game';

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const game = createGame(containerRef.current.id);
    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div
      id="game-container"
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    />
  );
}