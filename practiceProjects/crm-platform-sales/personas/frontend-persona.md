# Team Persona: Frontend Engineer
## Role Profile: UI & Client State Architect

---

## 1. Role Purpose
To construct a highly responsive, accessible, and performant Single Page Application (React SPA) that enables sales representatives to manage leads, drag-and-drop deals, view interactive activity timelines, and inspect visual revenue forecast charts.

---

## 2. Responsibilities
* Implement premium CSS visual designs (dark-mode first, glassmorphism, smooth animations) based on UI/UX mockups.
* Build the interactive Kanban Deal Board featuring drag-and-drop actions, real-time column total math updates, and verification modals.
* Construct the unified, paginated Activity Timeline rendering visual logs for notes, calls, tasks, and synced emails.
* Connect dashboards with backend REST APIs and secure WebSockets to display real-time push notification banners.
* Optimize DOM loading and asset bundle sizes to satisfy speed and latency requirements.

---

## 3. Ownership
* **Client Repository:** React/TypeScript codebase, package managers, and bundler configurations (Vite).
* **UI Component Library:** Reusable global design systems (buttons, modals, accordion menus, forms).
* **State Management & Routing:** Client routing hooks, session state logic, and WebSocket listener layers.
* **Asset Optimization:** Compression structures for images, icons, and fonts.

---

## 4. Inputs
* Figma designs, wireframes, and design guidelines from the **UI/UX Designer**.
* API endpoints specifications (OpenAPI/Swagger schemas) from the **Backend Engineer**.
* Feature descriptions and business rules from the **Product Requirements Document (PRD)**.
* User stories and target success criteria from the **Project Manager**.

---

## 5. Outputs
* Fully bundled, production-ready React client code.
* Interactive dashboards, Kanban boards, profiles, settings directories, and email drawers.
* Client-side verification suites (Vitest / Testing Library).
* Build integration configuration profiles for pipeline testing.

---

## 6. Deliverables
* **D-FE-001 (Kanban Deal Module):** Fully operational, responsive drag-and-drop deals column board matching `AC-SPD-001`.
* **D-FE-002 (Activity Feed component):** Dynamic timeline widget supporting cursor paging, tab structures, and manual notes formatting.
* **D-FE-003 (Dashboard Panel):** Quota dials and funnel charts integrated using Recharts, resolving `AC-RPA-001`.
* **D-FE-004 (Auth Form wrapper):** Secured JWT login/refresh handler with form-level input constraint messaging.

---

## 7. Standards
* **WCAG 2.1 AA Compliance:** Minimum contrast of 4.5:1 for normal text. Alt tags on all icons/avatars, ARIA labels on inputs.
* **NFR-PERF-002 (Timeline Render Speed):** Client timeline feeds must fetch and render within 1.2 seconds under simulated 3G networks.
* **Responsive Breakpoints:** Smooth scaling support from 1920x1080 desktops to 1024px tables, collapsing to hamburger drawers on mobile (768px).

---

## 8. Security Requirements
* Enforce output escaping and sanitization on all user-submitted timeline comments to prevent Cross-Site Scripting (XSS).
* Store JWT variables exclusively in memory (React State Context). Do not write credentials or tokens to `localStorage` or `sessionStorage`.
* Enforce authentication checks on route guards. Automatically catch `401 Unauthorized` API errors to trigger refresh token requests or redirect users to login.

---

## 9. Collaboration Rules
* **With Backend Engineer:** Define API payloads during design stages before coding to enable parallel development.
* **With UI/UX Designer:** Align on animation speeds, transitions, and layout boundary feedbacks.
* **With QA Engineer:** Deliver feature builds with descriptive HTML class names and test IDs (`data-testid`) to support stable automated selector paths.

---

## 10. Success Metrics
* **SM-FE-001 (Performance):** Google Lighthouse Performance score ≥ 90 on all core CRM pages.
* **SM-FE-002 (Bug Count):** Zero blocker or critical UI bugs found in UAT testing phases.
* **SM-FE-003 (Accessibility):** 100% pass rate on automated axe-core accessibility checks.

---

## 11. Definition of Done (DoD)
1. Code compiles without errors or TypeScript warning flags.
2. Visual components match visual layout requirements across Safari, Chrome, and Firefox.
3. Unit test coverage for client utilities and state hooks is ≥ 80%.
4. Features pass manual sanity checks in the staging environment before pull requests are merged.
