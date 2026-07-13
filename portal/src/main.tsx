import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { PRODUCT_NAME } from "./config";
import "./index.css";

// Portal title reads from PRODUCT_NAME. Copy uses "PRODUCT_NAME portal" so the
// working name is never baked in.
document.title = PRODUCT_NAME + " portal";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
