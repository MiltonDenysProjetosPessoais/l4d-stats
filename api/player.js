import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  // GET - listar todos os jogadores
  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT id, name, created_at FROM players ORDER BY name ASC");
      // Adapta para o formato esperado pelo frontend (com campo 'email' igual ao 'name')
      const players = result.rows.map(row => ({
        email: row.name, // para compatibilidade com frontend
        name: row.name,
        registeredAt: row.created_at,
        id: row.id,
      }));
      return res.status(200).json(players);
    } catch (err) {
      return res.status(500).json({ error: "Erro ao buscar jogadores", details: err.message });
    }
  }

  // POST - adicionar jogador
  if (req.method === "POST") {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório." });
    }
    // Gera um identificador único para o jogador
    const id = `player_${Math.random().toString(36).slice(2, 12)}`;
    // Verifica se já existe jogador com esse nome
    const exists = await pool.query("SELECT 1 FROM players WHERE name = $1", [name.trim()]);
    if (exists.rowCount > 0) {
      return res.status(400).json({ error: "Nome já cadastrado." });
    }
    await pool.query(
      "INSERT INTO players (id, name, created_at) VALUES ($1, $2, NOW())",
      [id, name.trim()]
    );
    return res.status(200).json({ message: "Jogador adicionado!", player: { id, name: name.trim() } });
  }

  // DELETE - remover jogador por nome
  if (req.method === "DELETE") {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Nome é obrigatório para deletar." });
    }
    const del = await pool.query("DELETE FROM players WHERE name = $1 RETURNING *", [name.trim()]);
    if (del.rowCount === 0) {
      return res.status(404).json({ error: "Jogador não encontrado." });
    }
    return res.status(200).json({ message: "Jogador removido!", player: del.rows[0] });
  }

  return res.status(405).json({ error: "Método não permitido" });
}
