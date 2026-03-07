import { getStore } from "@netlify/blobs";

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

// Detecta modo desenvolvimento:
// - Em desenvolvimento local: DEV_MODE=true ou NETLIFY_LOCAL_EMULATION=true
// - Em PRODUÇÃO: NETLIFY_BUILD_CONTEXT = "production" (NUNCA retorna mocks)
const isDev =
  process.env.DEV_MODE === "true" ||
  (process.env.NETLIFY_LOCAL_EMULATION === "true" && process.env.NETLIFY_BUILD_CONTEXT !== "production");

export default async (req, context) => {
  // Em modo dev, usar dados de exemplo (APENAS em desenvolvimento local com netlify dev)
  if (isDev && req.method === "GET") {
    console.log("[DEV MODE] Retornando dados de exemplo - Votos");
    const url = new URL(req.url);
    const filterPlayer = url.searchParams.get("player");

    const votes = filterPlayer
      ? mockVotes.filter((v) => v.player === filterPlayer)
      : mockVotes;

    return new Response(JSON.stringify(votes), { status: 200 });
  }

  const store = getStore({ name: "votes", consistency: "strong" });

  // POST - submit a vote (one vote per voter-votee pair)
  if (req.method === "POST") {
    const { voter, player, mira, cover, comunicacao, infectado, nocao } =
      await req.json();

    if (!voter || !player) {
      return new Response(
        JSON.stringify({ error: "voter e player sao obrigatorios" }),
        { status: 400 }
      );
    }

    if (voter === player) {
      return new Response(
        JSON.stringify({ error: "Voce nao pode votar em si mesmo" }),
        { status: 400 }
      );
    }

    const key = `${voter.replace(/[^a-zA-Z0-9]/g, "_")}__${player.replace(/[^a-zA-Z0-9]/g, "_")}`;

    const existing = await store.get(key);
    if (existing) {
      return new Response(
        JSON.stringify({ error: "Voce ja votou neste jogador" }),
        { status: 409 }
      );
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

    await store.setJSON(key, voteData);

    return new Response(JSON.stringify({ message: "Voto salvo!" }), {
      status: 200,
    });
  }

  // GET - get all votes (optionally filter by ?player=email)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const filterPlayer = url.searchParams.get("player");

    const { blobs } = await store.list();
    const votes = [];

    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: "json" });
      if (data) {
        if (!filterPlayer || data.player === filterPlayer) {
          votes.push(data);
        }
      }
    }

    return new Response(JSON.stringify(votes), { status: 200 });
  }

  // DELETE - delete a specific vote or all votes (admin)
  if (req.method === "DELETE") {
    const body = await req.json().catch(() => ({}));

    if (body.voter && body.player) {
      const key = `${body.voter.replace(/[^a-zA-Z0-9]/g, "_")}__${body.player.replace(/[^a-zA-Z0-9]/g, "_")}`;
      await store.delete(key);
      return new Response(JSON.stringify({ message: "Voto removido!" }), {
        status: 200,
      });
    }

    // Delete all votes
    const { blobs } = await store.list();
    for (const blob of blobs) {
      await store.delete(blob.key);
    }

    return new Response(JSON.stringify({ message: "Todos os votos apagados!" }), {
      status: 200,
    });
  }

  return new Response("Method not allowed", { status: 405 });
};
