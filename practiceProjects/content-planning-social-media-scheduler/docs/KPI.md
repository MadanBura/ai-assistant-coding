# Project Completion Criteria & Checklists (KPI.md)
## Project: CreatorSuite - Content Planning & Social Media Scheduler
**Version:** 1.0.0  
**Date:** June 4, 2026  
**Author:** Lead QA Engineer & Business Analyst  

---

## 1. Feature Acceptance Criteria (AC)

This section maps directly back to the User Stories in [PRD.md](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/docs/PRD.md) and defines the exact criteria required for QA sign-off.

### 1.1 EPIC-100: Workspace & Authentication

#### User Story: US-101 (Workspace Management)
* **AC-101-1:** A user can create a workspace via a modal form by specifying a unique workspace name.
* **AC-101-2:** The user is automatically assigned the `ADMIN` role for any workspace they create.
* **AC-101-3:** Workspace selector dropdown correctly updates the client workspace context without triggering a full page reload or log-out.

#### User Story: US-102 (Workspace Invitations)
* **AC-102-1:** An Admin can enter an email address and select a role (`EDITOR`, `APPROVER`, `VIEW_CLIENT`) to send an invitation.
* **AC-102-2:** An email is sent via SES/SendGrid containing a secure registration token URL.
* **AC-102-3:** If the recipient registers or signs in, they are immediately granted access to that workspace with the designated role.
* **AC-102-4:** **Edge Case:** If an invitation is sent to an email that is already registered, clicking the invitation link redirects them to accept the membership immediately.

#### User Story: US-103 (Social Account Integrations)
* **AC-103-1:** Admin can click "Connect" for LinkedIn, Facebook, Instagram, and Twitter/X, and complete the OAuth consent screen.
* **AC-103-2:** Upon redirect, the system displays a success toast and lists the connection under "Active Connections" with the correct channel handle/profile name.
* **AC-103-3:** **Edge Case:** If OAuth is cancelled by the user during authorization, the system gracefully redirects them back to the settings page displaying an informative warning banner: *"Integration setup cancelled."*

---

### 1.2 EPIC-200: Content Calendar & Planner

#### User Story: US-201 (Calendar Grid)
* **AC-201-1:** The calendar must display monthly, weekly, and daily grid schedules.
* **AC-201-2:** Cards on the calendar must show the target channel logo, a thumbnail of the media, the post status, and the first 40 characters of the caption.
* **AC-201-3:** Clicking a card must open the post details panel in read/edit mode based on user permission.

#### User Story: US-202 (Drag-and-Drop)
* **AC-202-1:** Grabbing a post card and moving it to a new day/time block triggers a background database update.
* **AC-202-2:** The card updates its status visual indicators immediately to match the new scheduled times.
* **AC-202-3:** **Edge Case:** Rescheduling a post scheduled to release in less than 5 minutes throws a locked error dialog and prevents the movement.

#### User Story: US-203 (Post Creation & Previews)
* **AC-203-1:** The post creator supports selecting multiple networks simultaneously.
* **AC-203-2:** A real-time character counter flashes red if the text exceeds 280 characters for Twitter/X.
* **AC-203-3:** Live feeds mockup shows actual preview layouts on tabs for LinkedIn, Twitter, and Facebook.

#### User Story: US-204 (Scheduled Timeline/Queue)
* **AC-204-1:** A filterable list displays all active posts in a sequential timeline order.
* **AC-204-2:** SMMs can sort the timeline by publishing date, channel, or post status.

---

### 1.3 EPIC-300: AI Content Assistant

#### User Story: US-301 (AI Caption Generation)
* **AC-301-1:** Users input a text prompt and receive at least 3 distinct caption suggestions from the AI engine.
* **AC-301-2:** Selecting a tone (e.g., Casual vs. Bold) dynamically alters the vocabulary and style of the output.
* **AC-301-3:** **Edge Case:** Clicking "Generate" when the monthly token quota is exceeded alerts the user: *"AI quota limit reached for this month. Upgrade your plan to unlock more tokens."*

#### User Story: US-302 (Smart Hashtag Suggestions)
* **AC-302-1:** The AI suggests 5-10 hashtags relevant to the generated caption.
* **AC-302-2:** Clicking an individual hashtag automatically appends it to the end of the active post caption with a separating space.

---

### 1.4 EPIC-400: Media Asset Management

#### User Story: US-401 (Media Library upload)
* **AC-401-1:** Users can upload media via drag-and-drop into a browser file zone.
* **AC-401-2:** Uploaded assets are indexed in the workspace library and display filename, size, uploading user, and upload date.
* **AC-401-3:** Users can search media records using custom tags added during or after upload.

#### User Story: US-402 (Media validation)
* **AC-402-1:** The system throws an explicit validation error block and stops upload if an image exceeds 10MB or a video exceeds 150MB.
* **AC-402-2:** Supported extensions are restricted to `.jpg`, `.jpeg`, `.png`, `.webp`, `.mp4`, `.mov`.

---

### 1.5 EPIC-500: Team Collaboration & Approval Workflow

#### User Story: US-501 (Status submission)
* **AC-501-1:** Editors can transition a draft to `PENDING_REVIEW` via the status button.
* **AC-501-2:** Transitioning status triggers an email/in-app alert to all users with `APPROVER` or `ADMIN` roles in that workspace.

#### User Story: US-502 (Approval Gate)
* **AC-502-1:** Approvers can click "Approve" (updating status to `APPROVED`) or "Reject" (updating status to `DRAFT`).
* **AC-502-2:** A post in `APPROVED` status cannot be modified by an Editor unless reverted back to `DRAFT` status.
* **AC-502-3:** **Edge Case:** If an editor attempts to edit a post that is within 10 minutes of its publishing runtime, the update fails with an error: *"This post is locked for publishing and cannot be modified."*

#### User Story: US-503 (Contextual Comments)
* **AC-503-1:** Any member of the workspace can post text replies in the comment drawer of a post card.
* **AC-503-2:** Comments render instantly for other online users viewing the same card via WebSocket connection.

---

### 1.6 EPIC-600: Analytics & Performance Reports

#### User Story: US-601 (Metrics Dashboard)
* **AC-601-1:** The metrics page must display graphs mapping follower count growth, impressions, and click rates over 7, 30, and 90-day increments.
* **AC-601-2:** Individual posts show a breakdown detailing total views, replies, likes, and shares.

#### User Story: US-602 (Export Reports)
* **AC-602-1:** SMMs can click "Export Report" to request a PDF file summarizing the workspace performance.
* **AC-602-2:** The system delivers the compiled PDF via email attachment or secure download link within 60 seconds.

---

## 2. Functional Requirements Verification Checklist

| ID | Verification Step | Target Feature | Expected Behavior | Passed (Y/N) |
| :--- | :--- | :--- | :--- | :---: |
| **CK-FR-101** | Connect LinkedIn account using OAuth 2.0 flow. | FEAT-102 | Access token received and encrypted securely in database. | [ ] |
| **CK-FR-102** | Validate character counts across multiple channels. | FEAT-202 | Inputting 285 chars flags Twitter layout as invalid while leaving LinkedIn valid. | [ ] |
| **CK-FR-103** | Schedule post queue processing execution. | FEAT-202 | Worker successfully picks up approved post and issues post request to target APIs at `scheduled_time`. | [ ] |
| **CK-FR-104** | Revoke Social Channel. | FEAT-101 | Deleting connection deletes database credentials and prevents any future publishing attempts. | [ ] |
| **CK-FR-105** | Drag and drop rescheduling. | FEAT-201 | Dragging a post from June 4 to June 6 updates post records `scheduled_time` to same hour on June 6. | [ ] |
| **CK-FR-106** | Generative AI prompt construction. | FEAT-301 | Call to Gemini engine returns structured suggestions matching selected tone. | [ ] |
| **CK-FR-107** | Image file limit validation. | FEAT-401 | Uploading a 15MB file halts execution with size warning. | [ ] |
| **CK-FR-108** | Locked post protection. | FEAT-501 | Attempting to update a post status in background within 10 minutes of schedule rejects the operation. | [ ] |

---

## 3. UI/UX Verification Checklist

| ID | Check Item | Target standard | Expected Behavior | Passed (Y/N) |
| :--- | :--- | :--- | :--- | :---: |
| **CK-UI-001** | Responsiveness | Mobile & Tablet Layouts | Page scales down to 360px width without layout overlap. Sidebar converts to collapsible bottom navigation. | [ ] |
| **CK-UI-002** | Status Colors | Calendar Cards | Color indicators match: Grey = Draft, Yellow = Pending, Green = Approved/Scheduled, Blue = Published, Red = Failed. | [ ] |
| **CK-UI-003** | Live Preview Simulators | Mockup layouts | Feed preview displays custom cards mimicking Instagram, Twitter, and LinkedIn UI styling. | [ ] |
| **CK-UI-004** | Interactive States | Buttons & Calendar cards | Active hover states scale card up slightly, change background tint, and use pointer icons. | [ ] |
| **CK-UI-005** | Dark Mode Toggle | UI Theme | Clicking theme toggler shifts background colors to dark palette (dark slate/gray) and updates text colors to high contrast white. | [ ] |
| **CK-UI-006** | Spinner Indicators | Async Actions | Uploading media, executing AI queries, or saving settings displays loading spinner overlays. | [ ] |

---

## 4. Security Verification Checklist

| ID | Check Item | Target Requirement | Expected Behavior | Passed (Y/N) |
| :--- | :--- | :--- | :--- | :---: |
| **CK-SEC-001** | Encryption-at-Rest | Access token storage | SQL queries directly examining credentials table return only encrypted strings, never plaintext OAuth tokens. | [ ] |
| **CK-SEC-002** | Workspace Isolation | Endpoint Authorization | Logged-in User A attempts to edit a post belonging to Workspace B via API request manipulation and receives a `403 Forbidden` error. | [ ] |
| **CK-SEC-003** | JWT Expiration | Login Token | JWT tokens expire after 24 hours. Expired tokens yield a `401 Unauthorized` response. | [ ] |
| **CK-SEC-004** | Media Library URLs | S3 Signed URLs | S3 download references expire after 1 hour, preventing leaked URLs from being accessed indefinitely. | [ ] |
| **CK-SEC-005** | CSRF and CORS controls | API Endpoints | Non-whitelisted domain origins attempting calls to backend controllers are rejected at CORS validation level. | [ ] |

---

## 5. Performance Verification Checklist

| ID | Check Item | Threshold | Validation Metric | Passed (Y/N) |
| :--- | :--- | :--- | :--- | :---: |
| **CK-PERF-001** | Page Load Time | Initial Bundle load | Webpage loads first paint in under 1.5 seconds on a simulated 3G/Slow-network connection. | [ ] |
| **CK-PERF-002** | API Gateway Latency | Database Read/Write | Calendar API query fetching 100 scheduled posts responds in under 150ms. | [ ] |
| **CK-PERF-003** | Queue Concurrency | Bulk Post scheduling | 5,000 concurrently scheduled posts are dispatched to external APIs by workers within 60 seconds. | [ ] |
| **CK-PERF-004** | Client-Side Compression | Image Uploads | Uploading a raw 8MB image optimizes and resizes it client-side before S3 execution, resulting in less than 2MB uploaded size. | [ ] |

---

## 6. Testing Requirements

### 6.1 Automated Testing Matrix
* **T-001 (Unit Tests):**
  * Target coverage: **Minimum 80% coverage** on database helpers, model relations, and state transition machines.
  * Execute via: `npm run test:unit`
* **T-002 (Integration Tests):**
  * Cover validation rules for content platform limits (caption sizes, media combinations).
  * Mock external API calls (LinkedIn, Twitter, Meta) to guarantee post scheduler logic transitions state appropriately on success and failure (e.g. mock 200 OK vs mock 401/403/429 errors).
  * Execute via: `npm run test:integration`
* **T-003 (End-to-End Tests):**
  * User flows testing from login, workspace creation, drafting, generating via mock AI, submitting for approval, approving, and checking calendar queue entry.
  * Automated browser testing tools: Playwright/Cypress.
  * Execute via: `npm run test:e2e`
* **T-004 (Load & Performance Testing):**
  * Run mock scenarios mimicking 500 concurrent SMMs dragging calendar items simultaneously.
  * Tools: K6 or Artillery.

---

## 7. Launch Readiness Checklist

Before moving CreatorSuite to production environment:

- [ ] **CK-LNC-001:** Production certificates for SSL/TLS are active and autogrant renewal (Let's Encrypt / AWS ACM).
- [ ] **CK-LNC-002:** Production-tier APIs for Meta, LinkedIn, and Twitter/X are approved from sandbox to active status.
- [ ] **CK-LNC-003:** Database migration scripts have run on production PostgreSQL cluster and data validation matches.
- [ ] **CK-LNC-004:** Environmental secrets (OAuth client keys, AES master key, DB connections, AI engine tokens) are imported to safe server config key vaults.
- [ ] **CK-LNC-005:** Automated backup frequency is scheduled (daily snapshots with 30-day retention).
- [ ] **CK-LNC-006:** Sentry or Datadog alert reporting is initialized and integrated with SMM channels.
- [ ] **CK-LNC-007:** Stripe payment webhook connections are validated against the live billing endpoint.

---

## 8. Definition of Done (DoD)

A task/feature is considered "Done" and ready for staging deployment when it satisfies:

1. **Code Quality:** Code passes linter checks (`npm run lint`) and meets architectural guidelines. No console logs or debug configurations in final code.
2. **Review:** Peer review approval from at least one Senior Developer.
3. **Tests:** All Unit, Integration, and E2E checks run green in CI pipeline. Code coverage target of 80% is met.
4. **Security:** Secure code analysis (e.g. Snyk, npm audit) returns 0 critical vulnerabilities.
5. **Documentation:** API endpoints are documented in Swagger/Postman, and code comments are provided for non-obvious logic.
6. **Acceptance:** Manual verification aligns with the corresponding Acceptance Criteria (AC) in this document, verified by QA Lead.
