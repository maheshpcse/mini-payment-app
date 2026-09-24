# MiNi Pay web app — task backlog

Evidence-based backlog. A task is **Done** only with recorded verification. Priorities: P0 = required for the first end-to-end sandbox payment (M1), P1 = core product, P2 = completeness/polish, P3 = learning/optional. Backend task ids (BE-xxx) refer to [mini-payment-server TASKS](https://github.com/maheshpcse/mini-payment-server/blob/main/TASKS.md).

Delivery order (master prompt §45): Foundation → Design System → Authentication → Dashboard → Contacts → Payments → Transactions → QR → Bills → Rewards → Notifications → Security → 3D → Optimization → Tests → Production build.

**M1 (critical E2E):** register/login → dashboard → choose recipient → enter amount → confirm → simulated processing → backend update over Socket.IO → success → transaction in history → notification appears.

## Backlog

| ID | Pri | Scope | Acceptance criteria | Verification | Depends | Status |
| --- | --- | --- | --- | --- | --- | --- |
| FE-001 | P0 | Foundation | Vite/React/TS strict; feature folders; router with error boundary; API client (base URL, timeout, cancellation, request ids, error normalization, GET-only retries); TanStack Query; theme system; floating nav island, sidebar (collapse, left/right, persisted), utility dock, mobile bar + drawer; 404; live API status; CI workflow | `npm run check`; browser walkthrough against live backend | — | Done |
| FE-002 | P0 | Design system v1 | Semantic tokens light/dark; typography system; Button, StatusPill, AmountDisplay, TextField, Island, BrandMark with states | Component tests; visual check in both themes | FE-001 | Done |
| FE-003 | P0 | Design system v2 | Accessible Dialog (focus trap, Esc, return focus), Toast region (`aria-live`), OTP input, PIN input (masked, paste-safe), amount input (minor-unit output, no floats), Select, Toggle, Segmented control, Skeleton, Tooltip | Component + keyboard tests; axe checks | FE-002 | Ready |
| FE-004 | P0 | Authentication | Welcome, register, login, OTP, forgot/reset, device confirmation, PIN setup, biometric capability indication, session expired; auth state separate from server state; protected routes; access token in memory, refresh via httpOnly cookie; single-flight refresh in API client; logout clears caches | Route-guard, form validation, refresh-flow tests (mocked API) | FE-003, BE-004, BE-007, BE-008 | In progress: register, login, forgot/reset, protected routes, in-memory token, single-flight refresh, logout done (see Evidence); OTP, device confirmation, PIN, biometrics pending |
| FE-005 | P0 | E2E harness | Playwright config, CI job starting API (Compose) + app; smoke test; later the M1 scenario | CI run green | FE-001, BE-029 | Planned |
| FE-006 | P0 | Dashboard + wallet | Greeting, sandbox balance from API (masked toggle), quick actions, recent contacts/transactions, upcoming bills, rewards, insights, security alerts, skeleton states | Tests with mocked API; E2E on live stack | FE-004, BE-010 | In progress: greeting, wallet summary, masked balance, Wallets page (bank accounts, UPI IDs, default method) done; ledger balance, recent activity, bills, rewards, insights pending |
| FE-007 | P1 | Contacts & search | People-first list, favorites, recent, risk indicator, privacy-aware search (no user enumeration), beneficiaries | Tests; a11y list semantics | FE-004, BE-016 | Planned |
| FE-008 | P0 | Quick payment flow | Recipient → amount → note → funding source → review → PIN → processing visualization → success/failure → receipt; payment draft store; one Idempotency-Key per draft; double-submit impossible; server errors mapped to friendly copy | Payment-flow tests incl. insufficient funds, invalid state, duplicate; E2E M1 | FE-003, FE-006, BE-011, BE-012 | Planned |
| FE-009 | P1 | Transactions | Timeline with filters (type/status/date/amount/account), cursor pagination, detail (IDs, lifecycle, receipt, report issue) | Tests; E2E pagination | FE-004, BE-014 | Planned |
| FE-010 | P1 | QR | Generate user QR, simulated scan, upload image, camera scan when supported (permission handling), merchant QR simulation, history; payload from backend only | QR parse tests; camera-denied path | FE-008, BE-018 | Planned |
| FE-011 | P1 | Real-time + notifications | Socket.IO client authenticated with access token; reconnect; events update Query cache; notification center; toasts; animated status transitions (INITIATED → PROCESSING → SUCCESS/FAILED/REFUNDED/REVERSED) | WebSocket tests with mock server | FE-003, BE-013, BE-015 | Planned |
| FE-012 | P2 | Bills & recharge | Categories, saved billers, reminders, autopay simulation, recharge plans/operators, receipts | Tests with sandbox scenarios | FE-008, BE-023 | Planned |
| FE-013 | P2 | Rewards | Scratch-card-style reveal (keyboard accessible), points, streaks, milestones, coupons; clearly non-monetary | Tests; reduced-motion variant | FE-011, BE-024 | Planned |
| FE-014 | P2 | Analytics | Sent/received, categories, weekly/monthly, frequent recipients, success ratio; lightweight chart lib chosen via DECISIONS; charts have text alternatives | Tests; a11y tables | FE-009, BE-026 | Planned |
| FE-015 | P1 | Security center & settings | Sessions/devices with revoke, recent logins, PIN status, 2FA, limits, password update, tips, suspicious activity; profile & appearance settings | Tests; confirm dialogs | FE-004, BE-025 | In progress: sessions with revoke / sign out everywhere, password change, limits, notification channels, profile + avatar, appearance done; PIN, 2FA, recent logins, suspicious activity pending |
| FE-018 | P2 | Custom cursor | States (default, clickable, text, drag, disabled, payment, QR, 3D), magnetic CTAs, micro-labels; disabled on touch/coarse pointers and reduced motion; never hides native focus | Tests for enable/disable conditions; manual check | FE-003 | Planned |
| FE-019 | P2 | 3D layer | R3F lazy chunk; payment orb/card/QR cube; original digital assistant with idle/breathing/eye/head tracking and reactions; GLB + Draco/Meshopt; pause offscreen; dispose; quality tiers; static fallback; only on onboarding/processing/success/help/security/rewards | 3D fallback tests; bundle budget; FPS check | FE-008 | Planned |
| FE-020 | P2 | Motion & scroll | Route/section transitions, visible scroll progress, subtle parallax, optional smooth scroll (evaluate Lenis vs native); no scroll-jacking | Reduced-motion tests | FE-003 | Planned |
| FE-021 | P1 | Error experience | Original 403, 500, offline, maintenance, API unavailable, payment failed, session expired pages; offline detection | Tests per state | FE-004 | Planned |
| FE-022 | P1 | Accessibility automation | axe checks in component tests and Playwright; contrast verification of tokens (both themes) | CI gate | FE-005 | Planned |
| FE-023 | P2 | Performance | Route-level code splitting; bundle budget in CI; font subset review; image/3D budgets; Web Vitals reporting hook | Build report within budget | FE-006 | Planned |
| FE-024 | P1 | Money requests | Create, share, status, cancel, remind, paid/expired states | Tests | FE-008, BE-017 | Planned |
| FE-025 | P1 | CI validation | GitHub Actions workflow runs green on PR | CI link | FE-001 | Ready |
| FE-026 | P1 | Deployment | GitHub Pages deployment | `deploy-pages.yml` (lint, test, `build:pages`, Pages artifact + deploy); `--mode pages` base path from `configure-pages`; router basename; build fails on missing/insecure API URL; `404.html` SPA fallback + `.nojekyll`; `docs/DEPLOYMENT.md` | `build/github-pages.test.ts`; `build:pages` rejected invalid config and produced prefixed assets; Pages-like static server: deep link and unknown route rendered in Chrome | FE-001 | Done |

## Evidence

### FE-001 / FE-002 — Foundation and design system v1 (Done, 24 Sep 2026)

- `npm run check` → lint clean, typecheck clean, 6 files / 42 tests passed, production build succeeded (JS 389 kB, 123 kB gzip; CSS 41 kB).
- App run against live backend (MongoDB 8.2.6 replica set + Redis 7.0.15): readiness 200 and CORS allows `http://localhost:5173`. Browser walkthrough results are recorded in [docs/MEMORY.md](docs/MEMORY.md).
- **Not verified:** CI workflow run (FE-025); Playwright/axe automation (FE-005, FE-022).

### FE-004 / FE-006 / FE-015 (partial) — Auth, account, settings and wallets (24 Sep 2026)

- Built: sign in, sign up (sandbox acknowledgement, strength meter), forgot and reset password (sandbox reset link shown only when the API returns one), `RequireAuth` with `?next=` return, session restore through the refresh cookie, single-flight refresh + one replay on 401, sign out / sign out everywhere; profile, edit profile, avatar view / change (client crop to 320 px) / remove with initials fallback; settings (appearance, notification channels with browser push permission, event toggles, payment limits, default method, hide balance, change password, signed-in sessions with revoke); Wallets (sandbox wallet, bank accounts with IFSC bank detection, UPI IDs with handle suggestions, default, remove); account menu in the nav island.
- Developer Lab removed from navigation, routes and docs. Collapsed sidebar icons centred (measured 0 px offset from the rail centre for all 14 items in Chrome); themed tooltip beside the rail on hover / keyboard focus only while collapsed, flipping side with the sidebar.
- `npm run check` → lint, typecheck, 10 files / 108 tests, production build passing.
- Headless Chrome against the local API (MongoDB replica set + Redis): login → home, collapse + tooltip (light, dark, right-side), avatar upload shown in the nav island, UPI add via handle chip, bank link with "HDFC Bank detected" and masked `•••• 9012`, settings pages, sign out notice, 390 / 768 / 1440 px auth pages. Screenshots were reviewed; clipped QR tile and mobile headline overlap were fixed and re-checked.
- **Not done:** OTP, PIN, device confirmation, biometrics (FE-004); ledger balance, recent activity (FE-006, needs BE-010); 2FA, recent logins (FE-015); real email / SMS / push delivery (BE-015).
