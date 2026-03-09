import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  // POST - submit a vote (cada visitor só pode votar 1x por jogador)
  if (req.method === "POST") {
    const { voter, player, mira, cover, comunicacao, infectado, nocao, voterName } = req.body;
    if (!voter || !player) {
      return res.status(400).json({ error: "voter e player sao obrigatorios" });
    }
    if (voter === player) {
      return res.status(400).json({ error: "Voce nao pode votar em si mesmo" });
    }
    // Checa se já existe voto desse visitor para esse player
    const exists = await pool.query(
      "SELECT 1 FROM votes WHERE voter = $1 AND player = $2",
      [voter, player]
    );
    if (exists.rowCount > 0) {
      return res.status(400).json({ error: "Você já votou neste jogador." });
    }
    await pool.query(
      `INSERT INTO votes (voter, voter_name, player, mira, cover, comunicacao, infectado, nocao, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [voter, voterName || null, player, mira, cover, comunicacao, infectado, nocao]
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

  // DELETE - delete a specific vote or all votes
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
