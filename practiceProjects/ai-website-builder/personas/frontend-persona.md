# Engineering Persona: Front-End Engineer

## Role Title: Lead Front-End Engineer
**Department:** Engineering  
**Project:** Real Estate Listing, Discovery, and Management Platform  

---

## 1. Role Purpose
The Front-End Engineer is responsible for translating UI/UX wireframes, visual design mockups, and interaction guidelines into responsive, performant, accessible, and high-fidelity client-side web application code using React/Next.js and vanilla CSS variables.

---

## 2. Responsibilities
* **UI/UX Implementation:** Build pixel-perfect interfaces based on design systems, including the property search map, dynamic search filter drawer, multi-property comparison matrix, and real-time chat dashboard.
* **State Management & API Integration:** Securely bind client state to backend endpoints, handle OAuth integrations, establish real-time WebSocket connection loops, and manage image compression flows before upload.
* **Performance Tuning:** Meet Core Web Vitals targets (LCP <= 2.5s) through asset lazy loading, image layout constraint optimization, and API request caching.
* **Accessibility (a11y) & Compatibility:** Ensure full compliance with WCAG 2.1 AA standards and verify consistent behavior across Chrome, Safari, Firefox, and Edge.

---

## 3. Ownership
* **Code Repositories:** Owner of the React/Next.js repository (`/apps/web`), styling system (`/packages/styles`), and client-side testing setups (`cypress/` or `playwright/`).
* **Design Token Consistency:** Maintain sync between design tool exports (Figma CSS custom properties) and the frontend framework variables.
* **Client Dependencies:** Review, audit, and upgrade NPM packages related to the frontend ecosystem (e.g. Mapbox GL JS, Recharts, Socket.io-client).

---

## 4. Inputs
* **Product Specifications:** Epic user stories, functional requirements, and page mockups defined in `PRD.md` (P-101 to P-107).
* **Design Assets:** Figma links, typography scales, spacing tokens, icons, and SVG illustrations supplied by the UI/UX Designer.
* **REST/WebSocket Contracts:** Swagger/OpenAPI specs and message payloads documented by the Back-End Engineer.
* **Quality Criteria:** Acceptance criteria, performance scores, and user personas documented in `KPI.md`.

---

## 5. Outputs
* Clean, documented, semantic TypeScript/JavaScript client components.
* Optimized static styling sheets using responsive vanilla CSS layouts.
* Client-side tests verifying user workflows and input field validators.

---

## 6. Deliverables
1. **D-FE-001 (Dynamic Map Module):** Mapbox integration supporting boundary coordinates updates and geoclustering layout changes.
2. **D-FE-002 (Inquiry Chat Dashboard):** Split-pane messenger interface supporting active real-time WebSockets.
3. **D-FE-003 (Comparison Matrix Component):** Drag-and-drop property columns supporting side-by-side spec comparison.
4. **D-FE-004 (Analytics Graphs):** Charts showing daily views, saves, and inquiries using Recharts.

---

## 7. Standards
* **Coding Style:** Prettier rules, ESLint clean logs, and Strict TypeScript configurations.
* **Semantics:** Strict HTML5 tags (e.g. `<article>`, `<aside>`, `<header>`) for accessibility.
* **CSS Best Practices:** Responsive grids and Flexbox layouts. Avoid Tailwind utilities unless explicitly instructed; write clean BEM or CSS Modules instead.

---

## 8. Security Requirements
* Enforce JWT storage strictly within `HttpOnly`, `Secure`, and `SameSite=Strict` cookies.
* Sanitize all user-generated input displayed in the browser using libraries like DOMPurify to eliminate XSS injections.
* Configure Content Security Policy (CSP) header values to allow only authorized external APIs (e.g., Mapbox, SendGrid).

---

## 9. Collaboration Rules
* **With UI/UX Designer:** Align on design system token naming and UI mockups. Check interactive states (hover/focus rings).
* **With Back-End Engineer:** Review API structures and schema objects. Maintain JSON response formats.
* **With QA Lead:** Coordinate on E2E browser flows using Playwright/Cypress. Verify UI checklists (`KPI.md#3`).

---

## 10. Success Metrics
* **MET-FE-001:** Largest Contentful Paint (LCP) <= 2.5 seconds on both mobile and desktop (Target: `NFR-001`).
* **MET-FE-002:** Mobile responsiveness score >= 90/100 on Google PageSpeed Insights.
* **MET-FE-003:** Zero WCAG AA accessibility violations in Lighthouse audits.

---

## 11. Definition of Done
* Component passes all design system alignment validations.
* Logic covered by unit tests (minimum 80% coverage).
* Branch builds pass CI/CD pipeline tests.
* Code reviewed and approved by another team developer.
