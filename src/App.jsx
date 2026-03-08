import { useState, useEffect, useCallback, useMemo } from "react";
import { ClerkProvider, SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import Login from "./Login.jsx";
import "./App.css";

const STATS = ["mira", "cover", "comunicacao", "infectado", "nocao"];

export default function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <SignedIn>
        <DashboardWithUser />
      </SignedIn>
      <SignedOut>
        <Login />
      </SignedOut>
    </ClerkProvider>
  );
}

function DashboardWithUser() {
  const { user } = useUser();
  // Clerk: user.primaryEmailAddress?.emailAddress e user.fullName
  if (!user) {
    return <div style={{color: 'red', padding: 40}}>Erro: Usuário não autenticado.</div>;
  }
  // Adaptar para Clerk
  const userData = {
    email: user.primaryEmailAddress?.emailAddress || user.emailAddress,
    name: user.fullName || user.username || (user.primaryEmailAddress?.emailAddress?.split("@")[0] ?? "")
  };
  return <Dashboard user={userData} onLogout={() => window.location.reload()} />;
}

// calcula overall de um jogador a partir dos votos recebidos
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

function Dashboard({ user, onLogout }) {
  const [players, setPlayers] = useState([]);
  const [votes, setVotes] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  const [vote, setVote] = useState({
    mira: 3,
    cover: 3,
    comunicacao: 3,
    infectado: 3,
    nocao: 3,
  });

  const [error, setError] = useState(null);

  // registrar jogador no login e carregar dados
  useEffect(() => {
    const init = async () => {
      try {
        // registrar o usuario como jogador
        await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
          }),
        });

        // carregar jogadores e votos
        const [playersRes, votesRes] = await Promise.all([
          fetch("/api/players"),
          fetch("/api/vote"),
        ]);

        if (!playersRes.ok || !votesRes.ok) {
          throw new Error(
            `Erro ao carregar dados: players=${playersRes.status} votes=${votesRes.status}`
          );
        }

        const playersData = await playersRes.json();
        const votesData = await votesRes.json();

        setPlayers(playersData);
        setVotes(votesData);
      } catch (err) {
        console.error("Erro ao inicializar:", err);
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
    const playersData = await playersRes.json();
    const votesData = await votesRes.json();
    setPlayers(playersData);
    setVotes(votesData);
  };

  // outros jogadores (nao mostra voce mesmo)
  const otherPlayers = players.filter((p) => p.email !== user.email);

  const selectedPlayer = otherPlayers.find((p) => p.email === selectedEmail);

  // verificar se ja votou neste jogador
  const alreadyVoted = selectedPlayer
    ? votes.some(
        (v) => v.voter === user.email && v.player === selectedPlayer.email
      )
    : false;

  // verificar em quem ja votou
  const votedEmails = new Set(
    votes.filter((v) => v.voter === user.email).map((v) => v.player)
  );

  // usar a mesma funcao de calculo do ranking para evitar divergencias
  const selectedPlayerStats = selectedPlayer
    ? getPlayerStats(selectedPlayer.email, votes)
    : { votesCount: 0, averages: {}, overall: 0 };

  const playerVotes = selectedPlayer
    ? votes.filter((v) => v.player === selectedPlayer.email)
    : [];

  const calculateAverage = (stat) => {
    return selectedPlayerStats.averages[stat] || 0;
  };

  const overall = selectedPlayerStats.overall;

  // ranking: todos os jogadores ordenados por overall
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
      body: JSON.stringify({
        voter: user.email,
        player: selectedPlayer.email,
        ...vote,
      }),
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
          <div className="header-right">
            <button className="btn-danger" onClick={onLogout}>Sair</button>
          </div>
        </div>
        <div className="vote-card" style={{ maxWidth: "600px", margin: "50px auto" }}>
          <div className="status-message status-error">
            ❌ Erro: {error}
          </div>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* header */}
      <div className="header">
        <h1>⚔️ L4D Stats Portal</h1>
        <div className="header-right">
          <div className="user-info">
            <span>👤</span>
            <span className="user-email">{user.email}</span>
          </div>
          <button className="btn-danger" onClick={onLogout}>Sair</button>
        </div>
      </div>

      {/* layout principal */}
      <div className="main-content">
        {/* coluna esquerda - seleção de jogadores */}
        <div className="voting-section">
          {/* seleção de jogadores */}
          <div className="vote-card">
            <h3>👥 Selecione um Jogador</h3>
            {otherPlayers.length === 0 && (
              <p style={{ color: "#888", textAlign: "center" }}>Nenhum outro jogador cadastrado ainda.</p>
            )}
            <div className="players-grid">
              {otherPlayers.map((p) => (
                <button
                  key={p.email}
                  onClick={() => setSelectedEmail(p.email)}
                  className={`player-btn ${selectedEmail === p.email ? "selected" : ""}`}
                >
                  {p.name}
                  {votedEmails.has(p.email) && <span className="player-badge">✓ votado</span>}
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

              {alreadyVoted ? (
                <div className="status-message status-success">
                  ✓ Você já votou neste jogador
                </div>
              ) : (
                <>
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
                            setVote({
                              ...vote,
                              [stat]: Number(e.target.value),
                            })
                          }
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ minWidth: "30px", textAlign: "right", fontWeight: "bold" }}>
                          {vote[stat]}/5
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={addVote}>
                    Enviar Voto
                  </button>
                </>
              )}
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
                  baseado em {playerVotes.length} voto{playerVotes.length !== 1 ? "s" : ""}
                </small>
              </div>
            </div>
          )}
        </div>

        {/* coluna direita - ranking */}
        <div className="ranking-sidebar">
          <h2>🏆 Ranking</h2>

          {ranking.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", fontSize: "0.9rem" }}>
              Nenhum voto registrado ainda.
            </p>
          ) : (
            <div className="ranking-list">
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
                  <div key={p.email} className={`ranking-item ${medalClass}`}>
                    <div className="ranking-position">{medalEmoji}</div>
                    <div className="ranking-info">
                      <div className="ranking-name">#{index + 1} {p.name}</div>
                      <div className="ranking-stats">
                        {STATS.map((s) => (
                          <span key={s}>
                            {s.slice(0, 3)}: {p.averages[s]?.toFixed(1) ?? "0.0"}
                          </span>
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
