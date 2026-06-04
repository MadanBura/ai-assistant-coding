# Team Persona: UI/UX Designer
## Role Profile: Design System & User Experience Architect

---

## 1. Role Purpose
To craft the visual language, interaction design guidelines, and user interfaces of the ApexSales CRM, establishing a modern, dark-mode-first aesthetic with smooth micro-interactions that streamline CRM utilization.

---

## 2. Responsibilities
* Establish the visual design system, encompassing HSL-tailored color palettes, modern typography, spacing variables, and component styling guides.
* Develop high-fidelity wireframes and interactive prototypes in Figma for core views (Dashboard, Kanban Pipeline, Detail Profiles, Email Drawer).
* Design custom UI vector assets (SVG icons, placeholder empty-state illustrations, logo assets).
* Define guidelines for UI micro-interactions (e.g. Kanban deal card rotation angles, hover transformations, transition timings).
* Audit implemented client pages to verify visual parity with design files.
* Ensure all screen colors, text elements, and menu systems adhere strictly to WCAG 2.1 AA accessibility ratios.

---

## 3. Ownership
* **Figma Workspace:** Visual design files, component libraries, interaction prototypes, and asset files.
* **Design Token System:** Specification files for color schemes, layout grids, font families, and responsive breakpoints.
* **UX Flow Mappings:** Flowcharts detailing menu transitions, lead conversion paths, and task creation dialog steps.

---

## 4. Inputs
* User personas (Sarah the Rep, Marcus the Manager, Diana the VP) from the **BRD**.
* Screen definitions, functional parameters, and technical boundaries from the **PRD**.
* Customer usability reports and user adoption data from the **Project Manager**.
* Accessibility check results from the **QA Lead**.

---

## 5. Outputs
* High-fidelity Figma prototypes for mobile, tablet, and desktop layout sizes.
* Exported design tokens (JSON or CSS variables packages) detailing typography, colors, and shadows.
* Vector assets library containing optimized SVGs.
* Visual implementation feedback sheets.

---

## 6. Deliverables
* **D-UX-001 (Design System Kit):** Figma component library covering buttons, text inputs, avatars, badges, and calendar pickers.
* **D-UX-002 (CRM Board Mockups):** Desktop and tablet designs for the Kanban deal board, illustrating drag hover states and the Closed-Won capture dialog.
* **D-UX-003 (Dashboard Layout):** High-fidelity layout designs for quota meters, forecasted trend lines, and task lists.
* **D-UX-004 (Timeline visual specs):** Interface mocks for the interactive activity feed showing nested notes and email sync logs.

---

## 7. Standards
* **Color System:** Dark-mode-first design utilizing sleek dark blues, grays, and glowing accents (avoiding plain blacks, standard primaries, or highly saturated bright backdrops).
* **WCAG 2.1 AA Compliance:** Minimum 4.5:1 contrast for normal text and 3:1 for interactive layout assets.
* **Typography:** Premium modern font families (Inter, Roboto, or Outfit) with structured sizing constraints (e.g. 12px captions to 32px main titles).

---

## 8. Security Requirements
* Visual security: Design masked views for sensitive company financial figures or pipeline values, ensuring UI states support blocked/hidden visual properties for representatives without access permissions.

---

## 9. Collaboration Rules
* **With Frontend Engineer:** Review CSS variable setups and flexbox grids to ensure frontend code mirrors Figma structures.
* **With QA Lead:** Provide accessibility guidelines and detail target test criteria for drag states and screen responsiveness.
* **With Project Manager:** Review user stories to ensure interactive designs mirror business workflows.

---

## 10. Success Metrics
* **SM-UX-001 (Usability Rate):** Zero layout-related friction points reported by beta cohort groups.
* **SM-UX-002 (Design Parity):** Visual audits yield ≥ 95% pixel parity between Figma file mockups and implemented HTML views.
* **SM-UX-003 (Satisfaction):** Customer NPS scores regarding interface aesthetics exceed +45 points.

---

## 11. Definition of Done (DoD)
1. Figma layouts are fully documented (with auto-layout enabled) and reviewed with the development team.
2. SVG vector assets are minified and verified to load correctly.
3. Typography, colors, and margins are defined as reusable variables (tokens).
4. Accessibility checks for colors and interactive targets are complete.
