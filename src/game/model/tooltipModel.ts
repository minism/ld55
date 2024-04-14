import { Entity } from "@/game/db/gameState";
import { WorldTile } from "@/game/model/WorldTile";
import { makeAutoObservable } from "mobx";

export class TooltipModel {
  visible = false;
  positionX: number = 0;
  positionY: number = 0;

  tile: WorldTile | null = null;
  entities: Entity[] = [];

  constructor() {
    makeAutoObservable(this);
  }
}
