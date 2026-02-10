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
    headers: { "Content-Type": "application/json" }
  })
}
