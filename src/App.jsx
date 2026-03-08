import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import "./App.css";

export default function App() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return (
      <div style={{color: 'red', padding: 40}}>
        Erro: VITE_CLERK_PUBLISHABLE_KEY não está definida.<br/>
        Verifique seu arquivo .env e reinicie o servidor.
      </div>
    );
  }
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <Header />
    </ClerkProvider>
  );
}

function Header() {
  return (
    <header>
      <Show when="signed-out">
        <SignInButton />
        <SignUpButton />
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </header>
  );
}
