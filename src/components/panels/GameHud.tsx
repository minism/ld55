import FloatingPanel from "@/components/common/FloatingPanel";
import GameActionsView from "@/components/panels/GameActionsView";
import PlayerView from "@/components/panels/PlayerView";
import gameConfig from "@/game/config/gameConfig";
import { GameModel, Player } from "@/game/model/gameModel";
import { observer } from "mobx-react-lite";

interface Props {
  model: GameModel;
}

function GameHud(props: Props) {
  const { model } = props;
  const leftPlayer = model.areChallenger() ? model.challenger : model.host;
  const rightPlayer = model.areChallenger() ? model.host : model.challenger;

  return (
    <>
      <GameActionsView model={props.model} />
      <PlayerView model={props.model} player={leftPlayer} left={true} />
      <PlayerView model={props.model} player={rightPlayer} left={false} />
    </>
  );
}

export default observer(GameHud);
