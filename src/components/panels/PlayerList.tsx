import FloatingPanel from "@/components/common/FloatingPanel";
import gameConfig from "@/game/config/gameConfig";
import { GameModel, Player } from "@/game/model/gameModel";
import { observer } from "mobx-react-lite";

interface Props {
  gameState: GameModel;
}

function PlayerList(props: Props) {
  const { host, challenger } = props.gameState;

  function playerDiv(player: Player | null) {
    return player == null ? null : (
      <div>
        {player.profile.username} (
        {player.connected ? "Connected" : "Disconnected"})
      </div>
    );
  }

  return (
    <FloatingPanel
      top={gameConfig.gameViewVerticalPadding / 2 + gameConfig.panelPadding}
      right={gameConfig.panelPadding}
    >
      <div className="mb-2">Players</div>
      {playerDiv(host)}
      {playerDiv(challenger)}
    </FloatingPanel>
  );
}

export default observer(PlayerList);
