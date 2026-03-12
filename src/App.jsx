import { useState, useEffect, useMemo } from "react";
import "./App.css";
import { mockPlayers } from "./mockData";

const STATS = ["mira", "cover", "comunicacao", "infectado", "nocao"];

function balanceTeams(selectedPlayers) {
  // Ordena por overall decrescente
  const sorted = [...selectedPlayers].sort((a, b) => b.overall - a.overall);
  const teamA = [];
  const teamB = [];
  let sumA = 0;
  let sumB = 0;

  for (const p of sorted) {
    if (teamA.length < teamB.length) {
      teamA.push(p);
      sumA += p.overall;
    } else if (teamB.length < teamA.length) {
      teamB.push(p);
      sumB += p.overall;
    } else {
      // Decide pelo menor total
      if (sumA <= sumB) {
        teamA.push(p);
        sumA += p.overall;
      } else {
        teamB.push(p);
        sumB += p.overall;
      }
    }
  }

  // Reserva se ímpar
  let reserva = null;
  if (teamA.length > teamB.length) {
    reserva = teamA.pop();
    sumA -= reserva.overall;
  } else if (teamB.length > teamA.length) {
    reserva = teamB.pop();
    sumB -= reserva.overall;
  }

  return { teamA, teamB, reserva, sumA, sumB };
}

function App() {
  const [players, setPlayers] = useState([]);
  const [votes, setVotes] = useState([]);
  const [selectedName, setSelectedName] = useState(null);
  const [vote, setVote] = useState({
    mira: 3,
    cover: 3,
    comunicacao: 3,
    infectado: 3,
    nocao: 3,
  });
  const [loading, setLoading] = useState(true);
  // Novo: cada visitante é identificado por um id único no navegador
  const [visitorId, setVisitorId] = useState(null);
  const [visitorName, setVisitorName] = useState("");
  const [selectedForBalance, setSelectedForBalance] = useState([]);

  useEffect(() => {
    // Busca jogadores reais do backend
    fetch("/api/players")
      .then((r) => r.json())
      .then((data) => {
        // Garante que cada jogador tem os campos 'email' e 'name'
        if (Array.isArray(data)) {
          const players = data
            .map((p) => ({
              name: p.name || p.id || "",
              ...p,
            }))
            .filter((p) => p.name);
          setPlayers(players);
        } else {
          setPlayers([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Pergunta o nome do visitante se não estiver salvo
  useEffect(() => {
    let id = localStorage.getItem("visitorId");
    if (!id) {
      id = `visitor_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem("visitorId", id);
    }
    setVisitorId(id);
    let name = localStorage.getItem("visitorName") || "";
    if (!name) {
      name = prompt("Qual seu nome? (será exibido no log de votos)") || "Anônimo";
      localStorage.setItem("visitorName", name);
    }
    setVisitorName(name);
  }, []);

  const otherPlayers = players;
  const selectedPlayer = otherPlayers.find((p) => p.name === selectedName);
  const playerVotes = selectedPlayer
    ? votes.filter((v) => v.player === selectedPlayer.name)
    : [];
  // Só mostra o selo se o visitante já votou naquele player
  const votedNames = new Set(
    votes.filter((v) => v.voter === visitorId).map((v) => v.player)
  );

  function getPlayerStats(playerName, allVotes) {
    const pVotes = allVotes.filter((v) => v.player === playerName);
    if (pVotes.length === 0) {
      return { votesCount: 0, averages: {}, overall: 0 };
    }
    const averages = {};
    for (const stat of STATS) {
      const total = pVotes.reduce((sum, v) => sum + (v[stat] || 0), 0);
      averages[stat] = total / pVotes.length;
    }
    const overall =
      STATS.reduce((sum, stat) => sum + averages[stat], 0) / STATS.length;
    return { votesCount: pVotes.length, averages, overall };
  }

  const selectedPlayerStats = selectedPlayer
    ? getPlayerStats(selectedPlayer.name, votes)
    : { votesCount: 0, averages: {}, overall: 0 };
  const calculateAverage = (stat) => selectedPlayerStats.averages[stat] || 0;
  const overall = selectedPlayerStats.overall;

  const ranking = useMemo(() => {
    return players
      .map((p) => {
        const stats = getPlayerStats(p.name, votes);
        return { ...p, ...stats };
      })
      .filter((p) => p.votesCount > 0)
      .sort((a, b) => b.overall - a.overall);
  }, [players, votes]);

  // Só permite votar se ainda não votou nesse jogador
  const alreadyVoted = selectedPlayer && votes.some(
    (v) => v.voter === visitorId && v.player === selectedPlayer.name
  );

  const addVote = async () => {
    if (!selectedPlayer || !visitorId || alreadyVoted) return;
    const voteData = {
      voter: visitorId,
      voterName: visitorName,
      player: selectedPlayer.name,
      ...vote,
      createdAt: new Date().toISOString(),
    };
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voteData),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erro ao votar");
        return;
      }
      // Recarrega votos do backend
      fetch("/api/vote")
        .then((r) => r.json())
        .then((data) => {
          setVotes(data);
        });
      alert("Voto enviado!");
    } catch (e) {
      alert("Erro ao votar: " + e.message);
    }
  };

  // Calcula overall dos jogadores selecionados
  const selectedPlayersWithOverall = useMemo(() => {
    return players
      .map((p) => {
        const stats = getPlayerStats(p.name, votes);
        return { ...p, overall: stats.overall };
      })
      .filter((p) => selectedForBalance.includes(p.name));
  }, [players, votes, selectedForBalance]);

  const balanced = useMemo(
    () => balanceTeams(selectedPlayersWithOverall),
    [selectedPlayersWithOverall]
  );

  if (loading) {
    return (
      <div
        className="dashboard"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>⏳ Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* header */}
      <div className="header">
        <h1>⚔️ L4D Stats Portal</h1>
      </div>
      {/* Boas-vindas */}
      <div className="welcome-message" style={{textAlign: "center", margin: "10px 0", fontSize: "1.2rem", color: "#b6aaff"}}>
        {visitorName && (
          <>Bem-vindo, <b>{visitorName}</b>!</>
        )}
      </div>

      {/* AVISO SE NÃO HÁ JOGADORES */}
      {players.length === 0 && (
        <div style={{ color: '#ffb300', textAlign: 'center', margin: '20px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>
          Nenhum jogador cadastrado no sistema. Cadastre pelo menos um jogador para começar!
        </div>
      )}

      {/* Balanceamento de times */}
      <div className="balance-section">
        <h2>⚖️ Balanceamento de Times</h2>
        <div className="balance-select">
          <h3>Selecione jogadores para balancear:</h3>
          <div className="players-grid">
            {players.map((p) => (
              <button
                key={p.name}
                className={`player-btn ${
                  selectedForBalance.includes(p.name) ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedForBalance((prev) =>
                    prev.includes(p.name)
                      ? prev.filter((e) => e !== p.name)
                      : [...prev, p.name]
                  );
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        {/* Tabela de resultado */}
        {selectedForBalance.length > 0 && (
          <div className="balance-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Time</th>
                  <th>Overall</th>
                </tr>
              </thead>
              <tbody>
                {balanced.teamA.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>Time A</td>
                    <td>{p.overall.toFixed(2)}</td>
                  </tr>
                ))}
                {balanced.teamB.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>Time B</td>
                    <td>{p.overall.toFixed(2)}</td>
                  </tr>
                ))}
                {balanced.reserva && (
                  <tr key={balanced.reserva.name}>
                    <td>{balanced.reserva.name}</td>
                    <td>Reserva</td>
                    <td>{balanced.reserva.overall.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Soma total do Overall do Time A</td>
                  <td>{balanced.sumA.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={2}>Soma total do Overall do Time B</td>
                  <td>{balanced.sumB.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={2}>Diferença final entre os times</td>
                  <td>{Math.abs(balanced.sumA - balanced.sumB).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* NOVO: ranking acima dos nomes */}
      <div className="ranking-topbar">
        <h2>🏆 Ranking</h2>
        {ranking.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", fontSize: "0.9rem" }}>
            Nenhum voto registrado ainda.
          </p>
        ) : (
          <div className="ranking-list ranking-list-topbar">
            {ranking.map((p, index) => {
              let medalClass = "medal-default";
              let medalEmoji = "•";
              if (index === 0) {
                medalClass = "medal-gold";
                medalEmoji = "🥇";
              } else if (index === 1) {
                medalClass = "medal-silver";
                medalEmoji = "🥈";
              } else if (index === 2) {
                medalClass = "medal-bronze";
                medalEmoji = "🥉";
              }
              return (
                <div
                  key={p.name}
                  className={`ranking-item ${medalClass}`}
                  style={{ minWidth: 180 }}
                >
                  <div className="ranking-position">{medalEmoji}</div>
                  <div className="ranking-info">
                    <div className="ranking-name">
                      #{index + 1} {p.name}
                    </div>
                    <div className="ranking-stats">
                      <span>
                        Mira - {p.averages.mira?.toFixed(2) ?? "-"}
                      </span>
                      <span>
                        Cover - {p.averages.cover?.toFixed(2) ?? "-"}
                      </span>
                      <span>
                        Comunicacao - {p.averages.comunicacao?.toFixed(2) ?? "-"}
                      </span>
                      <span>
                        Infectado - {p.averages.infectado?.toFixed(2) ?? "-"}
                      </span>
                      <span>
                        Nocao - {p.averages.nocao?.toFixed(2) ?? "-"}
                      </span>
                    </div>
                  </div>
                  <div className="ranking-score">{p.overall.toFixed(1)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* layout principal */}
      <div className="main-content">
        {/* coluna esquerda - seleção de jogadores + estatísticas */}
        <div className="left-panel">
          {/* seleção de jogadores */}
          <div className="vote-card">
            <h3>👥 Selecione um Jogador</h3>
            {otherPlayers.length === 0 && (
              <p style={{ color: "#888", textAlign: "center" }}>
                Nenhum outro jogador cadastrado ainda.
              </p>
            )}
            <div className="players-grid">
              {otherPlayers.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedName(p.name)}
                  className={`player-btn ${
                    selectedName === p.name ? "selected" : ""
                  }`}
                >
                  {p.name}
                  {votedNames.has(p.name) && (
                    <span className="player-badge">✓ votado</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* estatísticas do jogador */}
          {selectedPlayer && (
            <div className="vote-card">
              <h3>📊 Estatísticas de {selectedPlayer.name}</h3>
              <div className="stats-display">
                {STATS.map((stat) => {
                  const value = calculateAverage(stat);
                  const percentage = (value / 5) * 100;
                  return (
                    <div key={stat} className="stat-row">
                      <span className="stat-name">{stat}</span>
                      <div className="stat-value">
                        <div className="stat-bar">
                          <div
                            className="stat-bar-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span style={{ minWidth: "35px", textAlign: "right" }}>
                          {value.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="overall-display">
                <h3>OVERALL</h3>
                <div className="overall-value">{overall.toFixed(2)}</div>
                <small style={{ color: "#999" }}>
                  baseado em{" "}
                  {playerVotes.length} voto{playerVotes.length !== 1 ? "s" : ""}
                </small>
              </div>
            </div>
          )}
        </div>

        {/* coluna direita - formulário de votação */}
        <div className="right-panel">
          {/* formulário de votação */}
          {selectedPlayer && (
            <div className="vote-card">
              <h2>🎯 Votar em: {selectedPlayer.name}</h2>
              <h3>Avalie os Atributos</h3>
              <div className="vote-inputs">
                {Object.keys(vote).map((stat) => (
                  <div key={stat} className="vote-input-group">
                    <label htmlFor={stat}>{stat}</label>
                    <input
                      id={stat}
                      type="range"
                      min="0"
                      max="5"
                      value={vote[stat]}
                      onChange={(e) =>
                        setVote({ ...vote, [stat]: Number(e.target.value) })
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <span
                      style={{
                        minWidth: "30px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      {vote[stat]}/5
                    </span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={addVote} disabled={alreadyVoted}>
                {alreadyVoted ? "Você já votou" : "Enviar Voto"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Log de quem já votou (admin ou todos) */}
      <div className="vote-log">
        <h3>Log de Votantes</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {votes.map((v, i) => {
            const voterName = v.voter_name || v.voterName || v.voter;
            const playerName = players.find(p => p.name === v.player)?.name || v.player;
            return (
              <li key={i} style={{ marginBottom: 4 }}>
                <span style={{ color: "#b6aaff" }}><b>{voterName}</b></span> votou em <span style={{ color: "#ffd700" }}><b>{playerName}</b></span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;

