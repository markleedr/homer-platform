# SETUP.md - Getting this into Claude Code (10 minutes)

1. Install Claude Code (terminal): `npm install -g @anthropic-ai/claude-code`, then `claude` in any folder to sign in. Or use the desktop app's Code tab.
2. Create the repo: extract this bundle so CLAUDE.md, HANDOVER.md, SETUP.md and /docs sit at the repo root. `git init`, commit, push to a new private GitHub repo (e.g. homer-platform). Keep silky-oak as-is for reference; its app.jsx gets migrated in, not edited in place.
3. Open Claude Code in the repo root. It auto-loads CLAUDE.md. First prompt suggestion:
   "Read HANDOVER.md and docs/README.md, then start ticket P0.1 from docs/03-phase0-tickets.md: set up the monorepo structure. Show me the plan before creating files."
4. Connect Vercel + Supabase when P0.2/P0.4 come up; Claude Code will walk through both (have the Vercel and Supabase dashboards handy for tokens).
5. Cadence that works: one ticket per session, review the diff, merge via PR so the CI pipeline from P0.2 is exercised from day one.
