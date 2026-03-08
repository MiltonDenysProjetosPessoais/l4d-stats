import { getStore } from "@netlify/blobs";

// Mock data para desenvolvimento local
const mockPlayers = [
  {
    email: "john.doe@example.com",
    name: "John Doe",
    registeredAt: "2025-01-01T10:00:00Z",
  },
  {
    email: "jane.smith@example.com",
    name: "Jane Smith",
    registeredAt: "2025-01-02T10:00:00Z",
  },
  {
    email: "alex.johnson@example.com",
    name: "Alex Johnson",
    registeredAt: "2025-01-03T10:00:00Z",
  },
  {
    email: "chris.wilson@example.com",
    name: "Chris Wilson",
    registeredAt: "2025-01-04T10:00:00Z",
  },
  {
    email: "sam.brown@example.com",
    name: "Sam Brown",
    registeredAt: "2025-01-05T10:00:00Z",
  },
];

// Modo desenvolvimento: APENAS com NETLIFY_LOCAL_EMULATION=true (netlify dev)
const isDev = process.env.NETLIFY_LOCAL_EMULATION === "true";

export default async (req, context) => {
  // Em modo dev LOCAL, usar dados de exemplo para GET
  if (isDev && req.method === "GET") {
    console.log("[DEV MODE LOCAL] Retornando dados de exemplo - Jogadores");
    return new Response(JSON.stringify(mockPlayers), { status: 200 });
  }

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

    // Remover votos relacionados a esse jogador
    try {
      const votesStore = getStore({ name: "votes", consistency: "strong" });
      const { blobs: voteBlobs } = await votesStore.list();
      for (const blob of voteBlobs) {
        const vote = await votesStore.get(blob.key, { type: "json" });
        if (vote && (vote.voter === email || vote.player === email)) {
          await votesStore.delete(blob.key);
        }
      }
    } catch (e) {
      // log error, mas não falha a deleção do jogador
      console.error("Erro ao deletar votos relacionados ao jogador:", e);
    }

    return new Response(
      JSON.stringify({ message: "Jogador e votos relacionados removidos!" }),
      {
        status: 200,
      }
    );
  }

  return new Response("Method not allowed", { status: 405 });
};
