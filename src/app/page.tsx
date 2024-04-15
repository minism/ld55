import { ButtonLink } from "@/components/common/ButtonLink";
import { isDefined } from "@/game/util/typescript";
import { getAuthenticatedSupabaseOrRedirect } from "@/supabase/server";
import _ from "lodash";
import moment, { now } from "moment";

export default async function Home() {
  const { user, supabase } = await getAuthenticatedSupabaseOrRedirect();

  // Fetch games created in the last 24 hours only for now.
  const { data: allGames } = await supabase
    .from("game")
    .select("*")
    .gt("created_at", moment().subtract(1, "day").toISOString())
    .throwOnError();

  const playerIds = _.chain(allGames)
    .map((g) => [g.host_id, g.challenger_id])
    .flatten()
    .filter(isDefined)
    .uniq()
    .value();

  const { data: allPlayers } = await supabase
    .from("user_profile")
    .select("*")
    .in("id", playerIds)
    .throwOnError();

  const playersById = _.chain(allPlayers)
    .keyBy((p) => p.id)
    .value();

  const yourGames = allGames!.filter(
    (g) => g.host_id == user.id || g.challenger_id == user.id
  );
  const openGames = allGames!.filter(
    (g) => g.host_id != user.id && g.challenger_id == null
  );
  const specGames = allGames!.filter(
    (g) =>
      g.challenger_id != null &&
      g.challenger_id != user.id &&
      g.host_id != user.id
  );

  function created(game: any) {
    return `(${moment(game.created_at).fromNow()})`;
  }

  return (
    <main className="flex min-h-screen flex-col p-16">
      <h1 className="text-4xl mb-8">Summoner's Duel!</h1>
      <div className="max-w-2xl mb-8">
        <ButtonLink href="/new">Create new game</ButtonLink>
      </div>
      <h1 className="text-2xl">Your games</h1>
      <ul className="p-4">
        {yourGames.map((game) => {
          const url = `/game/${game.id}`;
          const other =
            game.host_id == user.id
              ? playersById[game.challenger_id ?? ""]
              : playersById[game.host_id];
          return (
            <li key={game.id} className="p-2 flex items-center gap-2">
              <ButtonLink href={url}>Join</ButtonLink>
              <div>
                Game{" "}
                {other ? " with " + other.username : "(Waiting for opponent)"}{" "}
                {created(game)}
              </div>
            </li>
          );
        })}
      </ul>

      <h1 className="text-2xl">Open games</h1>
      <ul className="p-4">
        {openGames.map((game) => {
          const url = `/game/${game.id}`;
          const host = playersById[game.host_id];
          return (
            <li key={game.id} className="p-2 flex items-center gap-2">
              <ButtonLink href={url}>Join</ButtonLink>
              <div>
                Game with {host.username} {created(game)}
              </div>
            </li>
          );
        })}
      </ul>

      <h1 className="text-2xl">Other games in progress</h1>
      <ul className="p-4">
        {specGames.map((game) => {
          const url = `/game/${game.id}`;
          const host = playersById[game.host_id];
          const chal = playersById[game.challenger_id!];
          return (
            <li key={game.id} className="p-2 flex items-center gap-2">
              <ButtonLink href={url}>Watch</ButtonLink>
              <div>
                Game between {host.username} and {chal.username} {created(game)}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
