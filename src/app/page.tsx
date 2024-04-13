import { ButtonLink } from "@/components/common/ButtonLink";
import { getAuthenticatedSupabaseOrRedirect } from "@/supabase/server";
import _ from "lodash";

export default async function Home() {
  const { user, supabase } = await getAuthenticatedSupabaseOrRedirect();

  // Fetch games.
  const hostedGames = await supabase
    .from("game")
    .select("*")
    .eq("host_id", user.id);
  if (hostedGames.error) {
    throw hostedGames.error;
  }

  const joinedGames = await supabase
    .from("game")
    .select()
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
    <main className="flex min-h-screen flex-col items-center p-16">
      <h1>Your games</h1>
      <ul>
        {hostedGames.data.map((game) => {
          const url = `/game/${game.id}`;
          return (
            <li key={game.id}>
              <a href={url}>Game {game.id}</a>
            </li>
          );
        })}
      </ul>

      <h1>Open games</h1>
      <ul>
        {openGames.data.map((game) => {
          const url = `/game/${game.id}`;
          return (
            <li key={game.id}>
              <a href={url}>
                Game {game.id} from {game.user_profile!.username}
              </a>
            </li>
          );
        })}
      </ul>
      <ButtonLink href="/new">Create game</ButtonLink>
    </main>
  );
}
