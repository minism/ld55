export async function apiMove(req: any) {
  return apiRequest(req, "/api/move");
}

export async function apiEndTurn(req: any) {
  return apiRequest(req, "/api/end-turn");
}

async function apiRequest(req: any, url: string) {
  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(req),
  });
}
