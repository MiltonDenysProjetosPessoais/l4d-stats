import { mockPlayers } from "../src/mockData";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Nome e email são obrigatórios." });
    }
    // Carrega os jogadores atuais
    const filePath = path.resolve(process.cwd(), "src/mockData.js");
    let players = mockPlayers;
    // Verifica se já existe
    if (players.some((p) => p.email === email)) {
      return res.status(400).json({ error: "Email já cadastrado." });
    }
    // Adiciona novo jogador
    players.push({
      name,
      email,
      registeredAt: new Date().toISOString(),
    });
    // Atualiza o arquivo mockData.js
    const newContent =
      "// Dados de exemplo para desenvolvimento local\nexport const mockPlayers = " +
      JSON.stringify(players, null, 2) + ";\n\nexport const mockVotes = [];\n";
    fs.writeFileSync(filePath, newContent, "utf-8");
    return res.status(200).json({ message: "Usuário adicionado!", player: { name, email } });
  }
  return res.status(405).json({ error: "Método não permitido" });
}

