import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial" }}>
      <h1>L4D Stats Portal</h1>
      <p>Faça login para votar nos jogadores</p>
      <div style={{ maxWidth: 350, margin: "0 auto" }}>
        <SignIn routing="hash" />
      </div>
    </div>
  );
}
