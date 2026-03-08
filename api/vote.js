import { kv } from "@vercel/kv";

// Mock data para desenvolvimento local
const mockVotes = [
  // Votos para John Doe
  {
    voter: "jane.smith@example.com",
    player: "john.doe@example.com",
    mira: 4,
    cover: 5,
    comunicacao: 4,
    infectado: 3,
    nocao: 4,
    createdAt: "2025-01-06T10:00:00Z",
  },
  {
    voter: "alex.johnson@example.com",
    player: "john.doe@example.com",
    mira: 5,
    cover: 4,
    comunicacao: 5,
    infectado: 4,
    nocao: 5,
    createdAt: "2025-01-06T11:00:00Z",
  },
  {
    voter: "chris.wilson@example.com",
    player: "john.doe@example.com",
    mira: 4,
    cover: 4,
    comunicacao: 3,
    infectado: 3,
    nocao: 4,
    createdAt: "2025-01-06T12:00:00Z",
  },
  // Votos para Jane Smith
  {
    voter: "john.doe@example.com",
    player: "jane.smith@example.com",
    mira: 3,
    cover: 4,
    comunicacao: 5,
    infectado: 4,
    nocao: 3,
    createdAt: "2025-01-07T10:00:00Z",
  },
  {
    voter: "alex.johnson@example.com",
    player: "jane.smith@example.com",
    mira: 4,
    cover: 3,
    comunicacao: 5,
    infectado: 5,
    nocao: 4,
    createdAt: "2025-01-07T11:00:00Z",
  },
  {
    voter: "sam.brown@example.com",
    player: "jane.smith@example.com",
    mira: 3,
    cover: 3,
    comunicacao: 4,
    infectado: 4,
    nocao: 3,
    createdAt: "2025-01-07T12:00:00Z",
  },
  // Votos para Alex Johnson
  {
    voter: "john.doe@example.com",
    player: "alex.johnson@example.com",
    mira: 5,
    cover: 5,
    comunicacao: 4,
    infectado: 2,
    nocao: 5,
    createdAt: "2025-01-08T10:00:00Z",
  },
  {
    voter: "jane.smith@example.com",
    player: "alex.johnson@example.com",
    mira: 4,
    cover: 4,
    comunicacao: 3,
    infectado: 2,
    nocao: 4,
    createdAt: "2025-01-08T11:00:00Z",
  },
  // Votos para Chris Wilson
  {
    voter: "john.doe@example.com",
    player: "chris.wilson@example.com",
    mira: 3,
    cover: 3,
    comunicacao: 3,
    infectado: 4,
    nocao: 3,
    createdAt: "2025-01-09T10:00:00Z",
  },
  {
    voter: "jane.smith@example.com",
    player: "chris.wilson@example.com",
    mira: 2,
    cover: 3,
    comunicacao: 2,
    infectado: 5,
    nocao: 2,
    createdAt: "2025-01-09T11:00:00Z",
  },
  {
    voter: "sam.brown@example.com",
    player: "chris.wilson@example.com",
    mira: 3,
    cover: 4,
    comunicacao: 3,
    infectado: 4,
    nocao: 3,
    createdAt: "2025-01-09T12:00:00Z",
  },
  // Votos para Sam Brown
  {
    voter: "john.doe@example.com",
    player: "sam.brown@example.com",
    mira: 2,
    cover: 2,
    comunicacao: 4,
    infectado: 3,
    nocao: 2,
    createdAt: "2025-01-10T10:00:00Z",
  },
  {
    voter: "alex.johnson@example.com",
    player: "sam.brown@example.com",
    mira: 3,
    cover: 3,
    comunicacao: 4,
    infectado: 3,
    nocao: 3,
    createdAt: "2025-01-10T11:00:00Z",
  },
];

// Modo desenvolvimento: APENAS com VERCEL_ENV=development (vercel dev)
const isDev = process.env.VERCEL_ENV === "development";

export default async function handler(req, res) {
  // Em modo dev LOCAL, usar dados de exemplo para GET
  if (isDev && req.method === "GET") {
    console.log("[DEV MODE LOCAL] Retornando dados de exemplo - Votos");
    const filterPlayer = req.query.player;

    const votes = filterPlayer
      ? mockVotes.filter((v) => v.player === filterPlayer)
      : mockVotes;

    return res.status(200).json(votes);
  }

  // POST - submit a vote (one vote per voter-votee pair)
  if (req.method === "POST") {
    const { voter, player, mira, cover, comunicacao, infectado, nocao } =
      req.body;

    if (!voter || !player) {
      return res
        .status(400)
        .json({ error: "voter e player sao obrigatorios" });
    }

    if (voter === player) {
      return res
        .status(400)
        .json({ error: "Voce nao pode votar em si mesmo" });
    }

    const key = `votes:${voter.replace(/[^a-zA-Z0-9]/g, "_")}__${player.replace(/[^a-zA-Z0-9]/g, "_")}`;

    const existing = await kv.get(key);
    if (existing) {
      return res.status(409).json({ error: "Voce ja votou neste jogador" });
    }

    const voteData = {
      voter,
      player,
      mira,
      cover,
      comunicacao,
      infectado,
      nocao,
      createdAt: new Date().toISOString(),
    };

    await kv.set(key, voteData);

    return res.status(200).json({ message: "Voto salvo!" });
  }

  // GET - get all votes (optionally filter by ?player=email)
  if (req.method === "GET") {
    const filterPlayer = req.query.player;

    const keys = await kv.keys("votes:*");
    const votes = [];

    for (const key of keys) {
      const data = await kv.get(key);
      if (data) {
        if (!filterPlayer || data.player === filterPlayer) {
          votes.push(data);
        }
      }
    }

    return res.status(200).json(votes);
  }

  // DELETE - delete a specific vote or all votes (admin)
  if (req.method === "DELETE") {
    const body = req.body || {};

    if (body.voter && body.player) {
      const key = `votes:${body.voter.replace(/[^a-zA-Z0-9]/g, "_")}__${body.player.replace(/[^a-zA-Z0-9]/g, "_")}`;
      await kv.del(key);
      return res.status(200).json({ message: "Voto removido!" });
    }

    // Delete all votes
    const keys = await kv.keys("votes:*");
    for (const key of keys) {
      await kv.del(key);
    }

    return res.status(200).json({ message: "Todos os votos apagados!" });
  }

  return res.status(405).send("Method not allowed");
}
