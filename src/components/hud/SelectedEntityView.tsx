import FloatingPanel from "@/components/common/FloatingPanel";
import gameConfig from "@/game/config/gameConfig";
import { entityDefsById } from "@/game/data/entityDefs";
import { GameModel } from "@/game/model/gameModel";
import { capitalize } from "lodash";
import { observer } from "mobx-react-lite";

interface Props {
  model: GameModel;
}

function SelectedEntityView(props: Props) {
  const { model } = props;

  if (model.selectedEntity == null) {
    return null;
  }

  const entity = model.selectedEntity;
  const def = entityDefsById[entity.def];

  return (
    <FloatingPanel
      title={capitalize(def.id)}
      bottom={gameConfig.gameViewVerticalPadding / 2 + gameConfig.panelPadding}
      left={gameConfig.panelPadding}
    >
      <div className="h-48 min-w-48">
        <div>Actions left: {entity.remainingActions}</div>
        <div>
          HP: {entity.hp} / {def.hp}
        </div>
        <div>Move speed: {def.moveSpeed}</div>
      </div>
    </FloatingPanel>
  );
}

export default observer(SelectedEntityView);
