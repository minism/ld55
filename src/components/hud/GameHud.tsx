import GameActionsView from "@/components/hud/GameActionsView";
import HandView from "@/components/hud/HandView";
import PlayerView from "@/components/hud/PlayerView";
import SelectedEntityView from "@/components/hud/SelectedEntityView";
import { IGameEvents } from "@/game/controller/IGameEvents";
import { GameModel } from "@/game/model/gameModel";
import { observer } from "mobx-react-lite";

interface Props {
  model: GameModel;
  handler: IGameEvents;
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
      <SelectedEntityView model={props.model} />
      <HandView model={props.model} handler={props.handler} />
    </>
  );
}

export default observer(GameHud);
