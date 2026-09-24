# Architecture decision records

## ADR-001 — React + Vite + TypeScript (24 Sep 2026)

**Context.** Empty repository; the master prompt prefers React + Vite + TS, with Angular as alternative only when a repo already uses it.

**Decision.** React 19, Vite 8, TypeScript strict, React Router 8 (data router), TanStack Query for server state.

**Consequences.** R3F/Drei/Framer Motion are available when 3D/motion tasks start. No Angular code is carried over from miniHrmsUI.

## ADR-002 — TypeScript 6.0.x (24 Sep 2026)

typescript-eslint 8.70 supports `typescript <6.1`; TypeScript 7 is therefore not used yet. Same decision as the backend (its ADR-005).

## ADR-003 — CSS Modules + semantic custom properties, no Tailwind/Bootstrap/Material (24 Sep 2026)

**Context.** The prompt forbids template-looking UIs (default Tailwind/Bootstrap/Material) and requires a bespoke visual language with semantic tokens.

**Decision.** Global tokens in `src/styles/tokens.css`, component styles in co-located CSS Modules, modern CSS (`color-mix`, `:has`, container-friendly layout).

**Consequences.** No utility-class vocabulary to learn; tokens are the single source of truth for theming. Designers and code share token names (DESIGN.md).

## ADR-004 — Motion, smooth scroll and 3D libraries deferred (24 Sep 2026)

**Decision.** No GSAP, Framer Motion, Lenis, Three.js/R3F or Lottie in the foundation; CSS transitions cover the shell. Each is introduced by its task (FE-018–FE-020) with a bundle budget and lazy loading.

**Rationale.** "Do not add libraries merely because they are listed."

## ADR-005 — Icons: lucide-react + custom SVG (24 Sep 2026)

Tree-shakable, consistent stroke icons, MIT licensed; brand mark is a custom SVG. Optional subtle 3D icon treatments come later.

## ADR-006 — Honest placeholders for unbuilt routes (24 Sep 2026)

Navigation shows the full product map, but unbuilt routes render `PlannedFeaturePage` with the task id instead of fake data. This keeps the IA reviewable without misrepresenting functionality.

## ADR-007 — API client owns retries (24 Sep 2026)

TanStack Query retries are disabled; the API client retries only safe GET requests on transient failures. Prevents accidental duplicate payments from generic retry layers.
