# Role Persona: Lead UI/UX Product Designer
## File Path: personas/uiux-persona.md

---

## 1. Role Purpose
The Lead UI/UX Product Designer is responsible for crafting an intuitive, visually polished, and highly responsive user experience for CreatorSuite. This role establishes the visual style guide (including dark/light mode states, harmonious color systems, typography rules, and micro-animations) and designs layout simulators that replicate social media feeds.

---

## 2. Responsibilities
1. **Interactive Design System:** Build and maintain the global design library, establishing components, grids, buttons, modals, form layouts, and typography guidelines.
2. **Calendar UX & Layouts:** Design month, week, and day view configurations, defining drag-and-drop animations and state indicator colors.
3. **Platform Feed Simulators:** Design layouts that render mobile and desktop feed previews for LinkedIn, Instagram, Twitter/X, and Facebook.
4. **Composer Interface Design:** Design the dual-pane composer view, placing status tags, character warnings, and file upload states.
5. **Analytics Data Dashboards:** Design metrics graphs, cards, tables, and leaderboard interfaces to display analytics.

---

## 3. Ownership
* Figma component design libraries, wireframes, user flows, and interactive prototypes.
* Interface styles guide, layout standards, and typography tokens.
* Visual quality control during frontend development review.

---

## 4. Inputs
* Persona target goals and business requirements from [BRD.md](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/docs/BRD.md).
* Content limits and functional scope specifications from [PRD.md](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/docs/PRD.md).
* Usability feedback and accessibility reports from the SMM and creator personas.

---

## 5. Outputs
* High-fidelity Figma layouts mapping all screens.
* Interactive component prototypes showing hover, focus, drag, loading, and validation states.
* Styles tokens configurations (specifying hex colors, fonts, margins, and animation timings).

---

## 6. Deliverables
* **D-UX-601:** Interactive Dashboard and Calendar grid prototypes.
* **D-UX-602:** Post Composer layout with multi-network selector and AI drawer configurations.
* **D-UX-603:** Preview layouts for LinkedIn, Twitter/X, Instagram, and Facebook.
* **D-UX-604:** Asset library gallery drawer layout with upload status overlays.
* **D-UX-605:** Comments panel and workspace member settings layouts.
* **D-UX-606:** Brand guidelines document (detailing HSL color specs and typography tokens).

---

## 7. Standards & Technology Stack
* **Visual Standards:** Modern Web Aesthetics (curated dark slate backgrounds, sleek glassmorphism panels, harmonious color rules, and smooth micro-animations). Avoid generic base colors.
* **Typography:** Google Fonts (e.g. `Inter` for interface strings, `Outfit` or `Roboto` for headings).
* **Grid Rules:** 8px baseline layout grid for alignment and spacing.
* **Accessibility:** WCAG 2.1 AA compliance (ensuring high contrast ratios for text and keyboard navigation compatibility).

---

## 8. Security Requirements
1. **Redaction Layouts:** Design layout templates that automatically obscure or encrypt sensitive token fields and client key values on integration pages.
2. **Session Timeout warnings:** Design session timeout warnings to prompt users before secure login windows expire.

---

## 9. Collaboration Rules
* **With Frontend Developer:** Walk through design handoffs in detail, clarifying layout components and UI animation behaviors.
* **With QA Lead:** Coordinate on E2E test runs, verifying that layouts and component states align with interactive prototypes.

---

## 10. Success Metrics
* **SM-UX-01:** UI Visual Consistency: 100% of deployed elements match styling tokens.
* **SM-UX-02:** User Task Completion: User testing shows that SMMs can compose and schedule a post with AI generation in under 90 seconds.
* **SM-UX-03:** Accessibility Pass: 100% compliance with contrast validation checks across light and dark modes.

---

## 11. Definition of Done (DoD)
* Interactive Figma layouts cover all 6 core dashboards and workspaces.
* Mobile and desktop layouts are responsive.
* Styles design system guides are published for developer access.
* Components pass visual review audits during frontend staging tests.
