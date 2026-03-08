import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

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
    const { voter, player, mira, cover, comunicacao, infectado, nocao } = req.body;

    if (!voter || !player) {
      return res.status(400).json({ error: "voter e player sao obrigatorios" });
    }

    if (voter === player) {
      return res.status(400).json({ error: "Voce nao pode votar em si mesmo" });
    }

    await pool.query(
      `INSERT INTO votes (voter, player, mira, cover, comunicacao, infectado, nocao, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (voter, player) DO UPDATE SET mira = $3, cover = $4, comunicacao = $5, infectado = $6, nocao = $7, created_at = NOW()`,
      [voter, player, mira, cover, comunicacao, infectado, nocao]
    );

    return res.status(200).json({ message: "Voto salvo!" });
  }

  // GET - get all votes (optionally filter by ?player=email)
  if (req.method === "GET") {
    const filterPlayer = req.query.player;
    let result;
    if (filterPlayer) {
      result = await pool.query("SELECT * FROM votes WHERE player = $1", [filterPlayer]);
    } else {
      result = await pool.query("SELECT * FROM votes");
    }
    return res.status(200).json(result.rows);
  }

  // DELETE - delete a specific vote or all votes (admin)
  if (req.method === "DELETE") {
    const body = req.body || {};

    if (body.voter && body.player) {
      await pool.query("DELETE FROM votes WHERE voter = $1 AND player = $2", [body.voter, body.player]);
      return res.status(200).json({ message: "Voto removido!" });
    }

    await pool.query("DELETE FROM votes");
    return res.status(200).json({ message: "Todos os votos apagados!" });
  }

  return res.status(405).send("Method not allowed");
}
