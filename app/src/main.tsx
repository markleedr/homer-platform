import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import { IconSprite } from "./ui/icons";
import { PRODUCT_NAME } from "./config";
import "./ui/tokens.css";
import "./ui/ui.css";
import "./index.css";

// Set the document title from PRODUCT_NAME so the working name is not baked into index.html.
document.title = PRODUCT_NAME;
// The ambient liquid glass wash sits on the body (PRD 8e).
document.body.classList.add("atmosphere");

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <IconSprite />
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
