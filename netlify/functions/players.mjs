import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore({ name: "players", consistency: "strong" });

  // POST - register a player on login
  if (req.method === "POST") {
    const { email, name } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email obrigatorio" }), {
        status: 400,
      });
    }

    const key = email.replace(/[^a-zA-Z0-9]/g, "_");
    const existing = await store.get(key);

    if (!existing) {
      await store.setJSON(key, {
        email,
        name: name || email.split("@")[0],
        registeredAt: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ message: "Jogador registrado!" }), {
      status: 200,
    });
  }

  // GET - list all players
  if (req.method === "GET") {
    const { blobs } = await store.list();
    const players = [];

    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: "json" });
      if (data) {
        players.push(data);
      }
    }

    return new Response(JSON.stringify(players), { status: 200 });
  }

  // DELETE - remove a player (admin only)
  if (req.method === "DELETE") {
    const { email } = await req.json();
    const key = email.replace(/[^a-zA-Z0-9]/g, "_");
    await store.delete(key);

    return new Response(JSON.stringify({ message: "Jogador removido!" }), {
      status: 200,
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: "/.netlify/functions/players",
};
