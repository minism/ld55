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
    cardDefsByEntityId["bear"],
    cardDefsByEntityId["bear"],
    cardDefsByEntityId["bear"],
    cardDefsByEntityId["bear"],
    cardDefsByEntityId["bear"],
  ];

  const cardViews = hand.map((c, i) => <CardView key={i} card={c} />);

  return (
    <div
      style={{
        position: "fixed",
        top: "90%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10,
      }}
      className="flex gap-2"
    >
      {cardViews}
    </div>
  );
}

export default observer(PlayerView);
