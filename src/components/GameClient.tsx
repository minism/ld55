"use client";

import { useEffect, useRef, useState } from "react";
import GameRenderer from "../game/renderer/GameRenderer";
import GameController from "@/game/controller/GameController";

export default function GameClient() {
  const gameElement = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (gameElement.current == null) {
      return;
    }
    const controller = new GameController(gameElement.current);
    controller.init();
  }, [gameElement]);

  return <div ref={gameElement} />;
}
