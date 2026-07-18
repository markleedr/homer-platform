# Homer local development shortcuts.
#
# `make dev` runs the homeowner app with its configuration injected from
# 1Password at runtime via `op run`, so no file with real values ever touches
# disk. The reference file .env.op holds only op:// pointers (safe to commit);
# the actual values live in your 1Password vault.
#
# Requires the 1Password CLI (op). See README "Running locally" for install and
# first-time setup.

SHELL := /bin/bash
OP_ENV := .env.op

.PHONY: help dev dev-app dev-portal check-op

help: ## List the available targets
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) \
	  | sort \
	  | awk 'BEGIN{FS=":.*?## "}{printf "  %-12s %s\n", $$1, $$2}'

dev: dev-app ## Run the homeowner app (alias for dev-app)

dev-app: check-op ## Homeowner app at http://localhost:5173, config from 1Password
	op run --env-file=$(OP_ENV) -- npm run dev:app

dev-portal: check-op ## Developer portal at http://localhost:5174, config from 1Password
	op run --env-file=$(OP_ENV) -- npm run dev:portal

check-op: ## Verify the 1Password CLI is installed and signed in
	@command -v op >/dev/null 2>&1 || { \
	  echo "1Password CLI (op) is not installed."; \
	  echo "Install it and sign in, then retry. See README 'Running locally'."; \
	  exit 1; }
	@op whoami >/dev/null 2>&1 || { \
	  echo "Not signed in to 1Password. Run 'op signin', or turn on the 1Password"; \
	  echo "desktop app's 'Integrate with 1Password CLI' setting, then retry."; \
	  exit 1; }
