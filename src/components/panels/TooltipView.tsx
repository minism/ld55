import FloatingPanel from "@/components/common/FloatingPanel";
import { TooltipModel } from "@/game/model/tooltipModel";
import { observer } from "mobx-react-lite";

interface Props {
  tooltip: TooltipModel;
}

function TooltipView(props: Props) {
  if (!props.tooltip.visible) {
    return null;
  }

  return (
    <FloatingPanel left={props.tooltip.positionX} top={props.tooltip.positionY}>
      <div>{props.tooltip.text}</div>
    </FloatingPanel>
  );
}

export default observer(TooltipView);
