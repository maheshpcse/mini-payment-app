# MiNi Pay — design system

The identity is original. It takes usability principles (simplicity, fast actions, clear amounts) from consumer payment apps but copies none of their layouts, logos, illustrations or colors. BMW-inspired blues/white/black influence accents only; no trademarks are used.

## Principles

Simplicity · consistency · visual hierarchy · continuous feedback · accessibility · progressive disclosure · responsive · clear financial information · perceived security · performance · low cognitive load.

## Color

Source palettes: primary (`#1400C3`, `#F8F2D8`, `#FF4E02`, `#BA0001`, `#E8ECD1`) and high-contrast tech (`#0984E3`, `#1E272E`, `#00CEC9`, `#F5F6FA`). Components use semantic tokens only (`src/styles/tokens.css`).

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--payment-primary` | `#1400C3` ultramarine | `#9D95FF` | links, active nav, focus accents |
| `--button-primary-bg` | `#1400C3` | `#4436FF` | primary buttons (white text ≥ 6:1) |
| `--payment-secondary` | `#0873C4` | `#4FB0FF` | secondary accents |
| `--payment-accent` / `-ink` | `#FF4E02` / `#A33100` | `#FF7A3D` / `#FFA072` | signal orange: quick pay, active marker; `-ink` for text |
| `--payment-danger` | `#BA0001` | `#FF6B6B` | failures, destructive actions |
| `--payment-success` | `#00775F` | `#3EE0C0` | success (teal derived from `#00CEC9`, darkened for AA on light) |
| `--payment-warning` | `#9A5200` | `#FFBF5E` | degraded, pending |
| `--surface-canvas` | `#F3F0E4` warm paper | `#0D1116` graphite | page background (+ soft radial glows) |
| `--surface-primary/elevated/sunken` | `#FBF9F1` / `#FFF` / `#E8ECD1` | `#131A21` / `#1E272E` / `#090C10` | layered surfaces |
| `--text-primary/secondary/muted` | `#14161F` / `#474C5B` / `#5B6070` | `#F5F6FA` / `#BCC2CE` / `#9097A6` | text hierarchy |

Rules: orange `#FF4E02` is never used for small text on light surfaces (contrast ≈ 3:1) — use `--payment-accent-ink`. Status always pairs color with a text label. Contrast values are design targets; automated verification is FE-022.

Gradients: `--gradient-signature` (ultramarine → blue → cyan) for brand moments; `--gradient-ember` (orange → red) for the quick-pay CTA and active markers.

## Typography

| Role | Face | Treatment |
| --- | --- | --- |
| Display / headings | Space Grotesk Variable | 600, tracking −0.02 to −0.035em |
| Financial amounts | Space Grotesk | tabular + lining numerals; small symbol; de-emphasized fraction; `--text-amount` fluid size |
| Body / navigation | Manrope Variable | 400–700; 1.55 line height |
| Metadata | Manrope italic, muted | timestamps, supporting info |
| Transaction IDs / technical | JetBrains Mono Variable | `.mono` utility |

Hover never uses underline; links change color.

## Geometry and surfaces

- **Island shape:** `--radius-island: 28px 28px 28px 10px` (one tight corner) and its mirror `--radius-island-alt`. Used for cards, sidebar, icons and avatar.
- **Glass chrome:** nav island, sidebar, dock and mobile bar use `--surface-glass` + backdrop blur + `--shadow-floating`.
- **Signature card:** gradient hairline border via masked pseudo-element (`Island tone="signature"`).

## Shell layout

| Element | Rule |
| --- | --- |
| Nav island | Fixed, centered capsule, max 1180 px, 16 px from top; never full width |
| Sidebar | Fixed; top = 2 × gutter + island height; bottom = 2 × gutter + dock height; so it never touches island, top edge or dock. Expanded 252 px, collapsed 84 px (icon-only with accessible names). Can dock right. |
| Utility dock | Fixed centered capsule at bottom: sandbox notice, API status, environment, version, privacy/docs/support |
| ≤ 1100 px | Search and balance collapse to icons; dock links hidden |
| ≤ 767 px | Sidebar becomes a drawer (Esc closes, focus moves to close button); dock replaced by bottom bar with raised Scan action |

## Component states

Every interactive primitive defines idle, hover, focus-visible (3 px ring), pressed (scale 0.97), disabled, and where relevant loading (`aria-busy`, spinner, announced label), valid, invalid (`aria-invalid` + linked message), success/failure via `StatusPill`.

## Motion

Tokens: `--ease-out` (expo-like), `--ease-spring`, durations 140/240/420 ms. Route content fades/slides in. `prefers-reduced-motion` collapses all durations. Custom cursor, smooth scroll and 3D are planned enhancements with static fallbacks (FE-018–FE-020).

## Iconography

Lucide SVG icons (consistent 1.5–2 px strokes) plus custom SVG for the brand mark. Icons are decorative (`aria-hidden`) when paired with text; icon-only controls have accessible names.

## Accessibility checklist (per change)

Keyboard reachable in logical order · visible focus · accessible names · labelled inputs with linked hints/errors · `aria-live` for async status · no color-only information · reduced-motion respected · touch targets ≥ 40 px.
