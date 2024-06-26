import _ from "lodash";

export interface CardDef {
  type: "summon" | "spell" | "mana";
  entityId: string;
  name: string;
  cost: number;
  extraText?: string;
}

const cardDefs: CardDef[] = [
  {
    entityId: "mana",
    type: "mana",
    name: "Mana Crystal",
    cost: 0,
    extraText: "Permanently gain 1 maximum MP",
  },
  {
    entityId: "jelly",
    type: "summon",
    name: "Jelly",
    cost: 1,
  },
  {
    entityId: "golem",
    type: "summon",
    name: "Golem",
    cost: 2,
  },
  {
    entityId: "minotaur",
    type: "summon",
    name: "Minotaur",
    cost: 2,
  },
  {
    entityId: "archer",
    type: "summon",
    name: "Elven Archer",
    cost: 3,
    extraText: "Moves at full speed through woods",
  },
  {
    entityId: "airElemental",
    type: "summon",
    name: "Air Elemental",
    cost: 4,
    extraText: "Can fly over water",
  },
  {
    entityId: "magicMissile",
    type: "spell",
    name: "Magic Missile",
    cost: 2,
    extraText: "Deals 2 damage to any target",
  },
  {
    entityId: "blink",
    type: "spell",
    name: "Blink",
    cost: 2,
    extraText: "Teleports to a location",
  },
  {
    entityId: "heal",
    type: "spell",
    name: "Heal",
    cost: 3,
    extraText: "Heals creatures in an area - NOT YET IMPLEMENTED",
  },
];

export const cardDefsByEntityId = _.chain(cardDefs)
  .keyBy((c) => c.entityId)
  .value();
