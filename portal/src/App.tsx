import { PRODUCT_NAME } from "./config";

// Placeholder shell. The developer portal is entirely behind Demo 1 and is built
// out in Phase 1 (org onboarding, provisioning, defect queue, dashboard). This
// exists so the workspace compiles and the directory has a home.
export function App() {
  return (
    <main className="shell">
      <p className="shell-eyebrow">Developer portal</p>
      <h1 className="shell-title">{PRODUCT_NAME}</h1>
      <p className="shell-note">Portal build begins in Phase 1, after Demo 1.</p>
    </main>
  );
}
