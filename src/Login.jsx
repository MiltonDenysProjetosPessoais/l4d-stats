import { SignIn, SignUp } from "@clerk/react";
import { useState } from "react";

export default function Login() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="login-container">
      <h2>Login</h2>
      <p>Faça login para votar nos jogadores</p>
      <div style={{ maxWidth: 300, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button className="btn-primary" onClick={() => setShowSignIn(true)}>
            Entrar
          </button>
          <button className="btn-secondary" onClick={() => setShowSignUp(true)}>
            Criar Conta
          </button>
        </div>
      </div>
      {showSignIn && (
        <SignIn open={showSignIn} onOpenChange={setShowSignIn} mode="modal" />
      )}
      {showSignUp && (
        <SignUp open={showSignUp} onOpenChange={setShowSignUp} mode="modal" />
      )}
    </div>
  );
}
