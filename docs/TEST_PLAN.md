# MiNi Pay web app — test plan

## Commands

| Command | Scope |
| --- | --- |
| `npm test` | Vitest + Testing Library in jsdom |
| `npm run check` | lint + typecheck + tests + build |
| CI | `check` steps + `npm audit --omit=dev --audit-level=high` |

Planned: Playwright (`npm run e2e`) against the Compose stack (FE-005), axe accessibility checks (FE-022).

## Current results (24 Sep 2026)

`npm run check`: 6 files, 42 tests, all passing.

| File | Covers |
| --- | --- |
| `src/api/client.test.ts` | envelope unwrap, request id, JSON body, server error normalization, network error, timeout, cancellation, GET-only retries with stable request id, no retry on 4xx, accepted statuses, unreadable responses |
| `src/shared/lib/money.test.ts` | minor-unit formatting, Indian grouping, large safe integers, invalid input |
| `src/shared/ui/ui.test.tsx` | Button loading blocks double submit + announces; AmountDisplay accessible text and masking; TextField label/hint/error associations |
| `src/core/theme/ThemeProvider.test.tsx` | system default, explicit choice applied + persisted, invalid stored values ignored |
| `src/features/system-status/useSystemHealth.test.ts` | online / degraded (503) / offline mapping |
| `src/app/app.test.tsx` | shell landmarks + sandbox label + skip link, API online/offline, lab separation, active route, planned page, design-system page, 404, sidebar navigation, collapse persistence, right-side docking, mobile drawer Esc + focus |

Manual browser verification against the live backend is recorded in [MEMORY.md](MEMORY.md).

## Required matrix (master prompt §44)

| Area | Cases | Task |
| --- | --- | --- |
| Authentication | login/register validation, refresh flow, session expiry | FE-004 |
| Route guards | unauthenticated redirect, return-to | FE-004 |
| Payment flow | recipient → receipt; insufficient funds; invalid state; double submit; idempotency key reuse | FE-008 |
| QR | parse valid/tampered/expired; camera denied | FE-010 |
| Validation | amount (≤ 2 decimals, > 0, limits), phone, payment ID, OTP, PIN | FE-003/FE-004 |
| API mocking | MSW or fetch stubs per feature | ongoing |
| WebSocket | event → cache update → toast; reconnect | FE-011 |
| Responsive | 320, 390, 768, 1024, 1440 px snapshots | FE-005 |
| Accessibility | axe per page, keyboard walkthroughs | FE-022 |
| 3D fallback | WebGL unavailable, reduced motion, low-power tier | FE-019 |
| E2E (M1) | register/login → pay → processing → success → history → notification | FE-005 + FE-008 + FE-011 |

## Rules

Synthetic data only. Report actual results including failures and suites not run. A task closes only with evidence in TASKS.md.
