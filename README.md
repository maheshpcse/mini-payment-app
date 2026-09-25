# mini-payment-app

Web app for **MiNi Pay**, a **sandbox / demo** payment experience. It moves no real money and offers no real UPI, banking, card or settlement capability. The visual identity is original: it takes usability cues from modern payment apps but copies none of their UI, branding or assets.

Stack: **React 19 + Vite 8 + TypeScript**, React Router, TanStack Query (server state), CSS Modules on semantic design tokens. Backend: [mini-payment-server](https://github.com/maheshpcse/mini-payment-server).

## Status

Foundation, design system, authentication and account stage. See [docs/MEMORY.md](docs/MEMORY.md) for the current state and [TASKS.md](TASKS.md) for the evidence-based backlog.

| Implemented | Not implemented yet |
| --- | --- |
| Floating nav island, floating collapsible sidebar (left/right, centered icon rail with hover tooltips), utility dock, mobile bottom bar + drawer | Payments, contacts, transactions, QR |
| Sign in, sign up, forgot/reset password, protected routes, silent refresh; interactive 3D auth scene | OTP, PIN, device confirmation |
| Profile, edit profile, avatar upload/view/change/remove with initials fallback | Real email/SMS/push delivery (backend BE-015) |
| Settings: appearance, notification channels (browser push permission), payment limits, change password, sessions | Socket.IO, notification center, toasts |
| Wallets: sandbox MiNi wallet, linked bank accounts and UPI IDs, default method | Wallet ledger and top-ups (backend BE-010) |
| Light/dark/system themes with semantic tokens | |
| Centralized API client (timeouts, cancellation, request ids, error normalization, safe retries) | Custom cursor, 3D character/objects, smooth scroll |
| Live API readiness indicator | Playwright E2E |
| Honest "planned" pages, 404, error boundary | |

## Quick start

Requirements: Node.js 22.12+. For live API status, run the backend on `http://localhost:4000` (its default CORS origin is `http://localhost:5173`).

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

Demo login (after `npm run migrate` in mini-payment-server): `demo@example.com` / `MiniPay@2026`, or use the buttons on the sign-in page. See [docs/MASTER_DATA.md](docs/MASTER_DATA.md).

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
| [Master data](docs/MASTER_DATA.md) | Demo logins, menus and master data the app relies on |
| [Security](docs/SECURITY.md) | Client-side security posture |
| [Test plan](docs/TEST_PLAN.md) | Test matrix and current results |
| [Decisions](docs/DECISIONS.md) | ADRs |
| [Memory](docs/MEMORY.md) | Dated handoff |
