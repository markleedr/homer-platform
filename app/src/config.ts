// Central app configuration.
//
// PRODUCT_NAME is a placeholder. "Homer" is a temporary working name (see CLAUDE.md).
// Every user-visible string must read from here, never hardcode the name, so a rename
// is a single change (set VITE_PRODUCT_NAME per environment).
export const PRODUCT_NAME: string = import.meta.env.VITE_PRODUCT_NAME ?? "Homer";
