import { ButtonLink } from "@/components/common/ButtonLink";
import { getAuthenticatedSupabaseOrRedirect } from "@/supabase/server";
import _ from "lodash";

export default async function Home() {
  const { user, supabase } = await getAuthenticatedSupabaseOrRedirect();

  // Fetch games.
  const hostedGames = await supabase
    .from("game")
    .select("*, user_profile!public_game_challenger_id_fkey (*)")
    .eq("host_id", user.id);
  if (hostedGames.error) {
    throw hostedGames.error;
  }

  const joinedGames = await supabase
    .from("game")
    .select("*, user_profile!public_game_host_id_fkey (*)")
    .eq("challenger_id", user.id);
  if (joinedGames.error) {
    throw joinedGames.error;
  }

  const yourGames = _.chain([...hostedGames.data, ...joinedGames.data])
    .uniqBy((g) => g.id)
    .value();

  const openGames = await supabase
    .from("game")
    .select("*, user_profile!public_game_host_id_fkey (*)")
    .neq("host_id", user.id)
    .is("challenger_id", null);

  if (openGames.error) {
    throw openGames.error;
  }

  return (
    <main className="flex min-h-screen flex-col p-16">
      <h1 className="text-4xl mb-8">Summoner's Duel!</h1>
      <div className="max-w-2xl mb-8">
        <ButtonLink href="/new">Create new game</ButtonLink>
      </div>
      <h1 className="text-2xl">Your games</h1>
      <ul className="p-4">
        {hostedGames.data.map((game) => {
          const url = `/game/${game.id}`;
          return (
            <li key={game.id} className="p-2 flex items-center gap-2">
              <ButtonLink href={url}>Join</ButtonLink>
              <div>
                Game{" "}
                {game.user_profile?.username
                  ? " with " + game.user_profile.username
                  : "(Waiting for opponent)"}
              </div>
            </li>
          );
        })}
      </ul>

      <h1 className="text-2xl">Open games</h1>
      <ul className="p-4">
        {openGames.data.map((game) => {
          const url = `/game/${game.id}`;
          return (
            <li key={game.id} className="p-2 flex items-center gap-2">
              <ButtonLink href={url}>Join</ButtonLink>
              <div>
                Game{" "}
                {game.user_profile?.username
                  ? " with " + game.user_profile.username
                  : "(Waiting for opponent)"}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
