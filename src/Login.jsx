import { SignIn } from "@clerk/react";

export default function Login() {
  return (
    <div className="login-container">
      <h2>Login</h2>
      <p>Faça login para votar nos jogadores</p>
      <div style={{ maxWidth: 400, margin: "0 auto" }}>
        <SignIn />
      </div>
    </div>
  );
}
