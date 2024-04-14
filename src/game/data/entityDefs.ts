import { AssetKey } from "@/game/assets";
import _ from "lodash";

export interface EntityDef {
  id: string;
  sprite: AssetKey;
  moveSpeed: number;
}

const entityDefs: EntityDef[] = [
  {
    id: "wizard",
    sprite: "wizard",
    moveSpeed: 1,
  },
  {
    id: "bear",
    sprite: "bear",
    moveSpeed: 2,
  },
];

export const entityDefsById = _.chain(entityDefs)
  .keyBy((e) => e.id)
  .value();
