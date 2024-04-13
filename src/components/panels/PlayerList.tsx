import FloatingPanel from "@/components/common/FloatingPanel";
import gameConfig from "@/game/config/gameConfig";
import { GameState } from "@/game/model/gameState";
import { observer } from "mobx-react-lite";

interface Props {
  gameState: GameState;
}

function PlayerList(props: Props) {
  return (
    <FloatingPanel
      top={gameConfig.gameViewVerticalPadding / 2 + gameConfig.panelPadding}
      right={gameConfig.panelPadding}
    >
      <div>Players {props.gameState.secondsPassed}</div>
    </FloatingPanel>
  );
}

export default observer(PlayerList);
