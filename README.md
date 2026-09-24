# mini-payment-app

Web app for **MiNi Pay**, a **sandbox / demo** payment experience. It moves no real money and offers no real UPI, banking, card or settlement capability. The visual identity is original: it takes usability cues from modern payment apps but copies none of their UI, branding or assets.

Stack: **React 19 + Vite 8 + TypeScript**, React Router, TanStack Query (server state), CSS Modules on semantic design tokens. Backend: [mini-payment-server](https://github.com/maheshpcse/mini-payment-server).

## Status

Foundation + Design System stage. See [docs/MEMORY.md](docs/MEMORY.md) for the current state and [TASKS.md](TASKS.md) for the evidence-based backlog.

| Implemented | Not implemented yet |
| --- | --- |
| Floating nav island, floating collapsible sidebar (left/right), utility dock, mobile bottom bar + drawer | Auth, dashboard data, payments, contacts, transactions, QR |
| Light/dark/system themes with semantic tokens | Socket.IO, notifications, toasts |
| Centralized API client (timeouts, cancellation, request ids, error normalization, safe retries) | Custom cursor, 3D character/objects, smooth scroll |
| Live API readiness indicator | Playwright E2E |
| Design-system page, honest "planned" pages, 404, error boundary | Developer Lab content and diagrams |

## Quick start

Requirements: Node.js 22.12+. For live API status, run the backend on `http://localhost:4000` (its default CORS origin is `http://localhost:5173`).

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` / `npm run preview` | Type-check + production build / serve the build |
| `npm run build:pages` / `preview:pages` | GitHub Pages build (repository base path, validated HTTPS API URL, `404.html` fallback) — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript project build |
| `npm test` | Vitest + Testing Library (jsdom) |
| `npm run check` | lint + typecheck + tests + build (what CI runs, plus `npm audit`) |

## Deployment

GitHub Pages for this app, Railway for the API: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

Start with [docs/PROJECT_ANALYSIS.md](docs/PROJECT_ANALYSIS.md), then [RULES.md](RULES.md) and [TASKS.md](TASKS.md).

| Document | Purpose |
| --- | --- |
| [PRD](docs/PRD.md) | Product scope and acceptance |
| [Architecture](docs/ARCHITECTURE.md) | Structure, state boundaries, API layer, routing |
| [Design](docs/DESIGN.md) | Visual identity, tokens, typography, motion, accessibility |
| [Security](docs/SECURITY.md) | Client-side security posture |
| [Test plan](docs/TEST_PLAN.md) | Test matrix and current results |
| [Decisions](docs/DECISIONS.md) | ADRs |
| [Memory](docs/MEMORY.md) | Dated handoff |
