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

  // We should cleanup the host/challenger thing project-wide and just
  // use player IDs.
  const playerState =
    player?.profile.id == model.dbGame.host_id
      ? model.state.playerStates.host
      : model.state.playerStates.challenger;
  const playerHandSize =
    player?.profile.id == model.dbGame.host_id
      ? model.state.hands.host.length
      : model.state.hands.challenger.length;
  const playerDeckSize =
    player?.profile.id == model.dbGame.host_id
      ? model.state.decks.host.length
      : model.state.decks.challenger.length;

  const color = left
    ? "bg-gradient-to-b from-sky-950 to-blue-950"
    : "bg-gradient-to-b from-red-950 to-rose-950";
  const headerColor = left
    ? "bg-gradient-to-b from-sky-700 to-blue-800"
    : "bg-gradient-to-b from-red-700 to-rose-800";
  const borderColor = left ? "border-sky-600" : "border-red-600";

  return (
    <FloatingPanel
      color={color}
      headerColor={headerColor}
      borderColor={borderColor}
      title={player?.profile.username}
      top={gameConfig.gameViewVerticalPadding / 2 + gameConfig.panelPadding}
      {...position}
    >
      <div className="mb-4">
        Status: {player.connected ? "Connected" : "Disconnected"}
      </div>
      <div>
        HP: {playerState.hp} / {playerState.maxHp}
      </div>
      <div>
        MP: {playerState.mp} / {playerState.maxMp}
      </div>
      <div>Hand: {playerHandSize}</div>
      <div>Deck: {playerDeckSize}</div>
    </FloatingPanel>
  );
}

export default observer(PlayerView);
