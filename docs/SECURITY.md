# MiNi Pay web app — security

The browser is not a security boundary. Authentication, authorization, amounts, fees, balances and payment states are enforced by `mini-payment-server`. This document records client-side posture only; see the [backend SECURITY.md](https://github.com/maheshpcse/mini-payment-server/blob/main/docs/SECURITY.md) for server controls.

## In place

| Control | Source |
| --- | --- |
| No secrets in client code; only public `VITE_API_BASE_URL`, `VITE_APP_ENV` and `VITE_DEMO_LOGIN` (the demo password is intentionally public) | `.env.example`, `src/config/env.ts` |
| `.env` git-ignored | `.gitignore` |
| API errors normalized; raw server internals never rendered | `src/api/client.ts` |
| No automatic retries of state-changing requests | `src/api/client.ts` (+ tests) |
| Error boundary never shows stack traces | `src/features/errors/RouteErrorPage.tsx` |
| External links use `rel="noreferrer"` | `UtilityDock.tsx` |
| Sandbox mode visibly labelled; no fabricated balances or transactions | dock, home, planned pages |
| Production dependency audit in CI | `.github/workflows/ci.yml` |
| Access token in memory only (never localStorage); refresh token is the API's HttpOnly cookie; single-flight refresh; sign-out clears the Query cache | `features/auth/session-store.ts`, `api/client.ts`, `app.test.tsx` |
| Route guards are UX only; `?next=` accepts same-app paths only (no open redirect) | `features/auth/RequireAuth.tsx`, `redirect.ts`, `auth.test.tsx` |
| Avatars re-encoded client-side (center crop, 320 px WebP/JPEG), which strips EXIF/GPS metadata before upload; the API re-checks type by magic bytes and size | `shared/lib/image.ts` |
| Bank account numbers are sent once and never displayed back (API returns last 4 only); the confirm field blocks paste | `features/wallets/AddMethodDialogs.tsx` |
| Password fields use `autocomplete` new/current-password; strength meter is guidance only, the API enforces the rule | `shared/ui/PasswordField.tsx` |

## Planned

| Control | Design | Task |
| --- | --- | --- |
| Socket sign-out | Disconnect the socket on sign-out | FE-011 |
| PIN/OTP inputs | Never logged, never persisted, cleared from state after submission; `autocomplete="one-time-code"` for OTP | FE-003, FE-004 |
| Idempotency | One key per payment intent; reused on retry of the same intent | FE-008 |
| QR | Render/parse only backend-signed payloads; no secrets or real account data | FE-010 |
| Socket | Authenticated handshake; client never chooses rooms | FE-011 |
| Content Security Policy | Define CSP (script/style/connect/img/worker) at the hosting layer; verify no inline script beyond the theme bootstrap (hash it) | FE-023 |
| Card data | Never collect PAN/CVV; future card flows use provider-hosted fields | — |
| Error reporting | Scrub tokens/PII before sending to any monitoring service | FE-023 |

## Known limitation

`index.html` contains a small inline script to apply the theme before first paint. A strict CSP must allow it by hash.
