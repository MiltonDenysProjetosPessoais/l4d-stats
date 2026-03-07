import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    } else {
      alert("Preencha os campos!");
    }
  };

  return (
    <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial" }}>
      <h1>🎮 L4D Stats Portal</h1>
      <p>Faça login para votar nos jogadores</p>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: "0 auto" }}>
        <div style={{ marginBottom: 15 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10, fontSize: 16 }}
          />
        </div>
        
        <div style={{ marginBottom: 15 }}>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10, fontSize: 16 }}
          />
        </div>
        
        <button 
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            fontSize: 16,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer"
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}