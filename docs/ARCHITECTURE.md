# MiNi Pay web app — architecture

## Overview

Single-page app built by Vite. It consumes one backend (`mini-payment-server`, a modular monolith) through a versioned REST API (`VITE_API_BASE_URL`, default `http://localhost:4000/api/v1`) and, later, one authenticated Socket.IO connection.

## Source layout

Only folders with real content exist; others are created by the task that needs them.

```text
src/
  main.tsx                 fonts, global styles, router, providers
  app/                     routes, providers, query client, app-level tests
  api/                     centralized HTTP client and ApiError
  config/                  env (public build values), navigation map
  core/theme/              theme context + provider
  layouts/app-shell/       nav island, sidebar, utility dock, mobile nav, shell prefs
  features/
    home/                  sandbox overview
    system-status/         backend readiness query + indicator
    landing/               public landing page (/welcome)
    planned/               honest placeholder for unbuilt routes
    auth/                  session store, route guard, sign in / sign up / password pages, 3D auth scene
    account/               profile, edit profile, avatar manager, account API hooks
    settings/              general, notifications, payments and security settings
    wallets/               sandbox wallet, bank accounts and UPI IDs
    errors/                404 + route error boundary
  shared/
    ui/                    design-system primitives (Button, TextField, ...)
    lib/                   pure helpers (money formatting)
  styles/                  tokens.css, base.css
  test/                    test setup and render helpers
```

Planned additions follow the master prompt's feature-oriented structure: `features/{auth,onboarding,dashboard,payments,scan,contacts,transactions,bills,recharge,rewards,accounts,analytics,notifications,security,settings,support}`, `hooks/`, `store/` (small, per-concern stores), `three/` (lazy 3D), `animations/`, `validators/`.

## State boundaries

| State | Owner | Status |
| --- | --- | --- |
| Server state | TanStack Query (per-feature query keys; socket events update caches) | In use (readiness) |
| Auth state | `features/auth/session-store.ts` (`useSyncExternalStore`); access token in memory only, refresh cookie is HttpOnly | In use |
| UI state | Local component state; shell prefs in `useShellPreferences` (localStorage) | In use |
| Payment draft | Per-flow store holding recipient, amount (minor units), note, source, idempotency key | FE-008 |
| Notification state | Toast queue + notification center (server-backed list) | FE-011 |
| 3D state | Scoped to lazy 3D chunk | FE-019 |

## API layer (`src/api/client.ts`)

- Base URL from env; JSON in/out; unwraps `{ data }`.
- `X-Request-Id` generated once per logical request and reused across retries, so backend logs correlate.
- Timeout (default 10 s) and caller cancellation via `AbortSignal`.
- Error normalization to `ApiError { code, message, status, requestId, details }`; client-only codes `NETWORK_ERROR`, `TIMEOUT`, `ABORTED`, `INVALID_RESPONSE`.
- Retries only for GET on network errors, timeouts and 502/503/504, with exponential backoff. Never for POST/PUT/PATCH/DELETE; payments rely on the backend `Idempotency-Key` contract.
- `credentials: 'include'` so the HttpOnly refresh cookie is sent.
- Auth hooks from the session store attach `Authorization: Bearer`; a 401 with `UNAUTHENTICATED` / `AUTH_SESSION_EXPIRED` triggers one single-flight refresh and one replay. Auth endpoints are called with `anonymous: true`.

## Routing

`createBrowserRouter` with the shell as layout route and `RouteErrorPage` as error boundary. Routes for not-yet-built features are generated from `config/navigation.ts` and render `PlannedFeaturePage`. `RequireAuth` wraps the shell: on load it restores the session through `POST /auth/refresh`, and anonymous visitors go to `/login?next=…` (`safeNextPath` accepts same-app paths only), except the site root, which sends them to the public landing page at `/welcome` (`features/landing`). The landing page is outside both layouts and adapts its calls to action to the session (Get started / demo vs Open app). Guards are UX only — the backend enforces authorization.

On client navigation, focus moves to `<main>` and the page scrolls to top; a skip link is the first focusable element.

## Real-time (planned, FE-011)

One Socket.IO client created after login with `auth: { token }`; reconnect with backoff; events (`payment.*`, `request.*`, `notification.created`, `security.alert`) update Query caches and the toast queue.

## Build and performance

Vite production build; fonts self-hosted via Fontsource variable fonts (browsers only download subsets needed via `unicode-range`). Route-level code splitting, bundle budgets and 3D lazy chunks are FE-023/FE-019.
