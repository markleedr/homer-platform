# /api - serverless functions (AI gateway)

Vercel serverless functions live here. This is where the AI gateway is built.

Nothing lands here in P0.1. The gateway arrives in Week 4 of Phase 0:

- **P0.16** gateway rebuild: per-request key resolution (user key > org key > platform pool), request logging, weighted-unit metering, per-user daily caps.
- **P0.17** context assembler: system context from the structured property profile plus pgvector RAG, scoped by the entitlement resolver.
- **P0.18** guardrail layer: emergency pre-LLM filters, no-liability framing, global caps. Non-overridable regardless of key source.

Key resolution and guardrails are non-negotiable rules (CLAUDE.md 3, 4, 5). Do not add a function here that calls a model without going through the gateway.
