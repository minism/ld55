import { AssetKey } from "@/game/assets";
import gameConfig from "@/game/config/gameConfig";
import _ from "lodash";

export interface EntityDef {
  type: "wizard" | "summon" | "spell" | "mana" | "cosmetic";
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
    id: "mana",
    type: "mana",
    sprite: "manaCrystal",
    moveSpeed: 0,
    attack: 0,
    hp: 0,
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
    moveSpeed: 1,
    attack: 2,
    hp: 4,
  },
  {
    id: "minotaur",
    type: "summon",
    sprite: "minotaur",
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
  {
    id: "magicMissile",
    type: "spell",
    sprite: "magicMissile",
    moveSpeed: 4,
    attack: 2,
    hp: 0,
  },
  {
    id: "blink",
    type: "spell",
    sprite: "blink",
    moveSpeed: 6,
    attack: 2,
    hp: 0,
  },
  {
    id: "heal",
    type: "spell",
    sprite: "heal",
    moveSpeed: 6,
    attack: 2,
    hp: 0,
  },
  {
    id: "summonIndicator",
    type: "cosmetic",
    sprite: "summon",
    moveSpeed: 0,
    attack: 0,
    hp: 0,
  },
];

export const entityDefsById = _.chain(entityDefs)
  .keyBy((e) => e.id)
  .value();
