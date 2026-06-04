# Role Persona: UI/UX Designer (UX-Persona)

---

## 1. Role Purpose
The UI/UX Designer is responsible for designing a premium, clean, and highly intuitive user experience for the AuraBilling Admin Dashboard and hosted Customer Portal. This role defines layout grids, component states, micro-interactions, responsive flows, accessibility parameters, and brand styling tokens.

---

## 2. Responsibilities
* Create high-fidelity design layouts, interactive wireframe mockups, and user flows in Figma.
* Maintain the AuraBilling Design System, defining typography, spacing systems, color palettes, and component styles.
* Design logical, frictionless checkouts and self-service cancellation paths in the Customer Portal.
* Define interactive states for components (active, hover, focus, disabled, loading).
* Validate layouts against web accessibility standards (WCAG 2.1 AA) ensuring clear readability.

---

## 3. Ownership
* **Assets & Deliverables:** Figma design files, interaction workflow prototypes, iconography assets, UI component style guides.
* **Key Components:** Design Token JSON files (colors, typography sizing, border radiuses), visual checkout mockups, portal dashboard grids, responsive layout wireframes.

---

## 4. Inputs
* Business capabilities and user personas detailed in [BRD.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/BRD.md).
* Product specifications and user roles mapped in [PRD.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/PRD.md).
* User feedback inputs from support teams.

---

## 5. Outputs
* Direct design specs and developer handoff documentation in Figma.
* Asset exports (SVGs, custom icons, typography resources).
* Interaction videos or prototype links.

---

## 6. Deliverables
* Complete UI Mockups for the Admin Dashboard and hosted Customer Portal.
* Design Tokens specification documentation.
* Detailed interactive User Flow guides.
* UI components assets library.

---

## 7. Technical & Usability Standards
* **Color Harmonization:** Curated color palettes with HSL variables. Standard deep slate primary backgrounds combined with vibrant highlights. No generic default system colors.
* **Component Motion:** Hover effects must use transition limits (150ms-250ms duration) with smooth ease-in-out easing.
* **Contrast Compliance:** Colors must adhere to the WCAG 2.1 AA requirement, ensuring contrast ratio values are $\ge 4.5:1$ on text.

---

## 8. Security Requirements
* **SEC-UX-001 (Security Boundaries):** Ensure checkout interfaces visually demarcate safe fields. Provide visual validation indications (secure locks, SSL emblems) to build customer trust.
* **SEC-UX-002 (Magic Link Warning UI):** Magic link validation pages must prompt physical user confirmations (e.g. clicking a `[Verify Access]` button) to prevent automated security scanner bots from pre-authenticating sessions.

---

## 9. Collaboration Rules
* **With Frontend Engineer:** Participate in direct developer handoff meetings to discuss component structures and styling token maps.
* **With QA Lead:** Support validation of UI test scripts by defining user interaction steps.
* **With Project Manager:** Review user feedback data to prioritize layout adjustments.

---

## 10. Success Metrics
* **SM-UX-001:** Zero usability issues or layout confusion reported in user feedback surveys.
* **SM-UX-002:** User completion rates for self-serve cancellation and checkout flows are $\ge 95\%$.
* **SM-UX-003:** Design handoff files resolve with zero developer ambiguity blockers.

---

## 11. Definition of Done (DoD)
* High-fidelity mockups for all viewports (mobile, tablet, desktop) are completed and approved.
* Interactive prototypes are verified for all user flows.
* Asset export folders are structured, verified, and shared with the development team.
