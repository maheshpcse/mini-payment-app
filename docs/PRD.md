# MiNi Pay web app — product requirements

Source: frontend master prompt (24 Sep 2026). Status reflects source code.

## Product statement

A premium, highly interactive **sandbox** payment web app with an original visual identity: futuristic and calm rather than an admin dashboard. It demonstrates modern payment UX (fast send/request/scan, clear money hierarchy, continuous feedback, perceived security) without real money movement. Real providers can later be connected only through backend adapters.

## Users

| User | Needs |
| --- | --- |
| Consumer | Send, request, scan and pay quickly; see balance and history clearly; trust what is happening |
| Learner / developer | Explore the architecture in a separate Developer & Architecture Lab |

## Requirements

| ID | Requirement | Task | Status |
| --- | --- | --- | --- |
| U-01 | Original identity: tokens, typography, iconography, island geometry; light/dark/system themes | FE-002 | Implemented (v1) |
| U-02 | Floating nav island (brand, search, quick pay, notifications, balance shortcut, avatar) | FE-001 | Implemented; search and balance activate with FE-007/FE-006 |
| U-03 | Floating sidebar not touching island/top/dock; collapse; icon-only; left/right | FE-001 | Implemented |
| U-04 | No footer; floating utility dock; mobile bottom navigation | FE-001 | Implemented |
| U-05 | Separate Developer & Architecture Lab navigation | FE-001, FE-016, FE-017 | Navigation implemented; content planned |
| U-06 | Authentication pages and protected routes | FE-004 | Planned |
| U-07 | Dashboard with balance, quick actions, recent activity, bills, rewards, insights, alerts | FE-006 | Planned (sandbox-labelled home exists) |
| U-08 | Quick payment flow ending in receipt | FE-008 | Planned |
| U-09 | QR generate/scan/upload/camera/merchant simulation | FE-010 | Planned |
| U-10 | Send money via phone, username, payment ID, QR, contact, beneficiary, recent, favorites | FE-007, FE-008 | Planned |
| U-11 | Request money with expiry, share, status, cancel, remind | FE-024 | Planned |
| U-12 | Contacts, people-first | FE-007 | Planned |
| U-13 | Transaction timeline, filters, detail | FE-009 | Planned |
| U-14 | Real-time state transitions via Socket.IO | FE-011 | Planned |
| U-15 | Bills, recharge, rewards, analytics, security center, settings | FE-012–FE-015 | Planned |
| U-16 | Custom cursor (desktop only, reduced-motion aware) | FE-018 | Planned |
| U-17 | Selective 3D: digital assistant and payment objects with fallbacks | FE-019 | Planned |
| U-18 | Smooth scroll/transitions without scroll-jacking | FE-020 | Route transition implemented; rest planned |
| U-19 | Original error pages (404, 403, 500, offline, maintenance, API unavailable, payment failed, session expired) | FE-001, FE-021 | 404 + error boundary implemented |
| U-20 | Skeletons/progressive loading; never blank screens | FE-003 | Planned |
| U-21 | Centralized API client | FE-001 | Implemented |
| U-22 | Accessibility (WCAG-aware contrast, keyboard, focus, ARIA, reduced motion) | all | Foundations implemented; automation FE-022 |
| U-23 | Responsive from 320 px to large desktop | all | Shell implemented |

## Non-goals

Real payments, card data entry (future card flows would use provider-hosted fields), copying Google Pay/PhonePe/Apple/Android/BMW visuals or trademarks, client-side authorization.

## M1 acceptance

See TASKS.md: a user completes register/login → dashboard → pay a recipient → sees simulated processing → backend update → success → transaction in history → notification, verified by Playwright against the live sandbox stack.
