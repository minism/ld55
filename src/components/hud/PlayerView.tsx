import FillBar from "@/components/common/FillBar";
import FloatingPanel from "@/components/common/FloatingPanel";
import gameConfig from "@/game/config/gameConfig";
import { GameModel, Player } from "@/game/model/gameModel";
import { observer } from "mobx-react-lite";

interface Props {
  model: GameModel;
  player: Player | null;
  left: boolean;
}

function PlayerView(props: Props) {
  const { player, model, left } = props;
  const position = left
    ? { left: gameConfig.panelPadding }
    : { right: gameConfig.panelPadding };

  if (player == null) {
    return null;
  }
  return (
    <FloatingPanel
      title={player?.profile.username}
      top={gameConfig.gameViewVerticalPadding / 2 + gameConfig.panelPadding}
      {...position}
    >
      <div className="mb-4">
        Status: {player.connected ? "Connected" : "Disconnected"}
      </div>
      <div>HP: </div>
      <div>MP: </div>
    </FloatingPanel>
  );
}

export default observer(PlayerView);
