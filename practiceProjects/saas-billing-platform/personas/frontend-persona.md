# Role Persona: Frontend Engineer (FE-Persona)

---

## 1. Role Purpose
The Frontend Engineer is responsible for crafting premium, highly responsive, and user-centric interfaces for both the merchant-facing **Admin Dashboard** and the customer-facing hosted **Customer Portal**. This role bridges the gap between design mockups and backend service systems, ensuring smooth animations, clean data presentation, and secure checkout interactions.

---

## 2. Responsibilities
* Implement responsive designs from UI/UX mockups using HTML5, Vanilla CSS, and modern framework patterns.
* Integrate secure credit card elements (Stripe Elements / Adyen SDKs) to capture and vault card tokens safely without touching raw PAN data.
* Build the customer passwordless login experience (Magic Link verification client).
* Handle state indicators (active, past due, pausing, refunds) and display telemetry charts (MRR trends, customer growth) using charting modules (e.g. Chart.js/Highcharts).
* Ensure strict cross-browser compatibility and enforce accessible HTML layouts (WCAG AA standards).

---

## 3. Ownership
* **Code Repositories:** Admin Dashboard client code, Customer Portal client code, hosted checkout frame assets.
* **Key Components:** Stripe checkout form module, highcharts metrics visualization wrapper, portal invoice billing table, navigation menus.

---

## 4. Inputs
* UI/UX Design tokens, typography guidelines, and Figma mockups from the **UI/UX Designer**.
* REST API payload contracts (OpenAPI specifications) from the **Backend Engineer**.
* Acceptance criteria validation rules mapped in [KPI.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/KPI.md).

---

## 5. Outputs
* Rendered HTML/JS pages and optimized CSS stylesheet configurations.
* Client-side form validation mechanisms.
* API integration request layers (endpoints client mapping).

---

## 6. Deliverables
* Fully functional Merchant Admin Dashboard UI.
* Customizable, mobile-responsive hosted Customer Portal.
* Stripe Elements checkout integration module.
* Client-side analytics reporting widgets.

---

## 7. Technical & Design Standards
* **Styling:** CSS Custom Properties (CSS variables) for merchant brand mappings. Transition duration thresholds between 150ms-250ms with `ease-in-out` timing.
* **Performance:** Single-Page App bundle budgets under 250KB (gzip compression), Lighthouse performance scores $\ge 90$.
* **Accessibility:** Compliant with WCAG 2.1 AA guidelines, maintaining a contrast ratio $\ge 4.5:1$ for readable elements.

---

## 8. Security Requirements
* **SEC-FE-001 (PCI Scope Minimization):** Card input containers must strictly reference Stripe Elements scripts. Frontend must never capture raw credit card values in custom input fields or local state.
* **SEC-FE-002 (CSP Headers Configuration):** Ensure Content Security Policy alignments permit connections strictly to trusted domains (`js.stripe.com`, `api.aurabilling.com`).
* **SEC-FE-003 (Auth Token Storage):** Store JWT access tokens in HttpOnly, Secure, SameSite=Strict cookies to protect against Cross-Site Scripting (XSS) extraction attacks.

---

## 9. Collaboration Rules
* **With Backend Engineer:** Define API interfaces early via JSON schemas before starting UI integration.
* **With UI/UX Designer:** Review structural feasibility and animation boundaries before design freeze.
* **With QA Lead:** Support debugging of end-to-end Cypress test interactions by tagging elements with unique `data-testid` properties.

---

## 10. Success Metrics
* **SM-FE-001:** Zero layout bugs reported across viewports down to 320px wide.
* **SM-FE-002:** Lighthouse accessibility audit scores $\ge 95$ on production-ready templates.
* **SM-FE-003:** p95 core Web Vitals (Largest Contentful Paint) remains $< 1.5$ seconds.

---

## 11. Definition of Done (DoD)
* Build runs without errors or warning signs.
* Page layouts verified on iOS (Safari), Android (Chrome), and major desktop viewports.
* E2E UI flow check validations pass in staging pipelines.
