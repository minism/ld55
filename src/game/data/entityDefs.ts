import { AssetKey } from "@/game/assets";
import gameConfig from "@/game/config/gameConfig";
import _ from "lodash";

export interface EntityDef {
  type: "wizard" | "summon";
  id: string;
  sprite: AssetKey;
  moveSpeed: number;
  hp: number;
}

const entityDefs: EntityDef[] = [
  {
    id: "wizard",
    type: "wizard",
    sprite: "wizard",
    moveSpeed: 1,
    hp: gameConfig.maxPlayerHealth,
  },
  {
    id: "bear",
    type: "summon",
    sprite: "bear",
    moveSpeed: 2,
    hp: 2,
  },
];

export const entityDefsById = _.chain(entityDefs)
  .keyBy((e) => e.id)
  .value();
