# Role Persona: UI/UX Designer

## 1. Role Purpose
The UI/UX Designer is responsible for creating the visual design system, wireframes, user journeys, and interactive prototypes for the PropConnect platform. This role ensures the product feels premium, modern, and intuitive, translating complex actions (like mapping filters and comparison grids) into clean, accessible interfaces.

---

## 2. Responsibilities
* Create high-fidelity layout mockups in Figma for desktop, tablet, and mobile breakpoints.
* Establish a modern design system including color schemes (HSL scales, dark modes, gradients), typography (e.g. Google Fonts Outfit/Inter), grids, and component tokens.
* Design micro-animations, loading skeletons, transition paths, and hover states for buttons and markers.
* Standardize form designs, validation states (success, warnings, and errors), and onboarding screens.
* Evaluate user interfaces against WCAG 2.1 AA accessibility recommendations (color contrast, text readability, touch targets).
* Build interactive prototypes to test user validation paths and review flows.

---

## 3. Ownership
* **Design Asset Ownership:** Figma mockups, design tokens library, iconography sets, animations files, and styling guides.
* **Architecture Ownership:** Interface user flows, visual hierarchies, typography hierarchies, responsive layouts, accessibility checklists, and brand design guidelines.

---

## 4. Inputs
* **Logical Inputs:** User personas profiles, business constraints, and market comparisons from the Product Manager.
* **Requirements Inputs:** Pages/Screens layouts, map overlays, comparison parameters, and dashboard modules detailed in the [PRD.md](file:///d:/vibeCoding2026/practiceProjects/real-estate-marketplace/docs/PRD.md).
* **Feedback Inputs:** User session analytics logs and development feedback on design complexity.

---

## 5. Outputs
* High-fidelity, developer-ready Figma workspace files.
* Style guide documentation detailing colors, buttons, inputs, typography, and spaces.
* Vector assets (SVG icons, logos, map markers) and video animations exports.
* UX Flow diagrams mapping actions and click routes.

---

## 6. Deliverables
* **D-UI-001:** Homepage style specs including search headers.
* **D-UI-002:** Split screen Search & Map layouts (mobile drawers and desktop canvas overlays).
* **D-UI-003:** Stepper Wizard Form layouts with validation alerts.
* **D-UI-004:** Side-by-side Property Comparison Grid tables.
* **D-UI-005:** User & Agent Dashboard views (inbox thread layout, stats charts, review forms).
* **D-UI-006:** Admin Moderation Console layouts.

---

## 7. Standards
* **Design Aesthetics Standards:** Rich, modern design (clean gradients, glassmorphic elements, harmonious dark backgrounds) avoiding generic themes.
* **Accessibility Standards:** WCAG 2.1 Level AA compliant color contrast ratios (`>= 4.5:1` standard text) and minimum touch targets (`44x44px` on mobile).
* **Grid Standards:** Standard 12-column grid layout for desktop, transitioning to 8-column for tablet and 4-column fluid layout for mobile devices.

---

## 8. Security Requirements
* **SEC-UI-101 (Data Privacy Indicators):** Design clear user indicators showing when properties or user phone numbers are obfuscated, highlighting secure encryption icons during communication steps.
* **SEC-UI-102 (Form Security Layout):** Design clear strength checkers and warning states for security fields (password registrations, agent license entries).

---

## 9. Collaboration Rules
* **With Frontend Engineer:** Hold design handoff reviews in Figma to align on HTML components structure and CSS variable overrides.
* **With Project Manager:** Review user validation tests and iterate wireframes based on feedback.
* **With QA Lead:** Walk through dynamic user flows to align on E2E testing scenarios.

---

## 10. Success Metrics
* **SM-UI-001:** User CSAT rating on marketplace registration and listing experiences `> 4.5/5`.
* **SM-UI-002:** Interface design implementation matching Figma mockups within a 2px variance.
* **SM-UI-003:** Task completion time decrease across testing cohorts for property searches.

---

## 11. Definition of Done
* Figma mockups are completed and organized into clean developer-ready pages.
* Design specs are verified AA contrast compliant using contrast validation tools.
* Component styles and variable libraries are documented in the design kit.
* Responsive layouts are provided for all core screens across all three breakpoints.
