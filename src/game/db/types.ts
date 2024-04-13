import { Database } from "@/generated/database.types";

export type UserProfile = Database["public"]["Tables"]["profile"]["Row"];
export type Game = Database["public"]["Tables"]["game"]["Row"];
