import { useState, useEffect, useMemo } from "react";
import "./App.css";
import { mockPlayers } from "./mockData";

const STATS = ["mira", "cover", "comunicacao", "infectado", "nocao"];

function App() {
  const [players, setPlayers] = useState([]);
  const [votes, setVotes] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
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

  useEffect(() => {
    setPlayers(mockPlayers); // Garante que os nomes dos jogadores aparecem sempre
    fetch("/api/vote")
      .then((r) => r.json())
      .then((data) => {
        setVotes(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let id = localStorage.getItem("visitorId");
    if (!id) {
      id = `visitor_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem("visitorId", id);
    }
    setVisitorId(id);
  }, []);

  const otherPlayers = players;
  const selectedPlayer = otherPlayers.find((p) => p.email === selectedEmail);
  const playerVotes = selectedPlayer
    ? votes.filter((v) => v.player === selectedPlayer.email)
    : [];
  // Só mostra o selo se o visitante já votou naquele player
  const votedEmails = new Set(
    votes.filter((v) => v.voter === visitorId).map((v) => v.player)
  );

  function getPlayerStats(playerEmail, allVotes) {
    const pVotes = allVotes.filter((v) => v.player === playerEmail);
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
    ? getPlayerStats(selectedPlayer.email, votes)
    : { votesCount: 0, averages: {}, overall: 0 };
  const calculateAverage = (stat) => selectedPlayerStats.averages[stat] || 0;
  const overall = selectedPlayerStats.overall;

  const ranking = useMemo(() => {
    return players
      .map((p) => {
        const stats = getPlayerStats(p.email, votes);
        return { ...p, ...stats };
      })
      .filter((p) => p.votesCount > 0)
      .sort((a, b) => b.overall - a.overall);
  }, [players, votes]);

  const addVote = () => {
    if (!selectedPlayer || !visitorId) return;
    setVotes([
      ...votes,
      {
        voter: visitorId,
        player: selectedPlayer.email,
        ...vote,
        createdAt: new Date().toISOString(),
      },
    ]);
    alert("Voto enviado!");
  };

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
                <div key={p.email} className={`ranking-item ${medalClass}` } style={{minWidth: 180}}>
                  <div className="ranking-position">{medalEmoji}</div>
                  <div className="ranking-info">
                    <div className="ranking-name">
                      #{index + 1} {p.name}
                    </div>
                    <div className="ranking-stats">
                      <span>Mira - {p.averages.mira?.toFixed(2) ?? "-"}</span>
                      <span>Cover - {p.averages.cover?.toFixed(2) ?? "-"}</span>
                      <span>Comunicacao - {p.averages.comunicacao?.toFixed(2) ?? "-"}</span>
                      <span>Infectado - {p.averages.infectado?.toFixed(2) ?? "-"}</span>
                      <span>Nocao - {p.averages.nocao?.toFixed(2) ?? "-"}</span>
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
        {/* coluna esquerda - seleção de jogadores */}
        <div className="voting-section">
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
                  key={p.email}
                  onClick={() => setSelectedEmail(p.email)}
                  className={`player-btn ${
                    selectedEmail === p.email ? "selected" : ""
                  }`}
                >
                  {p.name}
                  {votedEmails.has(p.email) && (
                    <span className="player-badge">✓ votado</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* coluna central - formulário de votação */}
        <div className="voting-section">
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
              <button className="btn-primary" onClick={addVote}>
                Enviar Voto
              </button>
            </div>
          )}

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
      </div>
    </div>
  );
}

export default App;

