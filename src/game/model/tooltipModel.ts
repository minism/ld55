import { makeAutoObservable } from "mobx";

export class TooltipModel {
  visible = false;
  positionX: number = 0;
  positionY: number = 0;
  text: string = "";

  constructor() {
    makeAutoObservable(this);
  }
}
