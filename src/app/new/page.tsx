import { initialGameState } from "@/game/logic/initialState";
import { getAuthenticatedSupabaseOrRedirect } from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function NewGame() {
  const { user, supabase } = await getAuthenticatedSupabaseOrRedirect();

  const response = await supabase
    .from("game")
    .insert({ host_id: user.id, state: initialGameState() as unknown as any })
    .select("*")
    .single();
  if (response.error) {
    throw response.error;
  }

  return redirect(`/game/${response.data.id}`);
}
