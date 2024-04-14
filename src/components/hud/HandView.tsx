import CardView from "@/components/hud/CardView";
import { IGameEvents } from "@/game/controller/IGameEvents";
import { CardDef, cardDefsByEntityId } from "@/game/data/cardDefs";
import { GameModel } from "@/game/model/gameModel";
import { observer } from "mobx-react-lite";

interface Props {
  model: GameModel;
  handler: IGameEvents;
}

function PlayerView(props: Props) {
  const { model } = props;

  function handleClick(cardIndex: number) {
    props.handler.handleTryCast(cardIndex);
  }

  const hand = model.getOurHand().map((id) => cardDefsByEntityId[id]);
  const cardViews = hand.map((c, i) => (
    <CardView
      key={i}
      card={c}
      position={i}
      totalCards={hand.length}
      onClick={() => handleClick(i)}
    />
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
