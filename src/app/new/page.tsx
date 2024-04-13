import { initialGameState } from "@/game/db/gameState";
import { getAuthenticatedSupabaseOrRedirect } from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function NewGame() {
  const { user, supabase } = await getAuthenticatedSupabaseOrRedirect();

  const response = await supabase
    .from("game")
    // @ts-expect-error: JSON type for state.
    .insert({ host_id: user.id, state: initialGameState() })
    .select("*")
    .single();
  if (response.error) {
    throw response.error;
  }

  return redirect(`/game/${response.data.id}`);
}
