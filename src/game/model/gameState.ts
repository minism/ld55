import { makeAutoObservable } from "mobx";

// Client game state representation.
export class GameState {
  secondsPassed = 0;
  constructor() {
    makeAutoObservable(this);
  }

  incr() {
    this.secondsPassed += 1;
  }
}
