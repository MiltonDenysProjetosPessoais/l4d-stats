import { kv } from "@vercel/kv";

/**
 * Função admin para limpar base de usuários e votos
 * Use com cautela! Requer header de autenticação
 *
 * POST com ?action=delete-user&email=user@email.com - deleta um usuário e seus votos
 * DELETE - deleta TUDO (usuários e votos)
 */
export default async function handler(req, res) {
  // Validação de segurança - verificar token de admin
  const authHeader = req.headers["authorization"];
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // DELETE - limpa TUDO
  if (req.method === "DELETE") {
    try {
      const playerKeys = await kv.keys("players:*");
      for (const key of playerKeys) {
        await kv.del(key);
      }

      const voteKeys = await kv.keys("votes:*");
      for (const key of voteKeys) {
        await kv.del(key);
      }

      return res.status(200).json({
        message: `Base limpa! ${playerKeys.length} jogadores e ${voteKeys.length} votos deletados.`,
        deletedPlayers: playerKeys.length,
        deletedVotes: voteKeys.length,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST - deleta um usuário específico e seus votos
  if (req.method === "POST") {
    const action = req.query.action;
    const email = req.query.email;

    if (action === "delete-user" && email) {
      try {
        const key = `players:${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
        await kv.del(key);

        // Deleta votos onde o usuário é o votante OU foi votado
        const voteKeys = await kv.keys("votes:*");
        let deletedVotes = 0;

        for (const voteKey of voteKeys) {
          const vote = await kv.get(voteKey);
          if (vote && (vote.voter === email || vote.player === email)) {
            await kv.del(voteKey);
            deletedVotes++;
          }
        }

        return res.status(200).json({
          message: `Usuário ${email} e seus ${deletedVotes} votos deletados!`,
          deletedVotes,
        });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    return res
      .status(400)
      .json({ error: "Invalid action or missing email parameter" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
