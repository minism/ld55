import _ from "lodash";

export interface CardDef {
  type: "summon";
  entityId: string;
  name: string;
}

const cardDefs: CardDef[] = [
  {
    entityId: "bear",
    type: "summon",
    name: "Bear",
  },
];

export const cardDefsByEntityId = _.chain(cardDefs)
  .keyBy((c) => c.entityId)
  .value();
