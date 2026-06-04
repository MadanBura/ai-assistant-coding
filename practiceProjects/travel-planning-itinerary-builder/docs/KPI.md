# KPI and Project Completion Criteria (KPI.md)
## Project: Globetrotter - Travel Planning Platform
**Document Version:** 1.0.0  
**Author:** QA Lead & Technical Lead  
**Date:** June 4, 2026

---

## 1. Feature Acceptance Criteria (AC)

This section maps directly to the Epics and Features outlined in [PRD.md](file:///d:/vibeCoding2026/practiceProjects/travel-planning-itinerary-builder/docs/PRD.md). Every criteria has a unique ID, references its dependencies, and includes explicit edge cases.

### Epic: EP-001 - Trip Lifecycle & Workspace Setup

#### Feature: FE-101 - Trip Creator & Planner
* **AC-101.1 (Trip Creation Validation):** 
  * *Requirement:* When a user initiates trip creation, they must submit a valid title, start date, and end date.
  * *Verification Method:* Automated browser test filling forms.
  * *Dependency:* FR-1.1, FR-1.3.
  * *Edge Case / Pass Criteria:* The form rejects saving if the start date is in the past (shows warning `ERR_PAST_DATE`) or if the end date precedes the start date (shows `ERR_TRIP_DATE_01`).
* **AC-101.2 (Dynamic Cover Fetch):** 
  * *Requirement:* System must automatically populate the trip banner with a relevant destination photo.
  * *Verification Method:* API mock testing and visual check.
  * *Dependency:* FR-1.2.
  * *Edge Case / Pass Criteria:* If the cover photo API returns a `5xx` or `429` (rate limit), the UI must default to the local asset `/assets/default-cover.svg` without blocking user completion.

#### Feature: FE-102 - Collaborative Workspace
* **AC-102.1 (Access Tokens & Invitations):** 
  * *Requirement:* Owners can generate secure trip sharing tokens.
  * *Verification Method:* Integration testing on route `/api/trips/:tripId/invite`.
  * *Dependency:* FR-1.4.
  * *Edge Case / Pass Criteria:* The invitation link token must become invalid exactly 168 hours (7 days) after generation. Expired links must return HTTP status `410 Gone`.
* **AC-102.2 (Real-Time Permissions Switch):** 
  * *Requirement:* Modifying collaborator roles must propagate immediately.
  * *Verification Method:* WebSocket connectivity testing.
  * *Dependency:* FR-1.5.
  * *Edge Case / Pass Criteria:* When an Owner changes a user's role from `Read-Write` to `Read-Only`, the backend must close the editor's WebSocket write capability, and the client UI must disable all inputs (buttons grayed out, input boxes locked) within 500ms.

---

### Epic: EP-002 - Dynamic Itinerary & Geography

#### Feature: FE-201 - Itinerary Builder
* **AC-201.1 (Timeline Sorting):** 
  * *Requirement:* Itinerary items must sort automatically by date and start time.
  * *Verification Method:* Unit test verifying sorting logic.
  * *Dependency:* FR-2.1.
  * *Edge Case / Pass Criteria:* If the start time of an activity is edited to be later than its end time, the system rejects the modification and displays `ERR_TIME_FLIP`.
* **AC-201.2 (Collision Detection):** 
  * *Requirement:* Users are warned if activities overlap in time.
  * *Verification Method:* Visual UI test.
  * *Dependency:* FR-2.2.
  * *Edge Case / Pass Criteria:* Overlapping blocks must display a subtle warning border and tooltip, but allow saving so users can plan concurrent events (e.g. dinner options).

#### Feature: FE-202 - Map Integration
* **AC-202.1 (Geocoding Fallback):** 
  * *Requirement:* Stop markers must display on the map using location addresses.
  * *Verification Method:* Map UI verification.
  * *Dependency:* FR-2.3.
  * *Edge Case / Pass Criteria:* If the Google Maps API cannot resolve an address, the system leaves the map focused on the main destination hub, logs a geocoding warning in the trip admin panel, and does not crash the page.
* **AC-202.2 (Distance Matrix Calculations):** 
  * *Requirement:* Transit routes display transit time and distance.
  * *Verification Method:* API response verification.
  * *Dependency:* FR-2.4.
  * *Edge Case / Pass Criteria:* If a route crosses water bodies or land masses where driving is impossible, the map must fall back to a straight dashed line ("as the crow flies") and label distance as "Direct Distance".

#### Feature: FE-203 - Shared Travel Notes
* **AC-203.1 (Markdown Editor Sync):** 
  * *Requirement:* Multi-user writing updates notes in real time.
  * *Verification Method:* Concurrency tests using automated agents.
  * *Dependency:* FR-2.5.
  * *Edge Case / Pass Criteria:* If offline, block edits with a banner. If simultaneous typing conflicts occur on the same characters, utilize Operational Transformation/CRDT to merge without throwing errors.

---

### Epic: EP-003 - Discovery & Recommendations

#### Feature: FE-301 - Destination Discovery Feed
* **AC-301.1 (Flexible Filter Search):** 
  * *Requirement:* Filters search destinations by budget and travel tag.
  * *Verification Method:* Search query integration testing.
  * *Dependency:* FR-3.1.
  * *Edge Case / Pass Criteria:* If filters yield 0 results, the system must trigger fallback recommendation logic and present the user with a "No direct matches found, how about these?" section.

#### Feature: FE-302 - Lodging Recommendations
* **AC-302.1 (Radius Adjustment):** 
  * *Requirement:* Hotel suggestions load near planned points.
  * *Verification Method:* Integration API test with Mock Locations.
  * *Dependency:* FR-3.2.
  * *Edge Case / Pass Criteria:* If hotel provider returns empty lists for a 5-mile boundary, the app automatically expands query parameter to 15 miles and displays the notice: "No hotels found within 5 miles. Showing properties within 15 miles."

---

### Epic: EP-004 - Budget Management

#### Feature: FE-401 - Budget Calculator & Expense Tracker
* **AC-401.1 (Odd Cent Bill Splitting):** 
  * *Requirement:* Bills split among co-travelers must divide cleanly.
  * *Verification Method:* Mathematical unit tests.
  * *Dependency:* FR-4.1.
  * *Edge Case / Pass Criteria:* When splitting $10.00 among three travelers, the system must allocate $3.34 to the payer (or random participant) and $3.33 to the other two, ensuring the sum of splits matches the total transaction exactly.
* **AC-401.2 (Live Currency Failover):** 
  * *Requirement:* Multi-currency tracking converts to trip base currency.
  * *Verification Method:* Network simulation testing.
  * *Dependency:* FR-4.2.
  * *Edge Case / Pass Criteria:* If the live currency API is offline or returns `403/500`, the system must use the local SQLite/Postgres cached exchange rate from the previous 24 hours, displaying a warning icon "Rates updated 1 day ago".

---

### Epic: EP-005 - Travel Logistics & Real-Time Alerts

#### Feature: FE-501 - Commercial Flight Tracker
* **AC-501.1 (Flight Schedule Sync):** 
  * *Requirement:* Users query flight status via flight codes.
  * *Verification Method:* Mock API responses for scheduled flights.
  * *Dependency:* FR-5.1.
  * *Edge Case / Pass Criteria:* If flight date is >72 hours away, set tracking state to `STANDBY` (polled daily). If flight date is <72 hours away, set tracking state to `ACTIVE` (polled every 15 minutes).
* **AC-501.2 (Itinerary Auto-Sync):** 
  * *Requirement:* Flight legs automatically appear in daily timeline.
  * *Verification Method:* Flow test from flight tracking creation to itinerary page.
  * *Dependency:* FR-5.2.
  * *Edge Case / Pass Criteria:* If a flight time shifts by more than 15 minutes, the corresponding itinerary item block updates automatically and displays a "Time updated by airline" tag.

#### Feature: FE-502 - Push & Email Notifications
* **AC-502.1 (Notification Delivery):** 
  * *Requirement:* Alerts send for critical trip updates.
  * *Verification Method:* Notification pipeline validation.
  * *Dependency:* FR-5.3.
  * *Edge Case / Pass Criteria:* If a co-traveler adds an itinerary item, send notification. If the user is currently focused on the specific trip workspace, suppress the push notification and update the UI directly via WebSocket to prevent message fatigue.

---

## 2. Functional Requirements Verification Checklist

Every core functional requirement must be verified. This checklist tracks overall feature verification status.

| Verification ID | PRD Req Ref | Verification Description | Target UAT Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **V-FR-101** | FR-1.1 | Verify trip creation form loads, captures correct input parameters, and saves new records. | Manual / Playwright | [ ] Pending |
| **V-FR-102** | FR-1.2 | Verify cover image API queries destination name and handles network timeouts. | Integration / Mock | [ ] Pending |
| **V-FR-103** | FR-1.3 | Verify trip planner restricts itinerary lengths exceeding 90 days. | Automated / Unit | [ ] Pending |
| **V-FR-104** | FR-1.4 | Verify invitation link contains cryptographic token and expires in 7 days. | Integration / API | [ ] Pending |
| **V-FR-105** | FR-1.5 | Verify changing member role in DB updates client permissions on the fly. | WebSocket Live Test | [ ] Pending |
| **V-FR-106** | FR-2.1 | Verify timeline displays items sequentially and allows calendar switching. | Visual UI Walkthrough | [ ] Pending |
| **V-FR-107** | FR-2.2 | Verify drag-and-drop calendar event triggers PUT API with new time values. | E2E Playwright | [ ] Pending |
| **V-FR-108** | FR-2.3 | Verify location markers show up on map and match item geocoordinates. | Visual Inspect | [ ] Pending |
| **V-FR-109** | FR-2.4 | Verify distance calculation labels route mileage and walking/driving minutes. | API JSON check | [ ] Pending |
| **V-FR-110** | FR-2.5 | Verify Markdown editor formats tables, lists, and headers without markup leakage. | UI Markdown Check | [ ] Pending |
| **V-FR-111** | FR-3.1 | Verify region/budget filters narrow down list items correctly. | Integration Test | [ ] Pending |
| **V-FR-112** | FR-3.2 | Verify hotel recommendation API queries coordinates matching activity clusters. | Mock Location Test | [ ] Pending |
| **V-FR-113** | FR-4.1 | Verify budget splitter handles equal splits, custom ratios, and penny remains. | Unit test ledger math | [ ] Pending |
| **V-FR-114** | FR-4.2 | Verify currency conversion updates base calculations on current conversion tables. | API check | [ ] Pending |
| **V-FR-115** | FR-5.1 | Verify flight status API decodes airport names, times, and delays correctly. | Mock Flight response | [ ] Pending |
| **V-FR-116** | FR-5.3 | Verify FCM push notifications deliver messages to Android/iOS/Web within 5s. | Push delivery check | [ ] Pending |

---

## 3. Specialized Quality Checklists

### 3.1 UI & Design Checklist (UI-CK)
* **UI-CK-01 (Responsive Breakpoints):** Layout must adapt fluidly: Mobile (<768px - single column), Tablet (768px-1024px - two column), Desktop (>1024px - split screen map/itinerary).
* **UI-CK-02 (Contrast Compliance):** Web elements must adhere to WCAG 2.1 AA requirements (text-to-background contrast ratio >= 4.5:1).
* **UI-CK-03 (Interactive States):** All interactive buttons and list cards must feature distinct hover, focus, and active micro-animations (e.g. 150ms ease-in-out scale).
* **UI-CK-04 (Font Hierarchy):** Utilize Outfit/Inter fonts exclusively; system default fonts should not be visible.
* **UI-CK-05 (Loading States):** All components pulling external data must render skeleton loaders (`shimmer` effect) rather than blank screens or static spinner graphics.

### 3.2 Security Checklist (SEC-CK)
* **SEC-CK-01 (JWT Expiration):** JSON Web Tokens must expire within 15 minutes of issuance. Refresh tokens must expire in 7 days and remain bound to user ip/agent headers.
* **SEC-CK-02 (SQL Injection Protection):** Audit all data layers to guarantee ORM parameterization on query blocks; raw string concatenations in DB queries are forbidden.
* **SEC-CK-03 (XSS Mitigation):** DOM Purifier must run on travel notes inputs. React/Vue/Vanilla HTML template rendering must escape custom HTML expressions.
* **SEC-CK-04 (Sensitive Information Masking):** Reservation booking numbers, passport details, or individual card numbers must be masked by default (`•••• ••••`) and require explicit user click-to-reveal events.
* **SEC-CK-05 (CSRF Protections):** Enable `SameSite=Strict` cookies on backend session identifiers.

### 3.3 Performance Checklist (PERF-CK)
* **PERF-CK-01 (Time-to-Interactive):** TTI must remain below 3.0 seconds under throttled 3G networks.
* **PERF-CK-02 (LCP):** Largest Contentful Paint (LCP) must register <= 2.0s.
* **PERF-CK-03 (FCP):** First Contentful Paint (FCP) must register <= 1.0s.
* **PERF-CK-04 (Cumulative Layout Shift):** CLS score must remain below 0.1 during dynamic image loads and map insertions.
* **PERF-CK-05 (Asset Optimization):** All assets (images/SVGs) must pass compression pipelines. CSS and JS files must be minified and bundled, capping chunk size at 250kb.

---

## 4. Testing Requirements

### 4.1 Test Automation Strategy
* **Unit Testing:** Minimum **80% code coverage** on core helper services (e.g. Budget calculator math, markdown parser, timezone converter). Framed with Jest.
* **Integration Testing:** Validation of API Gateway routing, database reads/writes, WebSocket pub/sub message deliveries. Framed with Supertest and Mocha.
* **End-to-End (E2E) Testing:** Core user flows (User signup -> Create trip -> Add activity -> Split budget -> Share trip invite) tested via Playwright.

### 4.2 Manual / Exploratory Testing Scope
* **Network Latency Simulation:** Testing drag-and-drop interactions and notification alerts on 2G, 3G, and offline configurations.
* **Cross-Browser Verification:** Validating maps, sliders, and timeline visual layouts on Safari Mobile, Chrome Mobile, Chrome Desktop, Firefox, and Edge.

---

## 5. Launch Readiness Checklist (LRC)

This list defines the final validation items before production deployment.

* **LRC-01:** API keys (Google Maps, Skyscanner, Amadeus, SendGrid) rotated, moved to production vault (e.g. AWS Secrets Manager), and removed from Git codebase history.
* **LRC-02:** DB backup policy established (automated daily snapshot, retained for 30 days) and restoration procedure successfully dry-run.
* **LRC-03:** SSL certificate validity checks passed (auto-renewal via Let's Encrypt configured).
* **LRC-04:** Error monitoring tool (e.g. Sentry) initialized, alerts hooked to Slack channel.
* **LRC-05:** Legal compliance documents (Privacy Policy, Terms of Service) formatted, linked in footer, and cookie consent banners activated.
* **LRC-06:** System scaling rules validated (Auto-scaling limits set to launch new container instances if CPU utilization exceeds 70% for >3 minutes).

---

## 6. Definition of Done (DoD)

A backlog item or user story is officially classified as "Done" when:

1. **Code Quality:** Code compiles clean without warnings, passes standard ESLint guidelines, and is reviewed/approved by at least one other engineer.
2. **Testing:** Unit test coverage meets or exceeds 80%. All Playwright E2E integration paths pass successfully.
3. **Documentation:** Any new APIs are documented in Swagger/OpenAPI spec, and setup instructions in `README.md` are updated if configuration parameters changed.
4. **Security Audit:** Automated dependency scan (e.g. Snyk/npm audit) runs with zero critical vulnerabilities reported.
5. **Deployment:** The code is merged into the `main` branch and verified as functioning correctly in the staging environment.
