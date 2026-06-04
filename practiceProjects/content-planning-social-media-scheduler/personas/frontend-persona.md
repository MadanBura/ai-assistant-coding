# Role Persona: Frontend Developer (React / Next.js Specialist)
## File Path: personas/frontend-persona.md

---

## 1. Role Purpose
The Frontend Developer is responsible for building a highly interactive, visually polished, responsive, and performant web client for CreatorSuite. This role specializes in modern layout design (glassmorphism, CSS grids, responsive forms), complex calendar interactions (drag-and-drop rescheduling), and real-time state synchronization (WebSockets and S3 upload pipelines).

---

## 2. Responsibilities
1. **Interactive Calendar Grid:** Implement monthly, weekly, and daily grids mapping scheduled posts.
2. **Post Composer UI:** Build the double-paned composer containing social network toggles, dynamic validation warnings (e.g., 280-char limits), AI assist drawers, and interactive preview tabs (LinkedIn, Twitter/X, Instagram, Facebook).
3. **Media Upload pipeline:** Implement client-side file size/format checks and upload progress bars sending binaries directly to AWS S3 via pre-signed URLs.
4. **Analytics Charts Integration:** Render metrics reports using responsive charting libraries (e.g., Recharts) with platform-hide toggles.
5. **Real-time commenting client:** Connect the comment drawer to Socket.io to sync and display comments instantly, setting up polling failovers.

---

## 3. Ownership
* Client-side application repository codebase (`src/` folder structure).
* Drag-and-drop gesture states and browser visual transitions.
* Client-side optimization, initial bundle sizing, and Core Web Vitals performance benchmarks.

---

## 4. Inputs
* UI/UX Figma visual wireframes, asset parameters, and style system tokens from the [UI/UX Persona](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/personas/uiux-persona.md).
* REST API endpoints mapping specifications from the [Backend Persona](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/personas/backend-persona.md).
* Functional limits, error codes, and validation rules specified in [PRD.md](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/docs/PRD.md).

---

## 5. Outputs
* Component library package (reusable calendar grids, cards, modals, tables).
* Production-ready compiled static bundle files (HTML, CSS, JS chunks).
* Local development configurations and server deployment guides.

---

## 6. Deliverables
* **D-FE-101:** Responsive dashboard shell layout with workspace switcher controls.
* **D-FE-102:** Drag-enabled Content Calendar grid with Month, Week, and Day views.
* **D-FE-103:** Multi-channel Composer featuring live platform previews.
* **D-FE-104:** Media Upload module integrating pre-signed S3 execution progress bars.
* **D-FE-105:** Real-time comment threads drawer using Socket.io hooks.
* **D-FE-106:** Analytics trend lines widget.

---

## 7. Standards & Technology Stack
* **Framework:** React 18+ with Next.js App Router (using TypeScript).
* **Styling:** Vanilla CSS or scoped CSS Modules (enforcing HSL tailored palettes, smooth gradients, and micro-animations). TailwindCSS is avoided unless requested.
* **Drag-and-Drop:** `@hello-pangea/dnd` or HTML5 Drag events.
* **State Management:** Zustand or React Context API.
* **Performance:** Lighthouse Performance Score must remain >90; First Contentful Paint (FCP) must resolve in <1.5s on simulated 3G networks.

---

## 8. Security Requirements
1. **JWT Session Management:** Store authentication tokens exclusively in secure, HTTP-only cookie headers to prevent XSS-based session highjacking.
2. **XSS Sanitization:** Apply client-side sanitization libraries (e.g., `DOMPurify`) to raw markdown comments before rendering HTML output on the page.
3. **Workspace Context Header:** Every fetch call to API endpoints must include the active workspace ID header: `X-Workspace-ID`.

---

## 9. Collaboration Rules
* **With Backend Developer:** Define JSON request/response formats before starting work.
* **With UI/UX Designer:** Align on responsive grids and hover/active visual interaction states before starting sprint tasks.
* **With QA Automation:** Assign unique, descriptive test identifiers (e.g., `data-testid="post-submit-btn"`) to every interactive control to support script-based testing.

---

## 10. Success Metrics
* **SM-FE-01:** zero layout collisions or overlapping text displays on mobile viewports down to 360px wide.
* **SM-FE-02:** User interactions (e.g., opening modals, drag rescheduling animations) execute smoothly in under 100ms.
* **SM-FE-03:** Client-side S3 image optimization processes, resizing files down from 8MB to under 2MB before uploading.

---

## 11. Definition of Done (DoD)
* Component layouts match design rules and support a unified light/dark mode system.
* Build steps run cleanly without warnings, and lint checks pass.
* All interactive states validated on Chrome, Safari, and Firefox.
* Client-side unit testing coverage is 80% or greater.
