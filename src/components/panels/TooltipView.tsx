import FloatingPanel from "@/components/common/FloatingPanel";
import { TooltipModel } from "@/game/model/tooltipModel";
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

  return (
    <FloatingPanel left={props.tooltip.positionX} top={props.tooltip.positionY}>
      <div>{entity.type}</div>
    </FloatingPanel>
  );
}

export default observer(TooltipView);
