import { useEffect, useState } from "react";
import netlifyIdentity from "netlify-identity-widget";

export default function Login({ onLogin }) {
  const [isLocalDev, setIsLocalDev] = useState(false);
  const [devEmail, setDevEmail] = useState("");

  useEffect(() => {
    // Detect local dev mode
    setIsLocalDev(
      !window.location.hostname.includes("netlify.app") &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1")
    );
    netlifyIdentity.on("login", (user) => {
      onLogin(user);
      netlifyIdentity.close();
    });
    return () => {
      netlifyIdentity.off("login");
    };
  }, [onLogin]);

  const handleLogin = () => {
    netlifyIdentity.open("login");
  };

  const handleDevLogin = (e) => {
    e.preventDefault();
    // Simulate login in dev mode
    onLogin({ email: devEmail, name: devEmail.split("@")[0] });
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
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
              }}
            >
              Entrar com Netlify Identity
            </button>
          </>
        )}
      </div>
    </div>
  );
}
