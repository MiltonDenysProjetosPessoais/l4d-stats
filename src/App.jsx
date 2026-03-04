import { useState, useEffect } from "react";

export default function App() {
  const [players, setPlayers] = useState([
    { nome: "Nick", votos: [] },
    { nome: "Ellis", votos: [] },
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const [vote, setVote] = useState({
    mira: 3,
    cover: 3,
    comunicacao: 3,
    infectado: 3,
    nocao: 3,
  });

  const player = players[selectedIndex];

  // 🔥 carregar votos do servidor
  const loadVotes = async () => {
    const res = await fetch("/.netlify/functions/vote");
    const data = await res.json();

    setPlayers((currentPlayers) =>
      currentPlayers.map((p) => ({
        ...p,
        votos: data.filter((v) => v.player === p.nome),
      }))
    );
  };

  // roda ao abrir o site
  useEffect(() => {
    loadVotes();
  }, []);

  // enviar voto
  const addVote = async () => {
    await fetch("/.netlify/functions/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player: player.nome,
        ...vote,
      }),
    });

    await loadVotes(); // 🔥 atualiza médias automaticamente
    alert("Voto enviado!");
  };

  const calculateAverage = (stat) => {
    if (!player || player.votos.length === 0) return 0;

    const total = player.votos.reduce(
      (sum, v) => sum + v[stat],
      0
    );

    return total / player.votos.length;
  };

  const overall =
    (
      calculateAverage("mira") +
      calculateAverage("cover") +
      calculateAverage("comunicacao") +
      calculateAverage("infectado") +
      calculateAverage("nocao")
    ) / 5;

  if (!player) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>L4D Stats Portal</h1>

      <h3>Jogadores</h3>
      {players.map((p, index) => (
        <button key={index} onClick={() => setSelectedIndex(index)}>
          {p.nome}
        </button>
      ))}

      <hr />

      <h2>Votar em: {player.nome}</h2>

      {Object.keys(vote).map((stat) => (
        <div key={stat}>
          <label>{stat}: </label>
          <input
            type="number"
            min="0"
            max="5"
            value={vote[stat]}
            onChange={(e) =>
              setVote({ ...vote, [stat]: Number(e.target.value) })
            }
          />
        </div>
      ))}

      <button onClick={addVote}>Enviar voto</button>

      <hr />

      <h3>Médias</h3>
      <p>Mira: {calculateAverage("mira").toFixed(2)}</p>
      <p>Cover: {calculateAverage("cover").toFixed(2)}</p>
      <p>Comunicação: {calculateAverage("comunicacao").toFixed(2)}</p>
      <p>Infectado: {calculateAverage("infectado").toFixed(2)}</p>
      <p>Noção: {calculateAverage("nocao").toFixed(2)}</p>

      <h2>Overall: {overall.toFixed(2)}</h2>
    </div>
  );
}