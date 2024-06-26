"use client";

import { GameController } from "@/game/controller/GameController";
import { generateWorld } from "@/game/logic/initialState";
import { initGameRenderer } from "@/game/renderer/GameRenderer";
import { useEffect, useRef, useState } from "react";

export default function PreviewWorldClient() {
  const gameElement = useRef<HTMLDivElement | null>(null);
  const [gameController, setGameController] = useState<GameController | null>(
    null
  );

  useEffect(() => {
    (async function () {
      if (gameElement.current == null) {
        return;
      }

      // @ts-expect-error
      const renderer = await initGameRenderer(gameElement.current);
      renderer.update({
        // @ts-expect-error
        state: {
          tiles: generateWorld().getAllTiles(),
        },
      });
    })();
  }, [gameElement]);

  return (
    <div>
      <div ref={gameElement} />
    </div>
  );
}
