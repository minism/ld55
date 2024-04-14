import FloatingPanel from "@/components/common/FloatingPanel";
import GameButton from "@/components/common/GameButton";
import { apiEndTurn } from "@/game/api";
import gameConfig from "@/game/config/gameConfig";
import { GameModel } from "@/game/model/gameModel";
import { observer } from "mobx-react-lite";

interface Props {
  model: GameModel;
}

function GameActionsView(props: Props) {
  const { model } = props;

  async function onClickFinishTurn() {
    await apiEndTurn({
      gameId: model.dbGame.id,
    });
  }

  return (
    <>
      <GameButton
        style={{
          position: "absolute",
          right: gameConfig.panelPadding,
          bottom: 280,
        }}
        onClick={() => onClickFinishTurn()}
        disabled={!model.isOurTurn()}
      >
        {model.isOurTurn() ? "Finish turn" : "Waiting for opponent"}
      </GameButton>
    </>
  );
}

export default observer(GameActionsView);
