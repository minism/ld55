import { CardDef } from "@/game/data/cardDefs";
import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { useHover } from "usehooks-ts";
import _ from "lodash";
import { lerp } from "@/game/util/math";

interface Props {
  card: CardDef;
  position: number;
  totalCards: number;
}

function PlayerView(props: Props) {
  const { card, position, totalCards } = props;
  const hoverRef = useRef(null);
  const isHovering = useHover(hoverRef);

  const fanFactor = 15;
  const theta = (position + 1) / (totalCards + 1);
  const rotation = isHovering ? 0 : lerp(-fanFactor, fanFactor, theta);

  const translateTheta = Math.abs(theta - 0.5);
  const translateY = isHovering ? -50 : lerp(0, fanFactor * 3, translateTheta);

  const scale = isHovering ? 1.5 : 1;

  return (
    <div
      className="bg-gray-200 rounded-lg text-black border-4 border-lg border-sky-900 w-32 -mx-8 transition-all"
      style={{
        zIndex: isHovering ? 10 : 1,
        scale,
        rotate: `${rotation}deg`,
        translate: `0 ${translateY}px`,
      }}
      ref={hoverRef}
    >
      <div className="py-2 px-4 bg-gradient-to-b from-sky-400 to-sky-500">
        {card.name}
      </div>
      <div className="p-4">
        <div className="h-24">Card</div>
      </div>
    </div>
  );
}

export default observer(PlayerView);
