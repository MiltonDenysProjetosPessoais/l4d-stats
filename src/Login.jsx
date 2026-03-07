import { useEffect, useState } from "react";
import netlifyIdentity from "netlify-identity-widget";

const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export default function Login({ onLogin }) {
  const [devEmail, setDevEmail] = useState("");

  useEffect(() => {
    netlifyIdentity.on("login", (user) => {
      netlifyIdentity.close();
      onLogin(user);
    });

    return () => {
      netlifyIdentity.off("login");
    };
  }, [onLogin]);

  const handleLogin = () => {
    netlifyIdentity.open("login");
  };

  const handleSignup = () => {
    netlifyIdentity.open("signup");
  };

  const handleDevLogin = (e) => {
    e.preventDefault();
    if (!devEmail) {
      alert("Digite um email para o login local");
      return;
    }
    // simula o objeto user do Netlify Identity
    onLogin({
      email: devEmail,
      user_metadata: { full_name: devEmail.split("@")[0] },
    });
  };

  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial" }}>
      <h1>L4D Stats Portal</h1>
      <p>Faca login para votar nos jogadores</p>

      <div style={{ maxWidth: 300, margin: "0 auto" }}>
        {isLocalDev ? (
          <>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
              Modo desenvolvimento local
            </p>
            <form onSubmit={handleDevLogin}>
              <input
                type="email"
                placeholder="Email (dev local)"
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
                Entrar (dev)
              </button>
            </form>
          </>
        ) : (
          <>
            <button
              onClick={handleLogin}
              style={{
                width: "100%",
                padding: 12,
                fontSize: 16,
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              Entrar
            </button>

            <button
              onClick={handleSignup}
              style={{
                width: "100%",
                padding: 12,
                fontSize: 16,
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
              }}
            >
              Criar conta
            </button>
          </>
        )}
      </div>
    </div>
  );
}
