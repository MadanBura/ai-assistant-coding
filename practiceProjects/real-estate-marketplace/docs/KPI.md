# Key Performance Indicators & Project Completion Criteria (KPI.md)

## 1. Document Control
* **Project Name:** PropConnect Real Estate Marketplace
* **Version:** 1.0.0
* **Date:** June 4, 2026
* **Author:** QA Lead & Senior Product Manager

---

## 2. Feature Acceptance Criteria (AC)
These criteria define the exact behavioral expectations for features described in the PRD.

### Epic 1: Auth & User Management (EP-01)
* **AC-101: Secure Registration Validation**
  * *Criterion:* Users registering must provide email, password (min 8 chars, 1 number, 1 special character), name, and role.
  * *Verification:* UI must throw real-time validation errors for incorrect fields. API must return `400 Bad Request` if field values fail regex constraints.
* **AC-102: JWT Authentication Lifecycle**
  * *Criterion:* After successful authentication, user receives a JWT token with a 2-hour lifetime stored in an HTTP-only, Secure cookie.
  * *Verification:* Inspection of browser cookie storage must confirm `HttpOnly`, `Secure`, and `SameSite=Strict` flags are active.
* **AC-103: Agent Credentials Upload**
  * *Criterion:* The system must accept license inputs and a single document file (PDF, JPEG, or PNG) up to 5MB.
  * *Verification:* Attempting to upload a 6MB file or an unsupported type (e.g., EXE) must display an upload failure error message.
* **AC-104: Listing Cap Restrictions**
  * *Criterion:* Unverified Agent or Owner accounts attempting to submit a 3rd active listing must be blocked by a modal dialog indicating listing limits.
  * *Verification:* Attempt to POST `/api/v1/properties` when user has 2 active properties. Verify response code is `403 Forbidden` with a cap-reached code.

### Epic 2: Property Listings (EP-02)
* **AC-201: Listing Wizard Validation**
  * *Criterion:* Every property submitted must have coordinates, a price greater than $0, and at least 3 photos.
  * *Verification:* Test form submission missing geographic coordinates. Form submit button must remain disabled, highlighting the map/address section.
* **AC-202: Form Autosave Cache**
  * *Criterion:* Form changes must be saved to local storage every 5 seconds.
  * *Verification:* Fill out 50% of the form, refresh the page. Form inputs must auto-populate with the previously entered data.
* **AC-203: Multi-Parameter Filtering**
  * *Criterion:* Combining multiple filters (e.g., Location: New York, Price: 300k-500k, Beds: 3) must only return listings matching all conditions.
  * *Verification:* Run manual search verification comparing Postgres raw queries with search results UI. Data sets must match exactly.
* **AC-204: Fallback Result Behavior**
  * *Criterion:* If a search yields zero matches, the system must render a "No properties found" banner alongside suggestions to broaden radius.
  * *Verification:* Search for a location/price that yields 0 results. Confirm suggestion links display.

### Epic 3: Map Integration (EP-03)
* **AC-301: Viewport Bounds Refresh**
  * *Criterion:* Moving or zooming the map canvas must instantly (under 200ms) re-query coordinates and refresh listing pins on the sidebar.
  * *Verification:* Drag map canvas using automated browser test. Verify network pane triggers `/api/v1/properties` with new bounds.
* **AC-302: Marker Clustering Threshold**
  * *Criterion:* Listings within 20px grid distance of each other must cluster into a single marker displaying the aggregate count of listings.
  * *Verification:* Set map zoom level to 10 (city view). Confirm markers merge and display numeric badges.

### Epic 4: Comparison & Analytics (EP-04)
* **AC-401: Matrix Consistency**
  * *Criterion:* The comparison matrix table rows must dynamically align specs across selected items.
  * *Verification:* Select a Condo and a Townhouse for comparison. Inspect comparison table structure; missing values (e.g., HOA for Townhouse) must display as "N/A" rather than breaking alignment.
* **AC-402: Matrix Selection Bounds**
  * *Criterion:* Attempting to add a 5th property to comparison must display a toast notification reading "You can compare a maximum of 4 properties."
  * *Verification:* Click compare on 4 properties, then click the compare action on a 5th property. Verify the toast appears and selection is blocked.
* **AC-403: Property View Logging**
  * *Criterion:* Opening a property page must record 1 view increment, throttled to once per user session.
  * *Verification:* Refresh detail page 5 times in the same browser session. Dashboard view count must only increment by 1.

### Epic 5: Inquiries & Interactions (EP-05)
* **AC-501: Real-Time Chat Synchronization**
  * *Criterion:* Message bubbles sent from one user must render on the recipient's screen in less than 500ms when both are in the chat panel.
  * *Verification:* Run dual-browser testing. Send text from User A; visually verify rendering on User B within threshold.
* **AC-502: Offline Inbox Alert Email**
  * *Criterion:* If a user is sent a chat while disconnected, a notification email summary must dispatch exactly 15 minutes later.
  * *Verification:* Disconnect receiver socket connection, send message from sender, monitor mail server queue for delay threshold.
* **AC-503: Review Eligibility Verification**
  * *Criterion:* Users must have a validated inquiry thread with an agent to write reviews on their profile.
  * *Verification:* Attempt to submit a review for Agent X using API without an existing chat thread. System must return a `403 Forbidden` response.

### Epic 6: Moderation & Governance (EP-06)
* **AC-601: Moderation Status Transitions**
  * *Criterion:* Admin approval or rejection updates listing states immediately, updating search index parameters.
  * *Verification:* Set listing to `APPROVED` in moderation UI. Verify listing is instantly retrievable via search endpoints.

---

## 3. Functional Requirements Checklist
Verify that code files implement the following core requirements:

| Check ID | Requirement Mapped | Description | Pass / Fail |
| :--- | :--- | :--- | :--- |
| **FR-CHK-101** | `FR-101` | Register API enforces strict validation of roles (Buyer/Owner/Agent) | [ ] |
| **FR-CHK-102** | `FR-102` | Agent credentials fields stored correctly with default pending status | [ ] |
| **FR-CHK-201** | `FR-201` | Property listing schema enforces price > 0, lat/lng coordinates present | [ ] |
| **FR-CHK-202** | `FR-201` | Images are successfully compressed and resized backend-side before S3 upload | [ ] |
| **FR-CHK-203** | `FR-202` | ElasticSearch indexes match price thresholds and amenities values exactly | [ ] |
| **FR-CHK-301** | `FR-301` | Spatial queries return only listings within boundary polygon coordinates | [ ] |
| **FR-CHK-401** | `FR-401` | Matrix UI layout matches specification sheet rows, displaying comparison charts | [ ] |
| **FR-CHK-501** | `FR-501` | WebSocket handshakes authenticate user tokens successfully, preventing spoofing | [ ] |

---

## 4. UI / UX Design Checklist
* **UI-001: Mobile Responsiveness:** Layouts must shift cleanly to single column viewports below 768px.
* **UI-002: Geolocation Indicator:** When geolocation is enabled, map centers on current location and displays blue user pin.
* **UI-003: Contrast AA Compliance:** Text-to-background contrast ratio must be greater than or equal to 4.5:1 on all text labels.
* **UI-004: Interactive Micro-Animations:** All buttons, cards, and markers must exhibit smooth hover scaling and cursor pointer indicators.
* **UI-005: Form Error Formatting:** Form fields failing validation must display with red border states and clear descriptive text labels underneath.

---

## 5. Security Verification Checklist
* **SEC-CHK-101:** Confirm all REST endpoints verifying user data use JWT middleware validations.
* **SEC-CHK-102:** Verify passwords are encrypted using bcrypt algorithms with a work factor scaling score of 12.
* **SEC-CHK-103:** Verify database configuration blocks SQL Injection attempts on sorting and filter parameters.
* **SEC-CHK-104:** Confirm Cross-Origin Resource Sharing (CORS) lists explicit whitelisted front-end domains (no wildcards `*`).
* **SEC-CHK-105:** Test that API prevents IDOR (Insecure Direct Object Reference) when updating profile metadata or modifying listing details.

---

## 6. Performance & Scalability Checklist
* **PERF-CHK-101:** Map loading time and initial search coordinate response must resolve under 200ms for 1,000 active instances.
* **PERF-CHK-102:** Cumulative Layout Shift (CLS) on the details page gallery must be less than 0.1.
* **PERF-CHK-103:** Server memory footprint must remain stable during high-stress concurrent image uploads.
* **PERF-CHK-104:** Database indexing strategy on spatial geolocation maps must optimize querying to less than 50ms execution runtime.

---

## 7. Testing Requirements

### Unit Testing
* **Requirement:** 80% coverage score target for back-end controllers and front-end utility functions.
* **Tools:** Jest, React Testing Library.

### Integration Testing
* **Requirement:** Assert API contract validity, checking routes, header parameters, payload responses, and database transaction lock states.
* **Tools:** Supertest, Mocha/Chai.

### End-to-End Testing (E2E)
* **Requirement:** Execute user flows across registration, listing submission, map-based filtering, and chat communications in headless environments.
* **Tools:** Playwright, Cypress.

### Load & Stress Testing
* **Requirement:** Assert platform stability at 200% expected average load (1,500 requests per second across search routes).
* **Tools:** k6, Apache JMeter.

---

## 8. Launch Readiness Checklist
* [ ] **LNC-101: Environment Configurations:** Setup distinct local, staging, and production `.env` files containing API keys and credentials.
* [ ] **LNC-102: DNS & SSL bindings:** Route traffic through HTTPS protocol using TLS 1.3 certificates.
* [ ] **LNC-103: DB Migration Verify:** Apply migration files to production database, confirming constraints and table structures.
* [ ] **LNC-104: Asset CDN Validation:** Build front-end pipeline to compile scripts and upload media assets to optimized CDN edge caches.
* [ ] **LNC-105: APM Integration:** Install active application performance monitoring metrics logging (e.g., Sentry, Datadog) to capture exceptions.

---

## 9. Definition of Done (DoD)
A story, ticket, or task is considered complete when:
1. **Code Review:** Peer developer reviews code changes, approving structural standards.
2. **Unit & Integration Tests:** Tests pass locally and on continuous integration (CI) environments with zero errors.
3. **Acceptance Criteria met:** Verified using automated E2E suites or QA manual scorecards.
4. **Documentation update:** Accompanying inline code documentation and API spec updates are compiled.
5. **No critical alerts:** Security analysis scanners (e.g., SonarQube, Snyk) confirm zero high/critical vulnerability detections.
