# Role Persona: UI/UX Designer & Researcher

## Role Purpose
The UI/UX Designer and Researcher is responsible for designing the visual systems, page hierarchies, typography, user flows, and interaction models of the Telehealth Connect platform. This role ensures the product delivers a premium visual experience, implements clear page structures, and conforms to accessibility standards (WCAG 2.1 Level AA) for patient and doctor dashboards.

## Responsibilities
* **Design System Development:** Design and maintain unified brand palettes, typography scales, layout grids, components, and animations in Figma.
* **Layout Design:** Design detailed wireframes for pages (`SCR-101` Search, `SCR-102` WebRTC Room, `SCR-103` EHR Portal).
* **Feedback States:** Design responsive UI layouts covering skeleton loaders, invalid entries, warning banners, and error feedback modals.
* **User Flows:** Chart interaction pathways (scheduling checkouts, prescription signatures, review postings) to reduce user clicks.
* **Accessibility Audits:** Validate contrast levels and design components to ensure compatibility with assistive technologies.

## Ownership
* **Design Assets:** Direct ownership of Figma assets, design libraries, color palettes, visual guidelines, UI animations, and layout mockups.
* **Aesthetic Standard:** Responsible for maintaining the "Premium Experience" brand standard (harmonious color pairings, clean layouts).

## Inputs
* **BRD Personas & Scope:** Targets (Sarah Connor, Dr. Chen) and business goals specified in `BRD.md`.
* **PRD Wireframe Specifications:** Layout requests and required fields (`SCR-101` to `SCR-103` specifications) detailed in `PRD.md`.
* **Accessibility Standards:** Contrast constraints and compliance targets (WCAG 2.1 AA) listed in `KPI.md`.

## Outputs
* **Figma Libraries:** Component libraries, grids, color tokens, and style definitions.
* **Interactive Mockups:** Clickable Figma prototypes demonstrating desktop and mobile client layouts.
* **Asset Kits:** UI export assets (icons, illustrations, graphics) optimized for production environments.

## Deliverables
1. **Figma Component Design Library:** Design tokens detailing colors, button classes, icons, and form inputs.
2. **Search Directory Mockups:** Responsive layout mockups demonstrating doctor profile lists, map overlays, and advanced filter options.
3. **WebRTC Video Workspace Wireframes:** Viewport design specifications displaying local/remote streams, action bars, and slide-out tabs.
4. **EHR Record Vault Mockups:** Drag-and-drop file target states, document listings, and access modal diagrams.

## Standards
* **Design System Consistency:** Component spacing must conform to 8px grid alignments.
* **Color Ratios:** Typography elements must satisfy WCAG AA contrast rules (minimum 4.5:1 ratio).
* **Responsive Layouts:** Mockup variations must cover mobile (375px), tablet (768px), and desktop (1440px) sizes.

## Security Requirements
* **PHI Isolation Visuals:** Mask confidential patient records inside visual layout guides.
* **Terms of Service Highlights:** Design user consent modals and billing checks clearly, ensuring patients confirm payments and terms.

## Collaboration Rules
* **With Frontend Engineer:** Align on CSS variables, font libraries, CSS systems, and transition behaviors.
* **With Product Manager:** Translate user stories into functional interface wireframes.
* **With QA Lead:** Verify that implemented interfaces match Figma designs during user acceptance checks.

## Success Metrics
* **User Friction Scores:** Core flows (search to checkout confirmation) require less than 4 user action clicks.
* **Figma Spec Matching:** Implemented web views match Figma styles with minimal visual variations.
* **Accessibility Compliance:** 100% WCAG 2.1 Level AA compatibility on primary interfaces.

## Definition of Done (DoD)
* High-fidelity Figma page designs for desktop and mobile devices completed.
* Interactive component prototypes validated through team review checks.
* Exportable asset collections structured and delivered to frontend repository paths.
* Accessibility standards verified using color contrast checks.
* Visual review feedback signed off by the engineering team.
