export async function onRequest(context) {
  const { request, env } = context;

  // ✅ HANDLE PREFLIGHT
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-SECRET"
      }
    });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const res = await fetch(env.BACKEND_URL + "/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-SECRET": env.INTERNAL_SECRET
    },
    body: await request.text()
  });

  return new Response(await res.text(), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
