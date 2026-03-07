import { useEffect } from "react";
import netlifyIdentity from "netlify-identity-widget";

export default function Login({ onLogin }) {
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

  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial" }}>
      <h1>L4D Stats Portal</h1>
      <p>Faca login para votar nos jogadores</p>

      <div style={{ maxWidth: 300, margin: "0 auto" }}>
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
      </div>
    </div>
  );
}
