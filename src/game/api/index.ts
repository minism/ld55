export async function apiMove(req: any) {
  return await fetch("/api/move", {
    method: "POST",
    body: JSON.stringify(req),
  });
}
