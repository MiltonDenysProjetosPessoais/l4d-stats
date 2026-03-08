import { useState } from "react";

const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export default function Login({ onLogin }) {
  const [devEmail, setDevEmail] = useState("");

  const handleDevLogin = (e) => {
    e.preventDefault();
    if (!devEmail) {
      alert("Digite um email para o login");
      return;
    }
    // Simula o objeto user
    onLogin({
      email: devEmail,
      user_metadata: { full_name: devEmail.split("@")[0] },
    });
  };

  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial" }}>
      <h1>L4D Stats Portal</h1>
      <p>Faça login para votar nos jogadores</p>
      <div style={{ maxWidth: 300, margin: "0 auto" }}>
        <form onSubmit={handleDevLogin}>
          <input
            type="email"
            placeholder="Email"
            value={devEmail}
            onChange={(e) => setDevEmail(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              fontSize: 16,
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              fontSize: 16,
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            Entrar
          </button>
        </form>
        <p style={{ fontSize: 12, color: "#888", marginTop: 10 }}>
          Login simulado. Implemente autenticação real para produção.
        </p>
      </div>
    </div>
  );
}
