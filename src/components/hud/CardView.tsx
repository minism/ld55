import { CardDef } from "@/game/data/cardDefs";
import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { useHover } from "usehooks-ts";
import _ from "lodash";
import { lerp } from "@/game/util/math";
import { entityDefsById } from "@/game/data/entityDefs";
import { getAssetUrl } from "@/game/assets";

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
  const translateY = isHovering ? -120 : lerp(0, fanFactor * 3, translateTheta);

  const scale = isHovering ? 1.5 : 0.75;

  const headerColor = card.type == "summon" ? "bg-sky-300" : "bg-purple-300";

  const entityDef = entityDefsById[card.entityId];
  const imageUrl = getAssetUrl(entityDef.sprite);

  const contents =
    card.type == "summon"
      ? [
          `Speed: ${entityDef.moveSpeed}`,
          `Attack: ${entityDef.attack}`,
          `HP: ${entityDef.hp}`,
          null,
          card.extraText,
        ]
      : [card.extraText];

  return (
    <div
      className="bg-slate-700 rounded-lg text-black border-2 border-lg border-white w-36 -mx-8 transition-all text-xs cursor-pointer sele"
      style={{
        zIndex: isHovering ? 10 : 1,
        scale,
        rotate: `${rotation}deg`,
        translate: `0 ${translateY}px`,
      }}
      ref={hoverRef}
    >
      <div
        className={`p-1 font-semibold rounded-md border border-white ${headerColor}`}
      >
        <div className="flex">
          <div className="flex-1">{card.name}</div>
          <div className="bg-sky-900 text-white rounded-full w-4 h-4 text-center text-xs">
            {card.cost}
          </div>
        </div>
      </div>
      <div
        className="flex items-center justify-center p-2"
        style={{
          imageRendering: "pixelated",
        }}
      >
        <img src={imageUrl} width={64} height={64} />
      </div>
      <div
        className="p-2 m-2 bg-white rounded-lg"
        style={{
          fontSize: "0.6rem",
        }}
      >
        <div className="h-24">
          {contents.map((text, i) => (
            <div key={i}>{text}&nbsp;</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default observer(PlayerView);
