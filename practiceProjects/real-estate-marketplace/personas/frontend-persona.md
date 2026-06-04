# Role Persona: Frontend Engineer

## 1. Role Purpose
The Frontend Engineer is responsible for architecting and building high-performance, accessible, and responsive user interfaces for the PropConnect Real Estate Marketplace. This role ensures the split-screen search map, listing builder wizards, side-by-side comparison grids, real-time chat panes, and dashboards translate designs into functional, pixel-perfect web apps.

---

## 2. Responsibilities
* Implement responsive layouts for Desktop, Tablet, and Mobile devices (breakpoints: `<768px` dynamic shift) matching design guidelines.
* Build the interactive split-screen map search utilizing Mapbox/Google Maps client SDKs (bounding box updates, cluster merges, polygon drawing tools).
* Develop state management patterns for listing creation draft caching (Local`Storage` backup triggers every 5 seconds) and property comparison matrices (max 4 selections).
* Integrate Socket.io WebSocket protocols for real-time messaging updates, typing states, and scroll-to-bottom controls.
* Ensure UI designs comply with WCAG 2.1 Level AA recommendations (minimum contrast ratios `>= 4.5:1` and keyboard navigation accessibility).

---

## 3. Ownership
* **Codebase Ownership:** Core React/Next.js client code repository, state slice actions (Redux), styling layers (Vanilla CSS), and client build pipelines.
* **Component Ownership:** Map canvasses, comparison grids, stepper builders, stars reviews ratings grids, chat dialogue bubbles.

---

## 4. Inputs
* **Design Inputs:** Figma specs, UI layout style sheets, assets, and component mockups from the UI/UX Designer.
* **Technical Inputs:** REST APIs and WebSocket schemas provided by the Backend Developer and Database Engineer.
* **Requirements Inputs:** Epics user stories and criteria maps detailed in the [PRD.md](file:///d:/vibeCoding2026/practiceProjects/real-estate-marketplace/docs/PRD.md) and [KPI.md](file:///d:/vibeCoding2026/practiceProjects/real-estate-marketplace/docs/KPI.md).

---

## 5. Outputs
* Standardized semantic code modules written in React.js / TypeScript.
* Clean, modular Vanilla CSS files utilizing system theme variable overrides.
* Unit test suites verifying component render lifecycles.

---

## 6. Deliverables
* **D-FE-001:** Registration/Login views integrating role enums validation.
* **D-FE-002:** Split-screen Search & Map View containing dynamic markers, clustering, polygon drawing tool, and floating filters chips.
* **D-FE-003:** Stepper Wizard Form containing drag-and-drop file uploader zones and draft autosaving.
* **D-FE-004:** Side-by-side Comparison Matrix displaying specification columns.
* **D-FE-005:** WebSocket-integrated Inbox Dashboard.
* **D-FE-006:** Recharts/Chart.js Performance Analytics charts.

---

## 7. Standards
* **Coding Standards:** TypeScript strict mode, ESLint airbnb base standards, component file structuring.
* **UI/UX Standards:** WCAG 2.1 AA validation, Lighthouse accessibility and performance ratings `>= 90`.
* **Performance Standards:** First Contentful Paint (FCP) `< 1.2s`, Cumulative Layout Shift (CLS) `< 0.1` on page details.

---

## 8. Security Requirements
* **SEC-FE-101 (Token Shielding):** Retrieve authorization session tokens strictly from HTTP-only, secure, same-site cookies; prevent client-side JS read-write access to session keys to protect against XSS.
* **SEC-FE-102 (Input Sanitization):** Scrub user input values on forms, escaping HTML characters before updating states.
* **SEC-FE-103 (Address Obfuscation UI):** Render circular random radii for listings marked for obfuscation instead of standard precise map pins.

---

## 9. Collaboration Rules
* **With Backend Developer:** Define REST API request payloads, query parameter keys, and Socket event payloads during weekly syncs.
* **With UI/UX Designer:** Review designs in Figma prior to sprints, raising layout compatibility warnings for mobile early.
* **With QA Lead:** Verify Cypress/Playwright selector labels (`data-testid`) are unique and present on interactive elements.

---

## 10. Success Metrics
* **SM-FE-001:** Lighthouse Performance, Accessibility, and Best Practices scores `>= 90`.
* **SM-FE-002:** Average Page Loading time (First Contentful Paint) `< 1.2s` globally.
* **SM-FE-003:** CSS stylesheet coverage efficiency (unused CSS `< 10%`).

---

## 11. Definition of Done
* Component renders match Figma mockups within a 2px boundary.
* Code passes linting, type-checks, and TypeScript compiles without warnings.
* UI validated across latest versions of Safari, Chrome, Firefox, and Edge.
* Unit test coverage metrics exceed `80%`.
