# MiNi Pay web app — development rules

These rules apply to every human or AI contributor. Current explicit user instructions take precedence. Reading this file does not authorize executing the backlog.

## Before changing code

1. Read [docs/PROJECT_ANALYSIS.md](docs/PROJECT_ANALYSIS.md), this file, [docs/DESIGN.md](docs/DESIGN.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and the source/tests you will touch.
2. Distinguish **implemented** behavior (source + passing test), **requested** behavior (PRD/TASKS) and **unknowns**. Never present planned features as working.
3. Pick one bounded task from [TASKS.md](TASKS.md); identify the backend contract it depends on ([mini-payment-server API_CONTRACTS](https://github.com/maheshpcse/mini-payment-server/blob/main/docs/API_CONTRACTS.md)). Do not invent endpoints.

## Structure and reuse

4. Feature code lives in `src/features/<feature>/`; shared primitives in `src/shared/ui`; shell in `src/layouts`. No giant `components/` folder.
5. Search `src/shared` before creating a component. Extend a primitive rather than cloning it.
6. Do not add a dependency for something the platform or a small local abstraction handles. New libraries need a task and a DECISIONS entry (bundle cost, maintenance, accessibility).
7. Keep state separated: server state (TanStack Query), auth state, UI state, payment draft state, notification state, 3D state. No single global store.

## Design and accessibility

8. Use semantic tokens from `src/styles/tokens.css`; no raw hex in components (brand SVG excepted).
9. Every interactive element has idle, hover, focus-visible, pressed, disabled and (where relevant) loading, success, failure states.
10. Keyboard access, visible focus, accessible names, labelled forms, `aria-live` for async status. Information never relies on color or animation alone.
11. Respect `prefers-reduced-motion`. 3D and heavy motion are optional enhancements with static fallbacks.
12. Keep the visual identity original. Never copy another payment app's UI, logos, illustrations or layouts; no BMW or other trademarks.

## Money and security

13. The UI is not a security boundary. Authorization, amounts, fees, balances and statuses come from the backend.
14. Amounts travel as integer minor units; display with `formatAmountParts`/`AmountDisplay`. No float arithmetic on money.
15. Never put secrets in client code or `VITE_*` variables. Never log tokens, PINs, OTPs or passwords (including in tests and error reporting).
16. Money-moving requests send an `Idempotency-Key` generated once per user intent and are never auto-retried by the client.
17. Label sandbox mode clearly. Never show fabricated balances, transactions or success states as real.
18. Use synthetic fixtures only.

## Delivery

19. Keep changes scoped; one logical change per commit; keep the build green after each stage.
20. Run `npm run check` (and E2E once it exists) and report actual results, including failures and what was not run.
21. Update DESIGN/ARCHITECTURE/TEST_PLAN/MEMORY when behavior changes. Close tasks in TASKS.md only with verification evidence.
22. Do not commit, push or deploy unless the user or the operating environment explicitly instructs it.
