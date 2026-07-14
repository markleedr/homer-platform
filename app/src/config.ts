// Central app configuration.
//
// PRODUCT_NAME is a placeholder. "Homer" is a temporary working name (see CLAUDE.md).
// Every user-visible string must read from here, never hardcode the name, so a rename
// is a single change (set VITE_PRODUCT_NAME per environment).
export const PRODUCT_NAME: string = import.meta.env.VITE_PRODUCT_NAME ?? "Homer";

// TEMPORARY auth bypass. When VITE_AUTH_BYPASS is "true", the sign-in button
// enters the app shell without sending a magic link. This is a dev unblock while
// email delivery is sorted (rate limits / SMTP); it creates NO real session, so
// RLS still returns nothing for any data query. Off by default. Never set this
// in production. Remove this flag and the bypass code once email auth is verified.
export const AUTH_BYPASS_ENABLED: boolean =
  import.meta.env.VITE_AUTH_BYPASS === "true";
