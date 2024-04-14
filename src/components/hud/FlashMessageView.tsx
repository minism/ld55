import { GameModel } from "@/game/model/gameModel";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

interface Props {
  model: GameModel;
}

function FlashMessageView(props: Props) {
  const { model } = props;

  useEffect(() => {
    if (!model.flashMessage) {
      return;
    }
    const t = setTimeout(() => {
      model.flashMessage = "";
    }, 2000);
    return () => clearTimeout(t);
  }, [model.flashMessage]);

  return (
    <div
      style={{
        position: "fixed",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, 25%)",
        zIndex: 5,
      }}
      className="text-white text-3xl"
    >
      <div>{model.persistentMessage}</div>
      <div>{model.flashMessage}</div>
    </div>
  );
}

export default observer(FlashMessageView);
