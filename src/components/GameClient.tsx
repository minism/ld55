"use client";

import EventLogView from "@/components/panels/EventLogView";
import PlayerList from "@/components/panels/PlayerList";
import TooltipView from "@/components/panels/TooltipView";
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
          <PlayerList model={gameController.model} />
          <EventLogView eventLog={gameController.eventLog} />
          <TooltipView tooltip={gameController.tooltip} />
        </>
      )}
    </div>
  );
}
