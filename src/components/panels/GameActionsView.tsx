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
    <div
      className="absolute"
      style={{
        bottom:
          gameConfig.gameViewVerticalPadding / 2 + gameConfig.panelPadding,
        left: gameConfig.panelPadding,
      }}
    >
      {model.isOurTurn() ? (
        <GameButton onClick={() => onClickFinishTurn()}>Finish turn</GameButton>
      ) : null}
    </div>
  );
}

export default observer(GameActionsView);
