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
      bottom={gameConfig.gameViewVerticalPadding / 2 + gameConfig.panelPadding}
      right={gameConfig.panelPadding}
    >
      <div className="min-w-96">
        <div className="mb-2">Event log</div>
        <div className="font-mono text-xs">{lines}</div>
      </div>
    </FloatingPanel>
  );
}

export default observer(EventLogView);
