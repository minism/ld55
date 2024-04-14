import { Hex } from "honeycomb-grid";

// This could be an event bus but is an interface for now
export interface IGameEvents {
  handleClickWorldHex(hex: Hex): void;
  handleShowHexTooltip(hex: Hex): void;
  handleHideTooltip(): void;
}
