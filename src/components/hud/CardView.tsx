import { CardDef } from "@/game/data/cardDefs";
import { observer } from "mobx-react-lite";

interface Props {
  card: CardDef;
}

function PlayerView(props: Props) {
  const { card } = props;
  return (
    <div className="bg-gray-200 rounded-lg text-black border-4 border-lg border-sky-900">
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
