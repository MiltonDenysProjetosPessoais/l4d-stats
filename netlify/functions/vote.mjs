import { getStore } from "@netlify/blobs";

export default async (req, context) => {
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
