import FloatingPanel from "@/components/common/FloatingPanel";
import gameConfig from "@/game/config/gameConfig";

interface Props {}

export default function PlayerList() {
  return (
    <FloatingPanel
      top={gameConfig.gameViewVerticalPadding / 2 + gameConfig.panelPadding}
      right={gameConfig.panelPadding}
    >
      <div>Players</div>
    </FloatingPanel>
  );
}
