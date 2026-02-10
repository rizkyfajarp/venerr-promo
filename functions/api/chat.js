export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-SECRET"
    }
  })
}

export async function onRequestPost({ request, env }) {
  const res = await fetch(env.BACKEND_URL + "/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-SECRET": env.INTERNAL_SECRET
    },
    body: await request.text()
  })

  return new Response(await res.text(), {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  })
}
