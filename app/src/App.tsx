import { PRODUCT_NAME } from "./config";
import { useAuth } from "./auth/AuthProvider";
import { SignIn } from "./auth/SignIn";

// P0.11 gate: no session shows the sign-in screen; a session shows the app
// shell. The real homeowner tabs (Chat, Dates, House) and the liquid glass
// component library land in later tickets (P0.24b, P0.25); the shell stays
// deliberately bare so the design system is built once, on-brand.
export function App() {
  const { session, user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <main className="shell">
        <p className="shell-eyebrow">Homeowner app</p>
        <h1 className="shell-title">{PRODUCT_NAME}</h1>
        <p className="shell-note">Loading your home.</p>
      </main>
    );
  }

  if (!session) {
    return <SignIn />;
  }

  return (
    <main className="shell">
      <p className="shell-eyebrow">Homeowner app</p>
      <h1 className="shell-title">{PRODUCT_NAME}</h1>
      <p className="shell-note">
        Signed in as {user?.email}. Chat, Dates and House arrive as the build
        progresses.
      </p>
      <button
        className="auth-button auth-button-ghost"
        type="button"
        onClick={signOut}
      >
        Sign out
      </button>
    </main>
  );
}
