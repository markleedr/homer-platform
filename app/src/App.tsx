import { PRODUCT_NAME } from "./config";

// P0.1 scaffold shell only. This renders the product name and nothing else.
// The real homeowner tabs (Chat, Dates, House) and the liquid glass component
// library land in later tickets (P0.24b, P0.25). Kept deliberately bare so the
// design system is built once, on-brand, rather than restyled twice.
export function App() {
  return (
    <main className="shell">
      <p className="shell-eyebrow">Homeowner app</p>
      <h1 className="shell-title">{PRODUCT_NAME}</h1>
      <p className="shell-note">
        Scaffold is live and the deploy pipeline is proven. Chat, Dates and House arrive as the build progresses.
      </p>
    </main>
  );
}
