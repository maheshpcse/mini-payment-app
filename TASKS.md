# MiNi Pay web app — task backlog

Evidence-based backlog. A task is **Done** only with recorded verification. Priorities: P0 = required for the first end-to-end sandbox payment (M1), P1 = core product, P2 = completeness/polish, P3 = learning/optional. Backend task ids (BE-xxx) refer to [mini-payment-server TASKS](https://github.com/maheshpcse/mini-payment-server/blob/main/TASKS.md).

Delivery order (master prompt §45): Foundation → Design System → Authentication → Dashboard → Contacts → Payments → Transactions → QR → Bills → Rewards → Notifications → Security → Developer Lab → 3D → Optimization → Tests → Production build.

**M1 (critical E2E):** register/login → dashboard → choose recipient → enter amount → confirm → simulated processing → backend update over Socket.IO → success → transaction in history → notification appears.

## Backlog

| ID | Pri | Scope | Acceptance criteria | Verification | Depends | Status |
| --- | --- | --- | --- | --- | --- | --- |
| FE-001 | P0 | Foundation | Vite/React/TS strict; feature folders; router with error boundary; API client (base URL, timeout, cancellation, request ids, error normalization, GET-only retries); TanStack Query; theme system; floating nav island, sidebar (collapse, left/right, persisted), utility dock, mobile bar + drawer; 404; live API status; CI workflow | `npm run check`; browser walkthrough against live backend | — | Done |
| FE-002 | P0 | Design system v1 | Semantic tokens light/dark; typography system; Button, StatusPill, AmountDisplay, TextField, Island, BrandMark with states; design-system page | Component tests; visual check in both themes | FE-001 | Done |
| FE-003 | P0 | Design system v2 | Accessible Dialog (focus trap, Esc, return focus), Toast region (`aria-live`), OTP input, PIN input (masked, paste-safe), amount input (minor-unit output, no floats), Select, Toggle, Segmented control, Skeleton, Tooltip | Component + keyboard tests; axe checks | FE-002 | Ready |
| FE-004 | P0 | Authentication | Welcome, register, login, OTP, forgot/reset, device confirmation, PIN setup, biometric capability indication, session expired; auth state separate from server state; protected routes; access token in memory, refresh via httpOnly cookie; single-flight refresh in API client; logout clears caches | Route-guard, form validation, refresh-flow tests (mocked API) | FE-003, BE-004, BE-007, BE-008 | Planned |
| FE-005 | P0 | E2E harness | Playwright config, CI job starting API (Compose) + app; smoke test; later the M1 scenario | CI run green | FE-001, BE-029 | Planned |
| FE-006 | P0 | Dashboard + wallet | Greeting, sandbox balance from API (masked toggle), quick actions, recent contacts/transactions, upcoming bills, rewards, insights, security alerts, skeleton states | Tests with mocked API; E2E on live stack | FE-004, BE-010 | Planned |
| FE-007 | P1 | Contacts & search | People-first list, favorites, recent, risk indicator, privacy-aware search (no user enumeration), beneficiaries | Tests; a11y list semantics | FE-004, BE-016 | Planned |
| FE-008 | P0 | Quick payment flow | Recipient → amount → note → funding source → review → PIN → processing visualization → success/failure → receipt; payment draft store; one Idempotency-Key per draft; double-submit impossible; server errors mapped to friendly copy | Payment-flow tests incl. insufficient funds, invalid state, duplicate; E2E M1 | FE-003, FE-006, BE-011, BE-012 | Planned |
| FE-009 | P1 | Transactions | Timeline with filters (type/status/date/amount/account), cursor pagination, detail (IDs, lifecycle, receipt, report issue) | Tests; E2E pagination | FE-004, BE-014 | Planned |
| FE-010 | P1 | QR | Generate user QR, simulated scan, upload image, camera scan when supported (permission handling), merchant QR simulation, history; payload from backend only | QR parse tests; camera-denied path | FE-008, BE-018 | Planned |
| FE-011 | P1 | Real-time + notifications | Socket.IO client authenticated with access token; reconnect; events update Query cache; notification center; toasts; animated status transitions (INITIATED → PROCESSING → SUCCESS/FAILED/REFUNDED/REVERSED) | WebSocket tests with mock server | FE-003, BE-013, BE-015 | Planned |
| FE-012 | P2 | Bills & recharge | Categories, saved billers, reminders, autopay simulation, recharge plans/operators, receipts | Tests with sandbox scenarios | FE-008, BE-023 | Planned |
| FE-013 | P2 | Rewards | Scratch-card-style reveal (keyboard accessible), points, streaks, milestones, coupons; clearly non-monetary | Tests; reduced-motion variant | FE-011, BE-024 | Planned |
| FE-014 | P2 | Analytics | Sent/received, categories, weekly/monthly, frequent recipients, success ratio; lightweight chart lib chosen via DECISIONS; charts have text alternatives | Tests; a11y tables | FE-009, BE-026 | Planned |
| FE-015 | P1 | Security center & settings | Sessions/devices with revoke, recent logins, PIN status, 2FA, limits, password update, tips, suspicious activity; profile & appearance settings | Tests; confirm dialogs | FE-004, BE-025 | Planned |
| FE-016 | P3 | Developer Lab tracks & questionnaire | Angular/React/Node/MySQL/MongoDB tracks; questions with answer area, hint, explanation, difficulty, category, progress, optional timer; isolated from payment flows | Tests | FE-003, BE-028 | Planned |
| FE-017 | P3 | Workflow & relationship diagrams | Mermaid or React Flow (DECISIONS); workflows from backend definitions; ER explorer with zoom/pan/inspect; keyboard alternative | Tests; lazy-loaded chunk | FE-016, BE-028 | Planned |
| FE-018 | P2 | Custom cursor | States (default, clickable, text, drag, disabled, payment, QR, 3D), magnetic CTAs, micro-labels; disabled on touch/coarse pointers and reduced motion; never hides native focus | Tests for enable/disable conditions; manual check | FE-003 | Planned |
| FE-019 | P2 | 3D layer | R3F lazy chunk; payment orb/card/QR cube; original digital assistant with idle/breathing/eye/head tracking and reactions; GLB + Draco/Meshopt; pause offscreen; dispose; quality tiers; static fallback; only on onboarding/processing/success/help/security/rewards | 3D fallback tests; bundle budget; FPS check | FE-008 | Planned |
| FE-020 | P2 | Motion & scroll | Route/section transitions, visible scroll progress, subtle parallax, optional smooth scroll (evaluate Lenis vs native); no scroll-jacking | Reduced-motion tests | FE-003 | Planned |
| FE-021 | P1 | Error experience | Original 403, 500, offline, maintenance, API unavailable, payment failed, session expired pages; offline detection | Tests per state | FE-004 | Planned |
| FE-022 | P1 | Accessibility automation | axe checks in component tests and Playwright; contrast verification of tokens (both themes) | CI gate | FE-005 | Planned |
| FE-023 | P2 | Performance | Route-level code splitting; bundle budget in CI; font subset review; image/3D budgets; Web Vitals reporting hook | Build report within budget | FE-006 | Planned |
| FE-024 | P1 | Money requests | Create, share, status, cancel, remind, paid/expired states | Tests | FE-008, BE-017 | Planned |
| FE-025 | P1 | CI validation | GitHub Actions workflow runs green on PR | CI link | FE-001 | Ready |

## Evidence

### FE-001 / FE-002 — Foundation and design system v1 (Done, 24 Sep 2026)

- `npm run check` → lint clean, typecheck clean, 6 files / 42 tests passed, production build succeeded (JS 389 kB, 123 kB gzip; CSS 41 kB).
- App run against live backend (MongoDB 8.2.6 replica set + Redis 7.0.15): readiness 200 and CORS allows `http://localhost:5173`. Browser walkthrough results are recorded in [docs/MEMORY.md](docs/MEMORY.md).
- **Not verified:** CI workflow run (FE-025); Playwright/axe automation (FE-005, FE-022).
