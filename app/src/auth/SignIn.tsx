// Passwordless sign-in for the homeowner app.
//
// Demo 1 is owner-only (you and Beck), so this is email magic link: enter an
// email, receive a secure one-time link, and land back in the app signed in. No
// password to set or forget. Google and Apple OAuth and household invites are
// part of full P0.11 and slot in behind Demo 1; the layout leaves room for the
// OAuth buttons without a rewrite.
//
// Styling is the plain holding shell, not the liquid glass language (PRD 8e).
// The on-brand sign-in lands with the component library in P0.24b, so the look
// is built once rather than restyled twice.

import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { PRODUCT_NAME } from "../config";
import { GlassPanel } from "../ui/GlassPanel";
import { Button } from "../ui/Button";

type Status = "idle" | "sending" | "sent" | "error";

// onBypass is only passed when the temporary auth bypass is enabled (see
// config.ts). When set, submitting enters the app instead of sending a link.
export function SignIn({ onBypass }: { onBypass?: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Temporary bypass: enter the app without contacting Supabase.
    if (onBypass) {
      onBypass(email.trim());
      return;
    }

    setStatus("sending");
    setErrorText("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // Return to wherever the app is running (localhost, preview, or
        // production). This origin must be in the Supabase redirect allowlist.
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setStatus("error");
      setErrorText(error.message);
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <main className="shell">
        <GlassPanel className="panel">
          <p className="shell-eyebrow">{PRODUCT_NAME}</p>
          <h1 className="shell-title">Check your email</h1>
          <p className="shell-note">
            We sent a sign-in link to {email}. Open it on this device to
            continue.
          </p>
        </GlassPanel>
      </main>
    );
  }

  return (
    <main className="shell">
      <GlassPanel className="panel">
        <p className="shell-eyebrow">{PRODUCT_NAME}</p>
        <h1 className="shell-title">Sign in</h1>
        <p className="shell-note">
          Enter your email and we will send you a secure sign-in link. No
          password needed.
        </p>
        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-label" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            className="auth-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
          <Button
            variant="primary"
            type="submit"
            icon={onBypass ? undefined : "mail"}
            disabled={status === "sending"}
          >
            {onBypass
              ? "Continue"
              : status === "sending"
                ? "Sending"
                : "Send sign-in link"}
          </Button>
          {status === "error" && (
            <p className="auth-error" role="alert">
              {errorText || "Something went wrong. Please try again."}
            </p>
          )}
        </form>
      </GlassPanel>
    </main>
  );
}
