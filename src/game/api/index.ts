export async function apiAttack(req: any) {
  return apiRequest(req, "/api/attack");
}

export async function apiMove(req: any) {
  return apiRequest(req, "/api/move");
}

export async function apiEndTurn(req: any) {
  return apiRequest(req, "/api/end-turn");
}

export async function apiCast(req: any) {
  return apiRequest(req, "/api/cast");
}

async function apiRequest(req: any, url: string) {
  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(req),
  });
}
