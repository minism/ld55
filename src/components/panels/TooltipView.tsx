import FloatingPanel from "@/components/common/FloatingPanel";
import { entityDefsById } from "@/game/data/entityDefs";
import { TooltipModel } from "@/game/model/tooltipModel";
import { capitalize } from "lodash";
import { observer } from "mobx-react-lite";

interface Props {
  tooltip: TooltipModel;
}

function TooltipView(props: Props) {
  const { tooltip } = props;
  if (!tooltip.visible || tooltip.entities.length < 1) {
    return null;
  }

  const entity = tooltip.entities[0];
  const def = entityDefsById[entity.def];

  return (
    <FloatingPanel
      title={capitalize(def.id)}
      left={props.tooltip.positionX + 20}
      top={props.tooltip.positionY + 20}
    >
      <div>HP: {entity.hp}</div>
    </FloatingPanel>
  );
}

export default observer(TooltipView);
