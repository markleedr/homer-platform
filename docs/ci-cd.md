# CI/CD and deploys (P0.2)

How a change gets from a proposal to the live site, and how to undo one. Written
to be readable without a technical background.

## The path a change takes

1. A change is proposed as a pull request (PR) against `main`.
2. GitHub Actions runs the **CI safety check** (`.github/workflows/ci.yml`):
   install, typecheck, build, and a production-dependency audit. If anything
   breaks, the PR is blocked.
3. Vercel builds a **preview deploy** for that PR and posts a private link. You
   can open the change in a browser before it is real.
4. When the PR is approved and merged into `main`, Vercel **publishes to
   production** automatically.

Main is protected: no one pushes to it directly, and the CI check must pass
before merge. This is what kills the copy-paste deploy loop.

## Environments

- **Preview:** every PR gets its own throwaway link. Safe to break.
- **Staging:** the `staging` branch. A stable link for showing work in progress
  (for example, Demo 1 rehearsals) without touching production.
- **Production:** the `main` branch. The real site.

The homeowner app (`app/`) is the first Vercel project. The portal (`portal/`)
becomes a second Vercel project in Phase 1, when it is built out.

## Deploy settings (Vercel project for the homeowner app)

Set in the Vercel dashboard when the project is created:

- **Root directory:** `app`
- **Framework preset:** Vite (auto-detected)
- **Build command:** `npm run build` (default)
- **Output directory:** `dist` (default)
- **Environment variable:** `VITE_PRODUCT_NAME` set to the working name, per
  environment. This is the single switch for the product name.
- **Install command:** Vercel runs `npm install` from the repo root so the
  workspace resolves; the root directory setting scopes the build to `app`.

## How to undo a bad deploy (rollback)

In the Vercel dashboard, open the project, go to **Deployments**, find the last
good one, and choose **Instant Rollback** (or **Promote to Production**). The
live site reverts in seconds without a code change. Because data lives in
Supabase, never in the deploy, a rollback never risks anyone's data.

## Exit check for P0.2

A one-line change reaches production through PR, CI, and deploy in under 10
minutes, with a working rollback. Demonstrated by editing one line of visible
copy, watching it flow to production, then rolling it back.
