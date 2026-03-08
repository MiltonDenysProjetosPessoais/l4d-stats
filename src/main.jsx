import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/react";

// Substitua pela sua chave Clerk real
const clerkPublishableKey = "pk_live_Y2xlcmsubDRkLXN0YXRzLnZlcmNlbCQ";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>
);
