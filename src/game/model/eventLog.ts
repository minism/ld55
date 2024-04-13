import { makeAutoObservable } from "mobx";

export class EventLog {
  messages: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  public log(message: string) {
    // TODO: limit here.
    this.messages = [...this.messages, message];
  }
}
