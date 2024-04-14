"use client";

import EventLogView from "@/components/hud/EventLogView";
import GameHud from "@/components/hud/GameHud";
import TooltipView from "@/components/hud/TooltipView";
import {
  GameClientProps,
  GameController,
} from "@/game/controller/GameController";
import { useEffect, useRef, useState } from "react";

export default function GameClient(props: GameClientProps) {
  const gameElement = useRef<HTMLDivElement | null>(null);
  const [gameController, setGameController] = useState<GameController | null>(
    null
  );

  useEffect(() => {
    (async function () {
      if (gameElement.current == null) {
        return;
      }
      const controller = new GameController(props, gameElement.current);
      await controller.init();
      setGameController(controller);
    })();
  }, [gameElement]);

  return (
    <div>
      <div ref={gameElement} />
      {gameController?.model == null ? null : (
        <>
          <GameHud model={gameController.model} />
          <EventLogView eventLog={gameController.eventLog} />
          <TooltipView tooltip={gameController.tooltip} />
        </>
      )}
    </div>
  );
}
