import { SignInButton, SignUpButton } from "@clerk/react";
import { useEffect, useState } from "react";

export default function Login({ onLogin }) {
  return (
    <div className="login-container">
      <h2>Login</h2>
      <p>Faça login para votar nos jogadores</p>
      <div style={{ maxWidth: 300, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SignInButton mode="modal">
            <button className="btn-primary">Entrar</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn-secondary">Criar Conta</button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
