import { getStore } from "@netlify/blobs";

/**
 * Função admin para limpar base de usuários e votos
 * Use com cautela! Requer header de autenticação
 *
 * POST com ?action=delete-user&email=user@email.com - deleta um usuário e seus votos
 * DELETE - deleta TUDO (usuários e votos)
 */
export default async (req, context) => {
  // Validação de segurança - verificar token de admin
  const authHeader = req.headers.get("authorization");
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401 }
    );
  }

  // DELETE - limpa TUDO
  if (req.method === "DELETE") {
    try {
      const playersStore = getStore({ name: "players", consistency: "strong" });
      const votesStore = getStore({ name: "votes", consistency: "strong" });

      // Deleta todos os jogadores
      const { blobs: playerBlobs } = await playersStore.list();
      for (const blob of playerBlobs) {
        await playersStore.delete(blob.key);
      }

      // Deleta todos os votos
      const { blobs: voteBlobs } = await votesStore.list();
      for (const blob of voteBlobs) {
        await votesStore.delete(blob.key);
      }

      return new Response(
        JSON.stringify({
          message: `Base limpa! ${playerBlobs.length} jogadores e ${voteBlobs.length} votos deletados.`,
          deletedPlayers: playerBlobs.length,
          deletedVotes: voteBlobs.length,
        }),
        { status: 200 }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }
  }

  // POST - deleta um usuário específico e seus votos
  if (req.method === "POST") {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const email = url.searchParams.get("email");

    if (action === "delete-user" && email) {
      try {
        const playersStore = getStore({ name: "players", consistency: "strong" });
        const votesStore = getStore({ name: "votes", consistency: "strong" });
        const key = email.replace(/[^a-zA-Z0-9]/g, "_");

        // Deleta o jogador
        await playersStore.delete(key);

        // Deleta votos onde o usuário é o votante OU foi votado
        const { blobs: voteBlobs } = await votesStore.list();
        let deletedVotes = 0;

        for (const blob of voteBlobs) {
          const vote = await votesStore.get(blob.key, { type: "json" });
          if (vote && (vote.voter === email || vote.player === email)) {
            await votesStore.delete(blob.key);
            deletedVotes++;
          }
        }

        return new Response(
          JSON.stringify({
            message: `Usuário ${email} e seus ${deletedVotes} votos deletados!`,
            deletedVotes,
          }),
          { status: 200 }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500 }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Invalid action or missing email parameter" }),
      { status: 400 }
    );
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
  });
};



