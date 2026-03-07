import { useState, useEffect, useCallback } from "react";
import netlifyIdentity from "netlify-identity-widget";
import Login from "./Login.jsx";

export default function App() {
  const [user, setUser] = useState(netlifyIdentity.currentUser());

  useEffect(() => {
    netlifyIdentity.init();
  }, []);

  const handleLogin = useCallback((loggedInUser) => {
    setUser(loggedInUser);
  }, []);

  const handleLogout = () => {
    try {
      netlifyIdentity.logout();
    } catch {
      // dev mode: no real session to logout from
    }
    setUser(null);
  };

  useEffect(() => {
    netlifyIdentity.on("logout", () => setUser(null));
    return () => {
      netlifyIdentity.off("logout");
    };
  }, []);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
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
        await fetch("/.netlify/functions/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.user_metadata?.full_name || user.email.split("@")[0],
          }),
        });

        // carregar jogadores e votos
        const [playersRes, votesRes] = await Promise.all([
          fetch("/.netlify/functions/players"),
          fetch("/.netlify/functions/vote"),
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
  }, [user.email, user.user_metadata?.full_name]);

  const loadData = async () => {
    const [playersRes, votesRes] = await Promise.all([
      fetch("/.netlify/functions/players"),
      fetch("/.netlify/functions/vote"),
    ]);
    const playersData = await playersRes.json();
    const votesData = await votesRes.json();
    setPlayers(playersData);
    setVotes(votesData);
  };

  // outros jogadores (nao mostra voce mesmo)
  const otherPlayers = players.filter((p) => p.email !== user.email);

  const selectedPlayer = otherPlayers.find((p) => p.email === selectedEmail);

  // votos recebidos pelo jogador selecionado
  const playerVotes = selectedPlayer
    ? votes.filter((v) => v.player === selectedPlayer.email)
    : [];

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

  const calculateAverage = (stat) => {
    if (playerVotes.length === 0) return 0;
    const total = playerVotes.reduce((sum, v) => sum + v[stat], 0);
    return total / playerVotes.length;
  };

  const overall =
    (calculateAverage("mira") +
      calculateAverage("cover") +
      calculateAverage("comunicacao") +
      calculateAverage("infectado") +
      calculateAverage("nocao")) / 5;

  const addVote = async () => {
    const res = await fetch("/.netlify/functions/vote", {
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

  if (loading) return <div style={{ padding: 20 }}>Carregando...</div>;

  if (error) {
    return (
      <div style={{ padding: 20, fontFamily: "Arial" }}>
        <h1>L4D Stats Portal</h1>
        <p style={{ color: "red" }}>Erro: {error}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
        <br />
        <button onClick={onLogout} style={{ marginTop: 10 }}>Sair</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>L4D Stats Portal</h1>
        <div>
          <span style={{ marginRight: 10 }}>{user.email}</span>
          <button onClick={onLogout}>Sair</button>
        </div>
      </div>

      <h3>Jogadores</h3>
      {otherPlayers.length === 0 && (
        <p>Nenhum outro jogador cadastrado ainda.</p>
      )}
      {otherPlayers.map((p) => (
        <button
          key={p.email}
          onClick={() => setSelectedEmail(p.email)}
          style={{
            marginRight: 5,
            padding: "8px 16px",
            backgroundColor:
              selectedEmail === p.email ? "#007bff" : undefined,
            color: selectedEmail === p.email ? "white" : undefined,
            position: "relative",
          }}
        >
          {p.name}
          {votedEmails.has(p.email) && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 12,
                color: selectedEmail === p.email ? "#cce5ff" : "#28a745",
              }}
            >
              (votado)
            </span>
          )}
        </button>
      ))}

      {selectedPlayer && (
        <>
          <hr />

          <h2>Votar em: {selectedPlayer.name}</h2>

          {alreadyVoted ? (
            <p style={{ color: "#28a745", fontWeight: "bold" }}>
              Voce ja votou neste jogador.
            </p>
          ) : (
            <>
              {Object.keys(vote).map((stat) => (
                <div key={stat} style={{ marginBottom: 5 }}>
                  <label>{stat}: </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={vote[stat]}
                    onChange={(e) =>
                      setVote({
                        ...vote,
                        [stat]: Number(e.target.value),
                      })
                    }
                  />
                </div>
              ))}
              <button onClick={addVote} style={{ marginTop: 10 }}>
                Enviar voto
              </button>
            </>
          )}

          <hr />

          <h3>Medias de {selectedPlayer.name}</h3>
          <p>Mira: {calculateAverage("mira").toFixed(2)}</p>
          <p>Cover: {calculateAverage("cover").toFixed(2)}</p>
          <p>Comunicacao: {calculateAverage("comunicacao").toFixed(2)}</p>
          <p>Infectado: {calculateAverage("infectado").toFixed(2)}</p>
          <p>Nocao: {calculateAverage("nocao").toFixed(2)}</p>
          <p>
            <em>({playerVotes.length} voto(s) recebido(s))</em>
          </p>

          <h2>Overall: {overall.toFixed(2)}</h2>
        </>
      )}
    </div>
  );
}
