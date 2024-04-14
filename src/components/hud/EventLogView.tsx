import FloatingPanel from "@/components/common/FloatingPanel";
import gameConfig from "@/game/config/gameConfig";
import { EventLog } from "@/game/model/eventLog";
import { observer } from "mobx-react-lite";
import { useRef } from "react";

interface Props {
  eventLog: EventLog;
}

function EventLogView(props: Props) {
  const lines = props.eventLog.messages.map((m, i) => <div key={i}>{m}</div>);
  const endRef = useRef<HTMLDivElement | null>(null);

  if (endRef.current != null) {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <FloatingPanel
      title="Log"
      bottom={gameConfig.gameViewVerticalPadding / 2 + gameConfig.panelPadding}
      right={gameConfig.panelPadding}
    >
      <div className="w-[350px] h-48 overflow-y-scroll hidden md:block">
        <div className="font-mono text-xs">{lines}</div>
        <div ref={endRef} />
      </div>
    </FloatingPanel>
  );
}

export default observer(EventLogView);
