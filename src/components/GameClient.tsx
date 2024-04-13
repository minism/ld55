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

// // Class component used to disable fast-refresh in nextjs, not sure if there is a better way.
// export default class GameClient extends Component {
//   gameElement: any;

//   constructor(props: Props) {
//     super(props);
//     this.gameElement = createRef();
//   }

//   render() {
//     return <div ref={this.gameElement} />;
//   }

//   componentDidMount() {
//     const controller = new GameController(this.gameElement.current);
//     controller.init();
//   }
// }
