import GameContainer from "../components/GameContainer";

export default function Home() {
  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <main className="flex min-h-screen flex-col items-center p-16">
      <h1 className="text-xl">LD55</h1>
      <GameContainer />
    </main>
  );
}
