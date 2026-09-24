# MiNi Pay web app — project analysis

Analysis date: 24 September 2026. Scope: this repository, the sibling [mini-payment-server](https://github.com/maheshpcse/mini-payment-server) and the supplied master prompts (frontend, backend, full-stack). Source-based assessment, not a production certification.

## Starting point

The repository held only a one-line README: no framework, components, styles or docs to preserve. The master prompt's preferred stack (React + Vite + TypeScript) was therefore adopted (ADR-001).

## Inputs and how they are applied

| Input | Application |
| --- | --- |
| Frontend master prompt §1–§45 | Requirements source → [PRD](PRD.md) and bounded tasks in [TASKS.md](../TASKS.md) |
| [miniHrmsUI](https://github.com/maheshpcse/miniHrmsUI) | Borrow the documentation-first discipline (RULES, TASKS with evidence, analysis, dated MEMORY). Its legacy Angular runtime and styles are **not** reused. |
| Backend modular monolith decision | The UI talks to one versioned API (`/api/v1`) and one Socket.IO endpoint; no per-service clients. |
| §45 delivery strategy | This session: Foundation + Design System v1 only, with a working build. |

## Current state (evidence-based)

| Area | State | Evidence |
| --- | --- | --- |
| Tooling (Vite 8, React 19, TS 6.0 strict, ESLint, Vitest) | Implemented | `package.json`, `npm run check` |
| API client | Implemented | `src/api/client.ts`, `src/api/client.test.ts` |
| Theme system (light/dark/system, no flash) | Implemented | `src/core/theme`, `index.html`, tests |
| Floating shell (island, sidebar, dock, mobile bar/drawer) | Implemented | `src/layouts/app-shell`, `src/app/app.test.tsx` |
| Design system v1 | Implemented | `src/shared/ui`, `src/styles/tokens.css`, design-system page |
| Live API readiness | Implemented | `src/features/system-status` |
| All payment features, auth, real-time, 3D, cursor, Developer Lab content | **Not implemented** | TASKS FE-003+ |

## Requirement interpretation and unknowns

| Topic | Interpretation | Open question |
| --- | --- | --- |
| Styling approach | CSS Modules + custom properties instead of Tailwind to avoid a template look and keep tokens authoritative (ADR-003) | — |
| Motion libraries | None yet; CSS transitions suffice for the shell. GSAP/Framer Motion/Lenis are evaluated per task (FE-019/FE-020) | — |
| 3D character | Original stylized assistant, lazy-loaded, only on specific screens | Art direction and asset budget; who produces the GLB model? |
| Camera QR scanning | Use `BarcodeDetector` where available, fallback library otherwise | Target browsers |
| Offline support | Offline page + detection; no offline payments | PWA install desired? |
| Currency | INR display with Indian digit grouping | Multi-currency? |

## Risks

| Risk | Mitigation |
| --- | --- |
| "Premium" requirements push heavy dependencies (3D, motion, smooth scroll) | Budgets and lazy chunks (FE-019, FE-023); DECISIONS entry per library |
| UI mistaken for a real payment product | Persistent sandbox labelling; no fabricated data |
| Frontend drifting from backend contracts | Contracts owned by backend API_CONTRACTS/OpenAPI; FE tasks list BE dependencies |
| Accessibility regressions from custom controls | Primitives tested for roles/labels; axe automation (FE-022) |
| New majors (React Router 8, Vite 8, Vitest 5) | Lockfile; TypeScript held at 6.0.x for typescript-eslint (ADR-002) |

## Ownership roles

Product owner: scope and copy. Frontend maintainer: design fidelity, accessibility, browser evidence. Backend maintainer: API contracts. Release maintainer: CI and hosting. Roles, not named people.
