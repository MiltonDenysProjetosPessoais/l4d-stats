import { useUser, SignInButton, SignUpButton } from "@clerk/react";
import { useState, useEffect, useMemo } from "react";
import "./App.css";

const STATS = ["mira", "cover", "comunicacao", "infectado", "nocao"];

export default function App() {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) {
    return (
      <div className="login-page">
        <h1>Login</h1>
        <p>Faça login para votar nos jogadores</p>
        <SignInButton />
        <SignUpButton />
      </div>
    );
  }

  return <Dashboard user={user} />;
}

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
  const overall = STATS.reduce((sum, stat) => sum + averages[stat], 0) / STATS.length;
  return { votesCount: pVotes.length, averages, overall };
}

function Dashboard({ user }) {
  const [players, setPlayers] = useState([]);
  const [votes, setVotes] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vote, setVote] = useState({ mira: 3, cover: 3, comunicacao: 3, infectado: 3, nocao: 3 });
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, name: user.name }),
        });
        const [playersRes, votesRes] = await Promise.all([
          fetch("/api/players"),
          fetch("/api/vote"),
        ]);
        if (!playersRes.ok || !votesRes.ok) {
          throw new Error(`Erro ao carregar dados: players=${playersRes.status} votes=${votesRes.status}`);
        }
        const playersData = await playersRes.json();
        const votesData = await votesRes.json();
        setPlayers(playersData);
        setVotes(votesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user.email, user.name]);

  const loadData = async () => {
    const [playersRes, votesRes] = await Promise.all([
      fetch("/api/players"),
      fetch("/api/vote"),
    ]);
    setPlayers(await playersRes.json());
    setVotes(await votesRes.json());
  };

  const otherPlayers = players.filter((p) => p.email !== user.email);
  const selectedPlayer = otherPlayers.find((p) => p.email === selectedEmail);
  const alreadyVoted = selectedPlayer ? votes.some((v) => v.voter === user.email && v.player === selectedPlayer.email) : false;
  const votedEmails = new Set(votes.filter((v) => v.voter === user.email).map((v) => v.player));
  const selectedPlayerStats = selectedPlayer ? getPlayerStats(selectedPlayer.email, votes) : { votesCount: 0, averages: {}, overall: 0 };
  const playerVotes = selectedPlayer ? votes.filter((v) => v.player === selectedPlayer.email) : [];
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

  const addVote = async () => {
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voter: user.email, player: selectedPlayer.email, ...vote }),
    });
    const data = await res.json();
    if (res.status === 409) {
      alert(data.error);
      return;
    }
    await loadData();
    alert("Voto enviado!");
  };

  if (loading) {
    return (
      <div className="dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2>⏳ Carregando...</h2>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="dashboard">
        <div className="header">
          <h1>⚔️ L4D Stats Portal</h1>
        </div>
        <div className="vote-card" style={{ maxWidth: "600px", margin: "50px auto" }}>
          <div className="status-message status-error">❌ Erro: {error}</div>
          <button className="btn-primary" onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard">
      <div className="header">
        <h1>⚔️ L4D Stats Portal</h1>
        <div className="header-right">
          <div className="user-info">
            <span>👤</span>
            <span className="user-email">{user.email}</span>
          </div>
        </div>
      </div>
      <div className="main-content">
        <div className="voting-section">
          <div className="vote-card">
            <h3>👥 Selecione um Jogador</h3>
            {otherPlayers.length === 0 && <p style={{ color: "#888", textAlign: "center" }}>Nenhum outro jogador cadastrado ainda.</p>}
            <div className="players-grid">
              {otherPlayers.map((p) => (
                <button key={p.email} onClick={() => setSelectedEmail(p.email)} className={`player-btn ${selectedEmail === p.email ? "selected" : ""}`}>
                  {p.name}
                  {votedEmails.has(p.email) && <span className="player-badge">✓ votado</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="voting-section">
          {selectedPlayer && (
            <div className="vote-card">
              <h2>🎯 Votar em: {selectedPlayer.name}</h2>
              {alreadyVoted ? (
                <div className="status-message status-success">✓ Você já votou neste jogador</div>
              ) : (
                <>
                  <h3>Avalie os Atributos</h3>
                  <div className="vote-inputs">
                    {Object.keys(vote).map((stat) => (
                      <div key={stat} className="vote-input-group">
                        <label htmlFor={stat}>{stat}</label>
                        <input id={stat} type="range" min="0" max="5" value={vote[stat]} onChange={(e) => setVote({ ...vote, [stat]: Number(e.target.value) })} style={{ cursor: "pointer" }} />
                        <span style={{ minWidth: "30px", textAlign: "right", fontWeight: "bold" }}>{vote[stat]}/5</span>
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={addVote}>Enviar Voto</button>
                </>
              )}
            </div>
          )}
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
                          <div className="stat-bar-fill" style={{ width: `${percentage}%` }} />
                        </div>
                        <span style={{ minWidth: "35px", textAlign: "right" }}>{value.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="overall-display">
                <h3>OVERALL</h3>
                <div className="overall-value">{overall.toFixed(2)}</div>
                <small style={{ color: "#999" }}>baseado em {playerVotes.length} voto{playerVotes.length !== 1 ? "s" : ""}</small>
              </div>
            </div>
          )}
        </div>
        <div className="ranking-sidebar">
          <h2>🏆 Ranking</h2>
          {ranking.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", fontSize: "0.9rem" }}>Nenhum voto registrado ainda.</p>
          ) : (
            <div className="ranking-list">
              {ranking.map((p, index) => {
                let medalClass = "medal-default";
                let medalEmoji = "•";
                if (index === 0) { medalClass = "medal-gold"; medalEmoji = "🥇"; }
                else if (index === 1) { medalClass = "medal-silver"; medalEmoji = "🥈"; }
                else if (index === 2) { medalClass = "medal-bronze"; medalEmoji = "🥉"; }
                return (
                  <div key={p.email} className={`ranking-item ${medalClass}`}>
                    <div className="ranking-position">{medalEmoji}</div>
                    <div className="ranking-info">
                      <div className="ranking-name">#{index + 1} {p.name}</div>
                      <div className="ranking-stats">
                        {STATS.map((s) => (
                          <span key={s}>{s.slice(0, 3)}: {p.averages[s]?.toFixed(1) ?? "0.0"}</span>
                        ))}
                      </div>
                    </div>
                    <div className="ranking-score">{p.overall.toFixed(1)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
