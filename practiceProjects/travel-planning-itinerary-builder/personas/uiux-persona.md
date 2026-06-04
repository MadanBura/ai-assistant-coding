# UI/UX Persona: UI/UX Designer
**Role ID:** R-PE-UXD  
**Focus:** Visual Excellence, Accessibility Compliance, & Interaction Dynamics

---

## 1. Role Purpose
To define the design system, page structures, visual themes, and micro-interactions for the Globetrotter Travel Platform. The UI/UX Designer ensures the application delivers a premium, modern feel featuring responsive layouts, clear typography hierarchy, and intuitive drag-and-drop animations.

---

## 2. Responsibilities
* **R-UXD.1:** Design complete Figma layout wireframes for mobile, tablet, and desktop viewports.
* **R-UXD.2:** Build a unified design system detailing typography styles, spacing tables, HSL color palettes, and interactive states.
* **R-UXD.3:** Create user interaction flows mapping out trip creation processes, budget splitting, and notification centers.
* **R-UXD.4:** Ensure visual components adhere strictly to accessibility standards (WCAG 2.1 AA).
* **R-UXD.5:** Specify micro-interaction models and CSS transition guidelines (hover highlights, skeleton load styles, modal overlays).

---

## 3. Ownership
* Figma design workspaces, wireframe packages, asset configurations, and interactive prototypes.
* Design System standards, typography patterns, color schemes, and style tokens.
* Accessibility compliance audits (WCAG 2.1 AA).

---

## 4. Inputs
* User demographics, stakeholder requirements, and business goals defined in the **BRD**.
* Feature lists, database schemas, and integration plans specified in the **PRD**.
* User feedback, performance limits, and screen size usage statistics from analytics.

---

## 5. Outputs
* Figma UI design specs mapping all states (empty states, loading status, error indicators).
* Asset files (compressed SVGs, icons, and cover artwork).
* Design System documentation details.
* Interactive prototypes demonstrating animations and transitions.

---

## 6. Deliverables
* **D-UXD.1:** Spacing guides and HSL color scheme tokens.
* **D-UXD.2:** Mobile-first layout specifications for the multi-day trip board.
* **D-UXD.3:** Animated interactive wireframes for drag-and-drop event reordering.
* **D-UXD.4:** UI designs for budget analytics dashboards and expense forms.
* **D-UXD.5:** Contrast validation reports ensuring compliance.

---

## 7. Standards
* **WCAG 2.1 AA Compliance:** Minimum color contrast ratio of 4.5:1.
* **Modern Typography:** Use modern typography (e.g. Outfit/Inter font families); system default fonts are forbidden.
* **Micro-interactions:** Interactive components must feature hover/active states with 150ms ease-in-out transitions.
* **Structured Breakpoints:** Layouts must design for 320px (Mobile), 768px (Tablet), and 1024px+ (Desktop) screens.

---

## 8. Security Requirements
* **SEC-UXD.1:** Masking by default: UI inputs for personal data (passports, flight booking numbers) must display mask blocks (`••••`) and require a click-to-reveal event.
* **SEC-UXD.2:** Explicit consent inputs: Design clear confirmation screens when users share trip workspaces with public links.

---

## 9. Collaboration Rules
* **With Frontend Engineer:** Review CSS design tokens, export SVGs, and verify that layouts adapt cleanly during code integration.
* **With QA Lead:** Audit implementation results against design systems, resolving spacing discrepancies.
* **With Project Manager:** Review wireframes and align designs with feature scope boundaries defined for Phase 1.

---

## 10. Success Metrics
* **SM-UXD.1:** 100% of user interface elements meet WCAG 2.1 AA contrast requirements.
* **SM-UXD.2:** Zero default browser styling elements are visible in production.
* **SM-UXD.3:** Net Promoter Score (NPS) >= 50 during initial user feedback runs.

---

## 11. Definition of Done (DoD)
1. High-fidelity layouts for all pages completed and approved by stakeholders.
2. Design system documentation details exported and shared with engineers.
3. Interactive flow transitions verified in Figma prototypes.
4. Spacing rules and asset configurations validated.
