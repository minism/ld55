import { GameState } from "@/game/db/gameState";
import { Database } from "@/generated/database.types";

export type UserProfile = Database["public"]["Tables"]["user_profile"]["Row"];
export type Game = Database["public"]["Tables"]["game"]["Row"] & {
  state: GameState;
};
