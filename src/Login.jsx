import { SignIn } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

export default function Login({ onLogin }) {
  return (
    <div className="login-container">
      <h2>Login</h2>
      <p>Faça login para votar nos jogadores</p>
      <div style={{ maxWidth: 300, margin: "0 auto" }}>
        <SignIn />
      </div>
    </div>
  );
}
