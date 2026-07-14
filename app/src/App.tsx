import { useState } from "react";
import { AUTH_BYPASS_ENABLED, PRODUCT_NAME } from "./config";
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

  // Temporary bypass state (only reachable when AUTH_BYPASS_ENABLED). Holds the
  // email typed on the sign-in screen so the shell can show who "entered".
  const [demoEmail, setDemoEmail] = useState<string | null>(null);
  const inDemo = AUTH_BYPASS_ENABLED && !session && demoEmail !== null;

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

  if (!session && !inDemo) {
    return (
      <SignIn
        onBypass={AUTH_BYPASS_ENABLED ? (email) => setDemoEmail(email) : undefined}
      />
    );
  }

  const email = user?.email ?? demoEmail ?? undefined;

  return (
    <main className="shell">
      <GlassPanel className="panel">
        <p className="shell-eyebrow">Homeowner app</p>
        <h1 className="shell-title">{PRODUCT_NAME}</h1>
        {inDemo && (
          <p className="demo-banner" role="status">
            Demo mode: sign-in is bypassed. There is no real session, so your
            house data will not load.
          </p>
        )}
        <p className="shell-note">
          Signed in as {email}. Chat, Dates and House arrive as the build
          progresses.
        </p>
        <Button
          variant="ghost"
          icon="logout"
          onClick={() => {
            setDemoEmail(null);
            void signOut();
          }}
        >
          Sign out
        </Button>
      </GlassPanel>
    </main>
  );
}
