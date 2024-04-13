"use client";

import PlayerList from "@/components/panels/PlayerList";
import {
  GameClientProps,
  GameController,
} from "@/game/controller/GameController";
import { useEffect, useRef } from "react";

export default function GameClient(props: GameClientProps) {
  const gameElement = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (gameElement.current == null) {
      return;
    }
    const controller = new GameController(props, gameElement.current);
    controller.init();
  }, [gameElement]);

  return (
    <div>
      <div ref={gameElement} />
      <PlayerList />
    </div>
  );
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
