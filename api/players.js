import { kv } from "@vercel/kv";

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

// Modo desenvolvimento: APENAS com VERCEL_ENV=development (vercel dev)
const isDev = process.env.VERCEL_ENV === "development";

export default async function handler(req, res) {
  // Em modo dev LOCAL, usar dados de exemplo para GET
  if (isDev && req.method === "GET") {
    console.log("[DEV MODE LOCAL] Retornando dados de exemplo - Jogadores");
    return res.status(200).json(mockPlayers);
  }

  // POST - register a player on login
  if (req.method === "POST") {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email obrigatorio" });
    }

    const key = `players:${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const existing = await kv.get(key);

    if (!existing) {
      await kv.set(key, {
        email,
        name: name || email.split("@")[0],
        registeredAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({ message: "Jogador registrado!" });
  }

  // GET - list all players
  if (req.method === "GET") {
    const keys = await kv.keys("players:*");
    const players = [];

    for (const key of keys) {
      const data = await kv.get(key);
      if (data) {
        players.push(data);
      }
    }

    return res.status(200).json(players);
  }

  // DELETE - remove a player (admin only)
  if (req.method === "DELETE") {
    const { email } = req.body;
    const key = `players:${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
    await kv.del(key);

    // Remover votos relacionados a esse jogador
    try {
      const voteKeys = await kv.keys("votes:*");
      for (const voteKey of voteKeys) {
        const vote = await kv.get(voteKey);
        if (vote && (vote.voter === email || vote.player === email)) {
          await kv.del(voteKey);
        }
      }
    } catch (e) {
      // log error, mas não falha a deleção do jogador
      console.error("Erro ao deletar votos relacionados ao jogador:", e);
    }

    return res
      .status(200)
      .json({ message: "Jogador e votos relacionados removidos!" });
  }

  return res.status(405).send("Method not allowed");
}
