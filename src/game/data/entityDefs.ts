import { AssetKey } from "@/game/assets";
import gameConfig from "@/game/config/gameConfig";
import _ from "lodash";

export interface EntityDef {
  type: "wizard" | "summon";
  id: string;
  sprite: AssetKey;
  moveSpeed: number;
  attack: number;
  hp: number;
  range?: number;
}

const entityDefs: EntityDef[] = [
  {
    id: "wizard",
    type: "wizard",
    sprite: "wizard",
    moveSpeed: 1,
    attack: 0,
    hp: gameConfig.maxPlayerHealth,
  },
  {
    id: "jelly",
    type: "summon",
    sprite: "jelly",
    moveSpeed: 2,
    attack: 1,
    hp: 1,
  },
  {
    id: "golem",
    type: "summon",
    sprite: "golem",
    moveSpeed: 2,
    attack: 2,
    hp: 2,
  },
  {
    id: "archer",
    type: "summon",
    sprite: "archer",
    moveSpeed: 2,
    attack: 2,
    hp: 2,
    range: 2,
  },
  {
    id: "airElemental",
    type: "summon",
    sprite: "airElemental",
    moveSpeed: 3,
    attack: 2,
    hp: 4,
  },
];

export const entityDefsById = _.chain(entityDefs)
  .keyBy((e) => e.id)
  .value();
