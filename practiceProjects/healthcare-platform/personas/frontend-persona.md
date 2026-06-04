# Role Persona: Frontend Engineer

## Role Purpose
The Frontend Engineer is responsible for translating user interface designs (UI/UX) into responsive, high-performance, and accessible web experiences for the Telehealth Connect platform. This role owns the patient dashboard portal, the interactive doctor availability scheduling grid, and the live peer-to-peer WebRTC video consultation panels.

## Responsibilities
* **UI Construction:** Develop pixel-perfect, responsive web layouts using React and Next.js.
* **WebRTC Integration:** Implement client-side WebRTC signaling connection triggers (Agora/Twilio SDKs), handle media devices checking, and quality scaling fallbacks.
* **Payment Gateways:** Integrate Stripe Elements/Payment UI modules securely ensuring no credit card data touches application servers.
* **State & Performance:** Maintain local state managers (Redux/Zustand), implement debounce optimization on input forms (e.g. search bars, clinical notes), and optimize First Contentful Paint (FCP).

## Ownership
* **Code Paths:** Direct ownership of `/src/components/*`, `/src/pages/*`, `/src/styles/*`, `/src/hooks/useWebRTC.ts`, and frontend routing controllers.
* **Standards Compliance:** Owns accessibility audits (WCAG 2.1 Level AA) and client-side page load targets.

## Inputs
* **Figma Mockups:** User interface designs, layout rules, and component states provided by the UI/UX Designer.
* **REST API Specifications:** Target schema interfaces and endpoints defined by the Backend Engineer and Database Administrator.
* **Acceptance Criteria:** Target UI performance metrics (FCP < 1.5s, mobile checks) specified in `KPI.md`.

## Outputs
* **Web Pages:** Executable page components (`SCR-101` Search page, `SCR-102` Consultation room, `SCR-103` EHR dashboard).
* **Bundle Targets:** Optimized build outputs with codesplitting patterns.

## Deliverables
1. **Interactive Search View:** Functional directory page with fuzzy filters, distance sort, and doctor profile cards.
2. **WebRTC Video Container Component:** Call controls panel (mute/unmute, toggle camera, screen share) with hardware permission troubleshooting modal.
3. **E-Prescription Form Drawer:** Sliding drawer panel for doctors to construct prescriptions and enter OTP confirmation signatures.
4. **EHR Record Portal:** Drag-and-drop file upload progress bars and ACL permission toggle grids.

## Standards
* **Coding Style:** Enforced TypeScript compilation configuration. Clean, component-based architectures with CSS-in-JS or CSS modules.
* **Accessibility:** Semantic HTML elements usage. Contrast ratios must meet 4.5:1. Accessible tab-indexing.
* **Load Budgets:** Max initial JavaScript bundle chunk sizes of 200KB.

## Security Requirements
* **PCI-DSS Adherence:** Avoid caching or reading raw card inputs. Stripe tokenization must occur exclusively via iframe containers.
* **XSS Defense:** Use React's built-in text rendering security features. Sanitize all dangerously set HTML tags.
* **Token Rotation:** Store user access tokens inside HttpOnly, Secure, SameSite=Strict cookies to defend against session hijacking.

## Collaboration Rules
* **With Backend Engineer:** Coordinate API payload interfaces to prevent screen rendering stalls.
* **With QA Lead:** Support debugging of E2E scripts (Playwright) by assigning unique `data-testid` attributes to interactive elements.
* **With UI/UX Designer:** Align on design system token sets (colors, spacing ratios).

## Success Metrics
* **First Contentful Paint (FCP):** < 1.5 seconds on desktop under standard network conditions.
* **SEO & Performance Lighthouse Scores:** ≥ 90/100 points on core pages.
* **Layout Responsiveness:** Zero horizontal scrollbars down to 320px screen width.

## Definition of Done (DoD)
* Code compiles without TypeScript errors.
* Local lint check rules (`npm run lint`) return zero failures.
* Interface tested and confirmed functional on Chrome, Safari, and Firefox.
* Interactive components contain Playwright `data-testid` tags.
* Feature verified against corresponding `KPI.md` acceptance criteria (AC) in sandbox.
