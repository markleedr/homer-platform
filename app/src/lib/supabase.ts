// The single Supabase browser client for the homeowner app.
//
// Both values are client-safe and injected at build time per environment
// (VITE_ prefixed, so public). Production talks to homer-production; preview
// deploys talk to homer-staging. Row-level security is the real protection, so
// the publishable key being public is by design (see docs/infrastructure.md).

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  // A configuration error, not a user error: fail loudly so a misconfigured
  // deploy is obvious rather than silently broken.
  throw new Error(
    "Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY " +
      "in the environment (see docs/infrastructure.md).",
  );
}

export const supabase = createClient(url, publishableKey, {
  auth: {
    // Persist the session in the browser and keep it fresh, so a signed-in
    // owner stays signed in across reloads.
    persistSession: true,
    autoRefreshToken: true,
    // Complete the magic-link redirect automatically when the app loads.
    detectSessionInUrl: true,
    // PKCE is the recommended flow for browser apps (magic link and, later, OAuth).
    flowType: "pkce",
  },
});
