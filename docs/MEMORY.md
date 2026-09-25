# Project memory

Update after every work session: what changed, checks actually run, limits, next bounded task. Keep secrets, personal data and transcripts out.

## Standing preferences

- Sandbox/demo only; never present simulated money as real.
- Original identity; no copying of other payment apps' UI or trademarks.
- Documentation-first with evidence-based task closure (miniHrmsUI discipline, not its Angular runtime).
- Backend is a modular monolith (`mini-payment-server`); the app talks to one `/api/v1` API. Dev origins: app `http://localhost:5173`, API `http://localhost:4000`.
- Add motion/3D/cursor libraries only through their tasks with budgets.

## 24 September 2026 — Foundation and design system v1

**Done:** FE-001 (tooling, API client, theme, floating shell, routing, 404/error boundary, live API status, CI file) and FE-002 (tokens, typography, Button, StatusPill, AmountDisplay, TextField, Island, BrandMark). Full documentation set created.

**Checks run:** `npm run check` → lint, typecheck, 42 tests, production build passing. Browser walkthrough against the live backend (MongoDB 8.2.6 replica set + Redis 7.0.15): light and dark home, API online indicator, sidebar collapse and right-side docking, planned Pay page, component showcase (floating labels, loading button; page since removed), 404, mobile 390 px with bottom bar and drawer (Esc closes).

**Fixed after review:** sidebar showed a horizontal scrollbar and clipped "Soon" tags on long labels (grid column sized to the longest item; fixed with `minmax(0, 1fr)` + `min-width: 0` so labels ellipsize); decorative orb overlapped the sandbox-wallet copy. Re-verified with headless Chrome screenshots at 1440×1300 (light and dark).

**Not verified:** CI run (FE-025); Playwright/axe automation; Safari/Firefox.

**Next bounded task:** FE-003 (design system v2: dialog, toast, OTP/PIN/amount inputs). Auth UI (FE-004) waits for backend BE-004.

## 24 September 2026 — GitHub Pages deployment

**Done:** FE-026 (Pages workflow, `--mode pages` build with validated public settings, router basename, `404.html` fallback, `.nojekyll`, `docs/DEPLOYMENT.md`), modelled on miniHrmsUI but using a copied `index.html` as the fallback instead of a redirect script. The API side (Railway) is BE-032 in mini-payment-server.

**Checks run:** `npm run check`; `build:pages` failing for missing and http/localhost API URLs; successful build with `/mini-payment-app/` asset prefixes and the API URL embedded; Chrome against a Pages-like server (no rewrites, 404.html for misses): deep link and unknown route render.

**Not verified:** a live Pages deployment and the workflow run itself (needs repository settings and the `API_BASE_URL` variable).

**Open question:** shared `maheshpcse.github.io` origin and cross-site refresh cookies — resolved for now with `SameSite=None; Secure; Partitioned` refresh cookies (see DEPLOYMENT.md); custom domains remain the long-term fix.

## 24 September 2026 — Authentication, account pages, wallets

**Done:** Developer Lab removed (navigation, routes, docs). Collapsed rail centring and hover tooltips. Auth pages with an interactive CSS 3D scene (pointer parallax, disabled for reduced motion and coarse pointers); session store with in-memory access token; profile, avatar, settings, notifications, payment settings, security and wallets pages. Backed by mini-payment-server BE-004 and the accounts APIs. Evidence in TASKS.md.

**Checks run:** `npm run check` (108 tests). Headless Chrome walkthrough against the local API, including avatar upload and linking a UPI ID and bank account.

**Fixed after review:** sign-out notice was lost because the route guard's redirect replaced the navigation; sign-out now records the reason in the session store and the guard redirects with it. QR tile clipped at the top of the auth scene; coin and toast overlapping the mobile headline.

**Not verified:** Safari/Firefox, live Pages + Railway cross-site cookie (needs `JWT_SECRET` set on Railway).

**Next bounded task:** FE-003 remaining primitives (toast, OTP/PIN inputs), then OTP login with BE-007.

## 25 September 2026 — Demo login and pinned auth showcase

**Done:** FE-027. Login page offers one-click demo sign-in (Priya and Rahul, password `MiniPay@2026`, seeded by the API's migration 0003). Demo users see a "Shared demo account" notice and the controls the API rejects are disabled. The auth pages' 3D showcase is now `position: sticky` at full viewport height on wide screens, so only the form column scrolls. Reference data and demo accounts are summarised in [MASTER_DATA.md](MASTER_DATA.md).

**Next bounded task:** FE-003 remaining primitives, then FE-028 once BE-005 `requireRole` exists.

## 25 September 2026 — Landing page

**Done:** FE-029. Public landing page at `/welcome`; signed-out visitors to the site root (including the GitHub Pages URL) arrive there instead of the sign-in form. The feature grid is generated from `navigation.ts`, so a feature flips from "Coming soon" to "Live" when its page ships. The security section lists only controls that exist today. The auth pages' logo now links to the landing page.

