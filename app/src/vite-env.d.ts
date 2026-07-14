/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRODUCT_NAME?: string;
  // Supabase project the app talks to. Both are client-safe (see
  // docs/infrastructure.md): the URL and publishable key are designed to be
  // public, and row-level security is the real protection.
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  // Temporary dev unblock. "true" lets the sign-in button enter the app without
  // a magic link (no real session). Never set in production. See config.ts.
  readonly VITE_AUTH_BYPASS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
