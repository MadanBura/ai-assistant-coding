# Project Completion & Verification Criteria (KPI)
## Document Control
* **Project Name:** ApexSales CRM Platform
* **Version:** 1.0.0
* **Author:** QA Lead & Solutions Architect
* **Status:** Draft
* **Target Audience:** Product Managers, Developers, QA Engineers, AI Agents

---

## 1. Feature Acceptance Criteria (AC)

Each functional block must satisfy these acceptance criteria prior to release:

### 1.1 EPIC-001: Lead & Contact Management (LCM)
* **AC-LCM-001 (Lead Import):**
  - Given a valid CSV file with up to 10,000 records of leads (with headers: First Name, Last Name, Email, Company, Phone), when the user uploads it via the Lead Import screen, then the system must process the upload in < 5 seconds and display a success toast with the number of leads added.
  - *Edge Case (Duplicate Emails):* If a row contains an email already in the DB, the system must ignore that row, log the duplicate to a downloadable CSV log, and process other rows.
  - *Verification:* Admin uploads `test_leads.csv`. Verify total DB count matches baseline + successful rows.
* **AC-LCM-002 (Lead Dynamic Scoring):**
  - Given a lead is updated or an activity (email/call) is logged, when the scoring engine runs, then the lead score must automatically update based on rules: +10 per email, +15 per call, -5 for 7 days inactivity.
  - *Verification:* Log a call activity for "Lead A" (score 0), verify score updates to 15. Wait/simulate 7 days inactivity, verify score decays to 10.
* **AC-LCM-003 (Lead Conversion):**
  - Given a Lead with status "Qualified", when the Sales Representative clicks "Convert Lead", then the system must create a Contact, an Account (Company), and a Deal in the "Discovery" pipeline stage, auto-populating fields. The original Lead record must be marked as "Converted" and archived from active directories.
  - *Verification:* Convert lead `test_lead@abc.com`. Verify the creation of contact `test_lead@abc.com`, account `ABC Company`, and deal `ABC Company - Enterprise Deal` in the database.

### 1.2 EPIC-002: Sales Pipeline & Deal Tracking (SPD)
* **AC-SPD-001 (Kanban Drag-and-Drop):**
  - Given the Kanban Pipeline screen is visible, when a Sales Representative drags a Deal card from one stage column to another, then the system must update the pipeline stage ID in the database and recalculate the column totals immediately without reloading.
  - *Verification:* Move Deal `Deal-123` ($10,000) from Discovery to Proposal. Verify column 1 total decreases by $10,000 and column 2 increases by $10,000.
* **AC-SPD-002 (Deal Closing Verification):**
  - Given a Deal is dragged into the "Closed-Won" column, when the drop event occurs, then the system must present a modal requiring "Actual Deal Value" and "Close Date". If inputs are valid and submitted, the state change completes. If cancelled, the Deal card returns to its previous column.
  - *Verification:* Drag Deal `Deal-123` to Closed-Won. Dismiss modal. Confirm card resets position. Drag again, input $12k, save. Verify deal details.

### 1.3 EPIC-003: Communication & Task Automation (CTA)
* **AC-CTA-001 (Email Sync):**
  - Given a connected IMAP mailbox, when a new email is received from an address matching a Contact in the CRM, then the system must fetch the header, metadata, and email body, and write it to that Contact's Activity Timeline in chronological order.
  - *Verification:* Send test email from registered client `client@external.com` to agent inbox. Check Contact timeline for `client@external.com`. Verify email body is rendered.
* **AC-CTA-002 (Email Tracking):**
  - Given an outbound HTML email sent through the CRM, when the recipient opens the email or clicks a link, then the system tracking endpoint must catch the pixel request/link redirect, record the timestamp, and flag the email on the timeline as "Opened".
  - *Verification:* Send email to test address. Open email in external client. Verify tracking logs register open event.
* **AC-CTA-003 (Task Alerts):**
  - Given a task with a due date, when the current system time is exactly 15 minutes before the due date, then the system must push an in-app notification banner to the assignee and deliver a reminder email.
  - *Verification:* Schedule task "Follow-up Call" for current time + 16 minutes. Wait 1 minute. Verify notification pops up.

### 1.4 EPIC-004: Reports & Analytics (RPA)
* **AC-RPA-001 (Executive Quota Dashboard):**
  - Given a Sales Manager logs in and views the dashboard, when they filter by "Team Alpha" for "Q2 2026", then the dashboard must calculate the sum of Closed-Won deal values owned by Team Alpha members and render a target percentage bar (Actual vs Team Quota).
  - *Verification:* Query DB to find Team Alpha Q2 closed deals. Crosscheck value with dashboard percentage.
* **AC-RPA-002 (Weighted Forecasting):**
  - Given a set of active deals with different probabilities (Discovery = 10%, Proposal = 50%, Negotiation = 80%), when the forecasting script executes, then the expected revenue output must match:
    $$\text{Forecast} = \sum (\text{Value} \times \text{Probability})$$
  - *Verification:* Insert test deals ($10k @ 10%, $20k @ 50%). Verify forecasted value displays as $11,000.

### 1.5 EPIC-005: Team Administration & Security (TAS)
* **AC-TAS-001 (Role-Based Access Enforcement):**
  - Given a user logged in with the "Sales Representative" role, when they attempt to perform a GET request on `/api/v1/deals` or view dashboards of another team, then the system must reject the request with `403 Forbidden` status.
  - *Verification:* Log in as Rep A. Attempt to read Rep B's deals via API client. Confirm 403 response.

---

## 2. Functional Requirements Verification Checklist

| Req ID | Requirement Description | Verification Method | Status (Pending/Pass) |
| :--- | :--- | :--- | :--- |
| **FR-LCM-001** | CSV Import format/size limits | Upload 11MB file (fail) & 9MB file (pass) | Pending |
| **FR-LCM-002** | Duplicate checking on creation | API Request with duplicate email (reject) | Pending |
| **FR-LCM-003** | Dynamic loading of timelines | WebSockets / HTTP poll check | Pending |
| **FR-SPD-001** | Kanban stage updates via drag-drop | UI simulation test | Pending |
| **FR-SPD-002** | Pipeline totals real-time recalculation | Frontend DOM assertions | Pending |
| **FR-CTA-001** | 5-minute periodic IMAP polling | Log trace analysis of sync daemon | Pending |
| **FR-CTA-002** | 1x1 transparent tracking pixel injection| Inspect outbound raw SMTP source code | Pending |
| **FR-CTA-003** | Task reminders triggering | Trigger queue runner assertions | Pending |
| **FR-RPA-001** | Dashboards filters (Date ranges) | UI visual test & SQL query crosscheck| Pending |
| **FR-RPA-002** | Expected value forecasting math | Excel calculations vs API response comparison| Pending |
| **FR-TAS-001** | Grouping Sales Reps into Teams | Admin panel CRUD test | Pending |
| **FR-TAS-002** | Write-Ahead Audit log capture | Check `audit_logs` table after DB updates | Pending |

---

## 3. UI/UX Verification Checklist (UIC)

* [ ] **UIC-001 (Responsive Design):** Core UI layouts (Dashboard, Pipeline, Directories) must scale smoothly from desktop resolutions (1920x1080) down to tablet viewports (768x1024). Mobile viewports must collapse the sidebar into a slide-out hamburger navigation menu.
* [ ] **UIC-002 (Dark Mode Accessibility):** Text-to-background contrast ratio must satisfy WCAG 2.1 AA requirements (minimum 4.5:1 ratio for normal text).
* [ ] **UIC-003 (Drag Feedback):** Kanban cards must render a drop-shadow and rotate 2 degrees during drag operations to denote movement. Hover states on drop targets must display a dashed border highlighted in primary brand color.
* [ ] **UIC-004 (Empty State Management):** Screens with empty dataset arrays must display descriptive placeholders with action buttons (e.g., "No leads found. Click here to import").

---

## 4. Security Verification Checklist (SEC)

* [ ] **SEC-001 (SSL/TLS Enforcement):** HTTP requests to port 80 must return a `301 Moved Permanently` response redirecting to port 443 HTTPS. Cipher suites must exclude legacy SSLv3 and TLS 1.0/1.1 protocols.
* [ ] **SEC-002 (SQL Injection Prevention):** Review repository layer codes to guarantee all database queries leverage parameterized inputs or Object Relational Mapping (ORM) drivers. Raw string concatenations are strictly forbidden.
* [ ] **SEC-003 (Session Security):** Cookies storing authentication tokens must configure flags: `Secure`, `HttpOnly`, and `SameSite=Strict`.
* [ ] **SEC-004 (Input Sanitization):** Timeline text editors must sanitize entries via an HTML escape filter to block Cross-Site Scripting (XSS) payloads.

---

## 5. Performance Verification Checklist (PERF)

* [ ] **PERF-001 (API Response Speeds):** Using Apache Benchmark (AB) or k6, simulate 100 concurrent virtual users hitting GET endpoints. Mean response latency must be ≤ 200ms.
* [ ] **PERF-002 (Memory Overhead):** Node.js API processes must run under a memory threshold of 512MB per container node under persistent stress tests.
* [ ] **PERF-003 (Database Index Tuning):** PostgreSQL indexing must cover critical foreign keys (`owner_id`, `account_id`, `pipeline_stage_id`) and search targets (`email`). Explain-Plan queries must avoid full table sequential scans.

---

## 6. Testing Requirements

### 6.1 Automated Testing Matrix
* **Unit Testing:**
  - *Coverage Target:* Minimum 80% line coverage for backend controller routes, mathematical forecasting utilities, and database model validation layers.
  - *Tools:* Jest (Javascript) or Vitest.
* **Integration Testing:**
  - Verify endpoints (/auth, /leads, /deals) return correct schemas, status codes, and update databases properly.
  - *Tools:* Supertest / Postman collections.
* **End-to-End (E2E) Browser Testing:**
  - Automated user flows: Log in, import CSV, view timeline, drag a Deal on the Kanban board, trigger Closed-Won modal.
  - *Tools:* Playwright or Cypress.

### 6.2 Manual User Acceptance Testing (UAT)
* **Beta Group Review:** Invite a cohort of 5 Sales Representatives and 2 Sales Managers to run operations for 1 week in a sandbox environment.
* **Feedback Collection:** Deploy in-app survey widgets to log friction feedback, system bugs, or visual suggestions.

---

## 7. Launch Readiness Checklist (LRC)

* [ ] **LRC-001 (Infrastructure Provisioning):** Database replicas established, load balancers active, SSL certificates active with auto-renewal processes.
* [ ] **LRC-002 (Secrets Management):** Ensure production secrets (DB credentials, IMAP server connection keys, email validation tokens) are stored in secure environment managers, not committed to repository codes.
* [ ] **LRC-003 (System Monitoring):** Deploy APM tools (e.g. Datadog, Prometheus/Grafana) to configure threshold alerts for error rates (>1% of requests failing) and CPU utilization (>80%).
* [ ] **LRC-004 (Backup Routines):** Daily automated database snapshots scheduled and stored in read-only offsite S3 backup nodes. Test backup restore functions.

---

## 8. Definition of Done (DoD)

A development ticket or user story is considered **Done** only when it satisfies:
1. **Code Quality:** Code passes static linting rules (e.g. ESLint configuration) with zero errors.
2. **Review:** Code is peer-reviewed by at least one Senior developer and merged to the main trunk via pull request.
3. **Testing:** Unit test coverage targets met, E2E checks pass, and zero regression alerts found.
4. **Documentation:** API endpoints documented on OpenAPI/Swagger; schemas updated in architecture charts.
5. **Localization & Accessibility:** Inputs have corresponding accessibility labels (`aria-label`) and meet standard contrast rules.
6. **Deployment:** The feature is successfully deployed to the staging environment and verified under manual sanity test cycles.
