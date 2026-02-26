# Order Management (Assessment)

## Features
- Menu display (name/description/price/image)
- Cart add/update/remove + totals
- Checkout delivery details (validated)
- Order creation (REST)
- Order tracking with real-time status updates via SSE
- In-memory storage (menu + orders + idempotency)
- TDD: API tests + domain tests + UI store test

## Tech
- Web: React + Vite + React Router + TanStack Query + Zustand
- API: Node + TypeScript + Express + SSE
- Shared: Zod schemas + shared types (workspace package)
- Tests: Vitest + Supertest (API), Vitest + RTL (Web)

## Quickstart
\`\`\`bash
pnpm install
pnpm dev:api
pnpm dev:web
\`\`\`

- Web: http://localhost:5173
- API: http://localhost:3001

## Tests
\`\`\`bash
pnpm test
\`\`\`

## API
- GET /api/menu
- POST /api/orders (optional header: Idempotency-Key)
- GET /api/orders/:id
- PATCH /api/orders/:id (only while status = RECEIVED)
- POST /api/orders/:id/cancel
- POST /api/orders/:id/status (manual advance; optional)
- GET /api/orders/:id/events (SSE)

## Loom outline (12â€“15 min)
1) Requirement breakdown -> invariants (typed DTOs, state machine)
2) Shared schemas -> validation on both sides
3) API: idempotency, in-memory repo, status simulator, SSE hub
4) UI flow: Menu -> Cart -> Checkout -> Order tracking (EventSource)
5) Tests: domain + endpoints + UI store test
6) AI usage: describe what was generated, what was reviewed, what was corrected
