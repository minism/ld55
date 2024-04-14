import CardView from "@/components/hud/CardView";
import { cardDefsByEntityId } from "@/game/data/cardDefs";
import { GameModel } from "@/game/model/gameModel";
import { observer } from "mobx-react-lite";

interface Props {
  model: GameModel;
}

function PlayerView(props: Props) {
  const { model } = props;

  const hand = [
    cardDefsByEntityId["jelly"],
    cardDefsByEntityId["golem"],
    cardDefsByEntityId["archer"],
    cardDefsByEntityId["airElemental"],
    cardDefsByEntityId["magicMissile"],
    cardDefsByEntityId["blink"],
    cardDefsByEntityId["heal"],
  ];

  const cardViews = hand.map((c, i) => (
    <CardView key={i} card={c} position={i} totalCards={hand.length} />
  ));

  return (
    <div
      style={{
        position: "fixed",
        bottom: "0",
        left: "50%",
        transform: "translate(-50%, 25%)",
        zIndex: 10,
      }}
      className="flex gap-2"
    >
      {cardViews}
    </div>
  );
}

export default observer(PlayerView);
