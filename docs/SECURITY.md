# MiNi Pay web app — security

The browser is not a security boundary. Authentication, authorization, amounts, fees, balances and payment states are enforced by `mini-payment-server`. This document records client-side posture only; see the [backend SECURITY.md](https://github.com/maheshpcse/mini-payment-server/blob/main/docs/SECURITY.md) for server controls.

## In place

| Control | Source |
| --- | --- |
| No secrets in client code; only public `VITE_API_BASE_URL` and `VITE_APP_ENV` | `.env.example`, `src/config/env.ts` |
| `.env` git-ignored | `.gitignore` |
| API errors normalized; raw server internals never rendered | `src/api/client.ts` |
| No automatic retries of state-changing requests | `src/api/client.ts` (+ tests) |
| Error boundary never shows stack traces | `src/features/errors/RouteErrorPage.tsx` |
| External links use `rel="noreferrer"` | `UtilityDock.tsx` |
| Sandbox mode visibly labelled; no fabricated balances or transactions | dock, home, planned pages |
| Production dependency audit in CI | `.github/workflows/ci.yml` |

## Planned

| Control | Design | Task |
| --- | --- | --- |
| Token handling | Access token in memory only (never localStorage); refresh token in httpOnly Secure SameSite cookie set by the API; single-flight refresh; logout clears Query cache and socket | FE-004 |
| Route guards | UX only; every API call is authorized server-side | FE-004 |
| PIN/OTP inputs | Never logged, never persisted, cleared from state after submission; `autocomplete="one-time-code"` for OTP | FE-003, FE-004 |
| Idempotency | One key per payment intent; reused on retry of the same intent | FE-008 |
| QR | Render/parse only backend-signed payloads; no secrets or real account data | FE-010 |
| Socket | Authenticated handshake; client never chooses rooms | FE-011 |
| Content Security Policy | Define CSP (script/style/connect/img/worker) at the hosting layer; verify no inline script beyond the theme bootstrap (hash it) | FE-023 |
| Card data | Never collect PAN/CVV; future card flows use provider-hosted fields | — |
| Error reporting | Scrub tokens/PII before sending to any monitoring service | FE-023 |

## Known limitation

`index.html` contains a small inline script to apply the theme before first paint. A strict CSP must allow it by hash.
