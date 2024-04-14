import FloatingPanel from "@/components/common/FloatingPanel";
import gameConfig from "@/game/config/gameConfig";
import { EventLog } from "@/game/model/eventLog";
import { observer } from "mobx-react-lite";

interface Props {
  eventLog: EventLog;
}

function EventLogView(props: Props) {
  const lines = props.eventLog.messages.map((m, i) => <div key={i}>{m}</div>);

  return (
    <FloatingPanel
      title="Log"
      bottom={gameConfig.gameViewVerticalPadding / 2 + gameConfig.panelPadding}
      right={gameConfig.panelPadding}
    >
      <div className="w-[400px] h-64 overflow-y-scroll">
        <div className="font-mono text-xs">{lines}</div>
      </div>
    </FloatingPanel>
  );
}

export default observer(EventLogView);
