import PreviewWorldClient from "@/components/PreviewWorldClient";

export default async function Game({ params }: { params: { id: string } }) {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="p-4">
        <h1 className="text-xl">World generation preview</h1>
      </div>
      <PreviewWorldClient />
    </main>
  );
}
