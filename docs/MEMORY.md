# Project memory

Update after every work session: what changed, checks actually run, limits, next bounded task. Keep secrets, personal data and transcripts out.

## Standing preferences

- Sandbox/demo only; never present simulated money as real.
- Original identity; no copying of other payment apps' UI or trademarks.
- Documentation-first with evidence-based task closure (miniHrmsUI discipline, not its Angular runtime).
- Backend is a modular monolith (`mini-payment-server`); the app talks to one `/api/v1` API. Dev origins: app `http://localhost:5173`, API `http://localhost:4000`.
- Add motion/3D/cursor libraries only through their tasks with budgets.

## 24 September 2026 — Foundation and design system v1

**Done:** FE-001 (tooling, API client, theme, floating shell, routing, 404/error boundary, live API status, CI file) and FE-002 (tokens, typography, Button, StatusPill, AmountDisplay, TextField, Island, BrandMark, design-system page). Full documentation set created.

**Checks run:** `npm run check` → lint, typecheck, 42 tests, production build passing. Browser walkthrough against the live backend (MongoDB 8.2.6 replica set + Redis 7.0.15): light and dark home, API online indicator, sidebar collapse and right-side docking, planned Pay page, design-system page (floating labels, loading button), 404, mobile 390 px with bottom bar and drawer (Esc closes).

**Fixed after review:** sidebar showed a horizontal scrollbar and clipped "Soon" tags on long Lab labels (missing `min-width: 0` on the flex label); decorative orb overlapped the sandbox-wallet copy.

**Not verified:** CI run (FE-025); Playwright/axe automation; Safari/Firefox.

**Next bounded task:** FE-003 (design system v2: dialog, toast, OTP/PIN/amount inputs). Auth UI (FE-004) waits for backend BE-004.
