import { PRODUCT_NAME } from "./config";
import { useAuth } from "./auth/AuthProvider";
import { SignIn } from "./auth/SignIn";
import { GlassPanel } from "./ui/GlassPanel";
import { Button } from "./ui/Button";

// P0.11 gate + P0.24b shell: no session shows the sign-in screen; a session
// shows the app shell on the liquid glass surface. The real homeowner tabs
// (Chat, Dates, House) land with P0.25; the shell stays deliberately light so
// the design system is proven once, on-brand.
export function App() {
  const { session, user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <main className="shell">
        <GlassPanel className="panel">
          <p className="shell-eyebrow">Homeowner app</p>
          <h1 className="shell-title">{PRODUCT_NAME}</h1>
          <p className="shell-note">Loading your home.</p>
        </GlassPanel>
      </main>
    );
  }

  if (!session) {
    return <SignIn />;
  }

  return (
    <main className="shell">
      <GlassPanel className="panel">
        <p className="shell-eyebrow">Homeowner app</p>
        <h1 className="shell-title">{PRODUCT_NAME}</h1>
        <p className="shell-note">
          Signed in as {user?.email}. Chat, Dates and House arrive as the build
          progresses.
        </p>
        <Button variant="ghost" icon="logout" onClick={() => void signOut()}>
          Sign out
        </Button>
      </GlassPanel>
    </main>
  );
}
