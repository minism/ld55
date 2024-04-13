"use client";

import { useEffect, useRef, useState } from "react";
import Game from "../game/Game";

export default function GameContainer() {
  const gameElement = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (gameElement.current == null) {
      return;
    }
    const game = new Game();
    game.init(gameElement.current);
  }, [gameElement]);

  return (
    <div className="border-white border">
      <div ref={gameElement} />
    </div>
  );
}
