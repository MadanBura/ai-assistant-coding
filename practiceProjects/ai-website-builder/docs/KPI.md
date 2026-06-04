# Key Performance Indicators & Project Completion Criteria (KPI)

## Project Name: Real Estate Listing, Discovery, and Management Platform
**Document Version:** 1.0.0  
**Date:** June 4, 2026  
**Author:** QA Lead & Solutions Architect  

---

## 1. Feature Acceptance Criteria (AC)

### Epic 1: User & Agent Management (EPC-100)
#### Feature: Registration and Role Selection (FEAT-101)
* **AC-101-1 (User Sign-up):**
  * *Scenario:* Creating an account with valid credentials.
  * *Given* a user is on the Registration page,
  * *When* they select a role (Buyer/Owner/Agent), fill in valid details, and submit,
  * *Then* the account must be created in a `PENDING_VERIFICATION` state, and an email containing a 6-digit verification code must be dispatched.
* **AC-101-2 (Invalid Sign-up):**
  * *Scenario:* Submitting invalid passwords.
  * *Given* a user is on the Registration page,
  * *When* they enter a password lacking required complexity (e.g. `12345`),
  * *Then* registration must fail with a UI message highlighting missing requirements (min 8 chars, 1 uppercase, 1 number, 1 special character).
* **AC-101-3 (Agent Verification Request):**
  * *Scenario:* Submitting an agent account with a license number.
  * *Given* an agent has registered,
  * *When* they submit their valid state license number,
  * *Then* their profile must be flagged as `UNVERIFIED_AGENT` in the database and visible in the Admin license verification queue.

#### Feature: Agent Profile & Branding (FEAT-102)
* **AC-102-1 (Agent Customization):**
  * *Given* a verified agent logs into their settings dashboard,
  * *When* they upload an agency logo, update their bio, and save changes,
  * *Then* their public profile URL must immediately display the new bio, logo, and active property counts.

---

### Epic 2: Property Listings Management (EPC-200)
#### Feature: Property Creation Wizard (FEAT-201)
* **AC-201-1 (Valid Listing Creation):**
  * *Given* a verified owner or agent is on the Property Creation form,
  * *When* they input all mandatory fields (Title, Description, Price, Coordinates, and 3+ images) and click Submit,
  * *Then* the property listing must be saved with status `PENDING_MODERATION` and hidden from public search results.
* **AC-201-2 (Draft Auto-Save):**
  * *Given* a listing creator is filling out the form,
  * *When* they type data and wait 30 seconds,
  * *Then* the form state must be stored locally in the browser, allowing restore upon accidental tab closure.

#### Feature: Listing Status Lifecycle (FEAT-202)
* **AC-202-1 (Listing Deactivation):**
  * *Given* an Owner has an active published listing,
  * *When* they change the status to "Sold" or "Archived" from their dashboard,
  * *Then* the property details page must display "No longer available" and the listing must be removed from search/map queries within 5 seconds.

---

### Epic 3: Discovery & Advanced Search (EPC-300)
#### Feature: Keyword and Filtered Search (FEAT-301)
* **AC-301-1 (Filter Matching):**
  * *Given* a buyer is on the Search page,
  * *When* they filter by price ($200k-$500k) and property type (Commercial),
  * *Then* the results count and cards must update dynamically, displaying only properties matching those criteria.

#### Feature: Interactive Map Discovery (FEAT-302)
* **AC-302-1 (Geospatial Viewport Update):**
  * *Given* a buyer is viewing search results on the interactive split-map screen,
  * *When* they pan the map to a new geographical bounding box,
  * *Then* a query must be sent containing the new coordinates, updating the property sidebar to match the pins visible on the map.

---

### Epic 4: Comparison & Favorites (EPC-400)
#### Feature: Property Comparison Matrix (FEAT-401)
* **AC-401-1 (Side-by-Side Grid):**
  * *Given* a buyer has selected 3 properties,
  * *When* they click "Compare",
  * *Then* they must be redirected to a matrix view listing all attributes (price, size, type, location) in matching columns.

#### Feature: Saved Favorites (FEAT-402)
* **AC-402-1 (Favorites Toggle):**
  * *Given* a logged-in buyer is browsing listings,
  * *When* they toggle the heart icon on a property card,
  * *Then* the database must persist this relation and increment/decrement the "saves" count for analytics.

---

### Epic 5: Inquiry & Lead Management (EPC-500)
#### Feature: Inquiry Messaging System (FEAT-501)
* **AC-501-1 (Lead Routing):**
  * *Given* a buyer is on a property details page,
  * *When* they fill in the contact form with a message and submit,
  * *Then* an email notification must be sent to the listing owner/agent, and a new message thread must appear in both parties' inboxes.

---

### Epic 6: Property Analytics (EPC-600)
#### Feature: Seller Dashboard Metrics (FEAT-601)
* **AC-601-1 (Analytics Charts):**
  * *Given* an owner is on their Analytics dashboard,
  * *When* they select "Last 30 Days",
  * *Then* Recharts must display daily aggregated view, save, and inquiry trends fetched from the database.

---

### Epic 7: Reviews & Feedback (EPC-700)
#### Feature: Agent and Property Reviews (FEAT-701)
* **AC-701-1 (Review Moderation Trigger):**
  * *Given* a buyer has submitted a rating and review for an agent,
  * *When* the review text contains filtered words (e.g., profanity or contact numbers),
  * *Then* the review status must be flagged as `PENDING_REVIEW` and not show on the agent's profile until cleared by an admin.

---

### Epic 8: Moderation & Control Panel (EPC-800)
#### Feature: Admin Queue & Moderation (FEAT-801)
* **AC-801-1 (Listing Approval):**
  * *Given* an Admin is in the listing queue,
  * *When* they click "Approve" on a property listing,
  * *Then* the listing status must change to `PUBLISHED` and be searchable immediately.

---

## 2. Functional Requirements Checklist (FRC)

| Item ID | Ref ID | Verification Step | Checked? (Y/N) |
| :--- | :--- | :--- | :---: |
| **FRC-101** | FR-101 | Verify password validator rejects simple passwords. | [ ] |
| **FRC-102** | FR-102 | Verify system rejects login attempts prior to entering the correct 6-digit confirmation token. | [ ] |
| **FRC-201** | FR-201 | Verify form validation triggers error on empty description, empty coordinates, or <3 photos. | [ ] |
| **FRC-202** | FR-202 | Inspect S3/Cloud Storage payload to verify uploaded images are saved as `.webp`. | [ ] |
| **FRC-301** | FR-301 | Verify search database query runs with indexing and has a speed threshold <200ms. | [ ] |
| **FRC-302** | FR-302 | Verify moving the map sends a bounding box parameter API request. | [ ] |
| **FRC-401** | FR-401 | Verify selection of a 5th property triggers a warning "Maximum 4 properties compared at once". | [ ] |
| **FRC-501** | FR-501 | Verify active user receives chat alerts via WebSocket connection without refreshing. | [ ] |
| **FRC-601** | FR-601 | Execute DB cron script manually and verify views aggregate counts compile correctly. | [ ] |
| **FRC-701** | FR-701 | Submit review with profanity and verify it goes to pending moderation queue. | [ ] |
| **FRC-801** | FR-801 | Verify every moderation action creates an audit log entry in table `admin_audit_logs`. | [ ] |

---

## 3. UI/UX Consistency Checklist (UIC)

| Item ID | UI/UX Objective | Checked? (Y/N) |
| :--- | :--- | :---: |
| **UIC-001** | **Mobile Responsiveness:** Viewports down to 320px (iPhone SE) render properly without horizontal scroll. Hamburger menu collapses/expands smoothly. | [ ] |
| **UIC-002** | **Aesthetics & Branding:** Consistent color palette (Slate primary, Emerald accents) applied using CSS variables. Zero plain browser buttons. | [ ] |
| **UIC-003** | **Interactive States:** Hover effects on property cards, active menu state underlines, focus rings for accessibility. | [ ] |
| **UIC-004** | **Typography:** System uses Outfit/Inter Google fonts. Headings sizes range from H1 (2.25rem) to Body small (0.875rem) consistently. | [ ] |
| **UIC-005** | **Empty States:** Clean, illustrated placeholder screen for "No properties found", "Inbox empty", and "Zero active listings". | [ ] |
| **UIC-006** | **Loading Skeletons:** Animated gray gradient placeholders load when properties or map pins are pending fetch. | [ ] |

---

## 4. Security Checklist (SECC)

| Item ID | Ref ID | Verification Step | Checked? (Y/N) |
| :--- | :--- | :--- | :---: |
| **SECC-001** | SEC-001 | Verify security headers redirect `http://` traffic to `https://` with HSTS enabled. | [ ] |
| **SECC-002** | SEC-002 | Inspect cookies in DevTools to verify `jwt` has flags `Secure`, `HttpOnly`, and `SameSite=Strict`. | [ ] |
| **SECC-003** | SEC-003 | Attempt to query DB hash using mock script to verify passwords cannot be decrypted. | [ ] |
| **SECC-004** | SEC-004 | Attempt to fetch `/api/admin/moderation` with a Buyer JWT token and verify API returns `403 Forbidden`. | [ ] |
| **SECC-005** | SEC-005 | Run static analysis (e.g. SonarQube or Snyk) to check for SQL Injection and dependency CVEs. | [ ] |
| **SECC-006** | SEC-006 | Trigger API with 150 login requests in 5 minutes and verify rate limiter blocks further requests. | [ ] |

---

## 5. Performance Checklist (PECC)

| Item ID | Ref ID | Verification Step | Checked? (Y/N) |
| :--- | :--- | :--- | :---: |
| **PECC-001** | NFR-001 | Execute Google Lighthouse on staging. Verify Mobile Performance Score >= 85 and LCP <= 2.5s. | [ ] |
| **PECC-002** | NFR-002 | Run stress test with 5,000 concurrent connections and verify server response error rate remains < 1%. | [ ] |
| **PECC-003** | NFR-003 | Check uptime monitoring (e.g., UptimeRobot) after 7 days of deployment to verify 99.9% uptime. | [ ] |
| **PECC-004** | NFR-004 | Verify backup script creates an encrypted gzip file of the DB, dumps to S3, and verifies file size > 0. | [ ] |
| **PECC-005** | NFR-005 | Manually test listing and map layouts on Chrome (v110+), Safari (iOS), Firefox (v105+), and Edge. | [ ] |

---

## 6. Testing Requirements

### 6.1 Unit Testing
* **Requirement:** Frontend and Backend codebases must achieve a minimum of 80% line coverage.
* **Scope:** Test utility functions, validation schemes, state selectors, and helper modules.
* **Tools:** Jest, React Testing Library, Supertest.

### 6.2 Integration Testing
* **Requirement:** Validate controller-to-service interfaces and query performance under simulated loads.
* **Scope:** Test endpoint interactions, database read/write transaction safety, geocoding logic, and API parameter bindings.

### 6.3 End-to-End (E2E) Testing
* **Requirement:** Automated browser flows for critical paths.
* **Scope:** User registration to email confirmation; Property creation upload to Admin moderation queue; Search filters to buyer inquiry submission.
* **Tools:** Playwright or Cypress.

### 6.4 User Acceptance Testing (UAT)
* **Requirement:** Human-led manual verification of personas Jenkins, Chen, and Vance.
* **Scope:** Test usability, copy accuracy, and edge-case behaviors (e.g., uploading incomplete details, cancelling a listing mid-draft).

---

## 7. Launch Readiness Checklist (LRC)

* **LRC-001 (Production Database Setup):**  
  * [ ] Verify PostgreSQL schema is migrated to the production instance.
  * [ ] Populate static reference values (amenities list, listing fee structures).
* **LRC-002 (Integrations & Keys):**  
  * [ ] Set Mapbox / Google Maps API key restrictions to production domains.
  * [ ] Verify SMTP / SendGrid credentials for transactional emails are in place.
* **LRC-003 (Domain & DNS Routing):**  
  * [ ] Map domain records to load balancers.
  * [ ] Verify Cloudflare / CDN cache configuration for assets.
* **LRC-004 (Infrastructure Tuning):**  
  * [ ] Verify Kubernetes auto-scaling limits are set to min 2, max 10 pods.
  * [ ] Enable database replication and automatic failover settings.
* **LRC-005 (Compliance Sign-off):**  
  * [ ] Confirm GDPR compliance banner and Privacy Policy pages are accessible.
  * [ ] Ensure administrative access accounts use Multi-Factor Authentication (MFA).

---

## 8. Definition of Done (DoD)
A task or ticket is considered "Done" when the following criteria are met:
1. **Coding Standards:** Code complies with ESLint and Prettier rules.
2. **Review:** Code is reviewed and approved by at least one Senior developer.
3. **Tests:** All Unit and Integration tests pass; coverage requirements are fully met.
4. **Security:** No high or critical issues found in automated vulnerability scanners.
5. **QA Validation:** Verified against Acceptance Criteria in staging environment by QA Lead.
6. **Documentation:** OpenAPI specs updated; API change notes written; relevant sections in `PRD.md` updated if design modified.
