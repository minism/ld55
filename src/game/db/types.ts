import { Database } from "@/generated/database.types";

export type UserProfile = Database["public"]["Tables"]["user_profile"]["Row"];
export type Game = Database["public"]["Tables"]["game"]["Row"];
