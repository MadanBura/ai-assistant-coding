# Project Completion Criteria & Verification Ledger (KPI.md)
## Project: Healthcare Platform (Telehealth Connect)
**Document Version:** 1.0.0  
**Date:** June 4, 2026  
**Authors:** Quality Assurance Lead & Release Manager  
**Status:** Ready for Review  

---

### Table of Contents
1. [Feature Acceptance Criteria (AC)](#1-feature-acceptance-criteria-ac)
2. [Functional Requirements Checklist (FRC)](#2-functional-requirements-checklist-frc)
3. [User Interface (UI) Checklist (UIC)](#3-user-interface-ui-checklist-uic)
4. [Security & Compliance Checklist (SECC)](#4-security--compliance-checklist-secc)
5. [Performance & Scalability Checklist (PERFC)](#5-performance--scalability-checklist-perfc)
6. [Testing Strategy & Coverage Requirements (TR)](#6-testing-strategy--coverage-requirements-tr)
7. [Launch Readiness Checklist (LRC)](#7-launch-readiness-checklist-lrc)
8. [Definition of Done (DoD)](#8-definition-of-done-dod)

---

### 1. Feature Acceptance Criteria (AC)

These criteria are mapped back to specific system features and stories defined in the [PRD.md](file:///d:/vibeCoding2026/practiceProjects/healthcare-platform/docs/PRD.md) and [BRD.md](file:///d:/vibeCoding2026/practiceProjects/healthcare-platform/docs/BRD.md).

#### 1.1 Epic: Doctor Profile & Registration (EPC-001)
* **AC-101.1 (Credential Upload):**
  * *Method:* Register new doctor profile, input GMC license number, and upload PDF copy of license.
  * *Expected:* Profile database state sets to `pending`. Profile must *not* appear in patient search results.
* **AC-101.2 (Verification Action):**
  * *Method:* Login as admin, navigate to pending doctor registry table, select the profile, and click "Approve".
  * *Expected:* Profile database state transitions to `verified`. Profile is now discoverable in the search index.
* **AC-102.1 (Directory Filters):**
  * *Method:* Query search engine with filters: Specialty: "Cardiology", Min Rating: "4 Stars", Max Price: "$150/hr".
  * *Expected:* Returned list contains only doctors satisfying all three bounds.
* **AC-103.1 (Calendar Rule Editor):**
  * *Method:* Doctor creates availability grid blocking Monday mornings (09:00 - 12:00) and setting slot length to 30 mins.
  * *Expected:* Patient booking calendar shows exactly 6 selectable blocks for Monday afternoon, and 0 for Monday morning.

#### 1.2 Epic: Appointment Scheduling (EPC-002)
* **AC-201.1 (Slot Locking Mechanism):**
  * *Method:* User A clicks Slot X (Monday 14:00). User B attempts to click Slot X simultaneously.
  * *Expected:* User A is directed to payment page. User B sees warning "Slot temporarily reserved" and cannot click the confirm button.
* **AC-201.2 (Lock Expiry):**
  * *Method:* User A locks Slot X but does not make a payment. Wait 10 minutes and 1 second.
  * *Expected:* Redis key expires, slot status resets to `available`, and User B can now select and lock Slot X.

#### 1.3 Epic: Video Consultations (EPC-003)
* **AC-301.1 (Meeting Access Constraints):**
  * *Method:* Patient attempts to join call 15 minutes before the slot time. Patient attempts to join 5 minutes before.
  * *Expected:* 15 minutes early: displays "Call room opens in 5 minutes". 5 minutes early: "Join Room" button activates and connects feed.
* **AC-301.2 (Quality Fallback):**
  * *Method:* Reduce network bandwidth to 250 Kbps during active WebRTC consultation.
  * *Expected:* System automatically disables outgoing HD video feed, transitioning to low-bitrate audio-only feed to maintain connection.

#### 1.4 Epic: EHR & Prescription Management (EPC-004)
* **AC-401.1 (Secure Records Vault):**
  * *Method:* Patient uploads a 10MB test report PDF and toggles permission status: "Dr. Chen - Granted".
  * *Expected:* The S3 object is encrypted at rest using AES-256 keys. Only Dr. Chen's JWT token can download the decrypter key.
* **AC-401.2 (Access Revocation Expiry):**
  * *Method:* Appointment ends at Monday 15:00. Time progresses to Wednesday 15:01. Dr. Chen attempts to retrieve the patient's record.
  * *Expected:* API returns HTTP 403 Forbidden. ACL entry for Dr. Chen is purged by scheduler.
* **AC-402.1 (Prescription E-Signing):**
  * *Method:* Doctor fills out prescription form, submits, and completes MFA token verification.
  * *Expected:* PDF is created with metadata hash, digital signature applied, and stored in database. Editing of the PDF is disabled.

#### 1.5 Epic: Financial Management (EPC-005)
* **AC-501.1 (Escrow Capture Trigger):**
  * *Method:* Appointment marked as `Completed` by doctor. Wait 15 minutes without dispute.
  * *Expected:* Stripe API triggers capture event on the authorization hold, releasing 85% to doctor's balance account and 15% to platform.
* **AC-501.2 (No-Show Refund Rule):**
  * *Method:* Appointment scheduled for 10:00. Patient is present. Doctor has not joined by 10:15.
  * *Expected:* System auto-cancels booking, triggers full refund to patient card, and flags doctor dashboard.

---

### 2. Functional Requirements Checklist (FRC)

Use this checklist during build-stage evaluations:

| Req ID | Requirement Reference | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **FRC-001** | FR-101: License Audit Trail | Change doctor details, check if search visibility is disabled immediately. | [ ] |
| **FRC-002** | FR-103: Dynamic Slot Locking | Run concurrency test using 50 simulated bookings targeting a single slot. Verify exactly 1 success. | [ ] |
| **FRC-003** | FR-201: Reschedule Threshold | Call API `PUT /api/v1/appointments/:id` with rescheduled time inside the 24h window. Verify HTTP 400 response. | [ ] |
| **FRC-004** | FR-202: Concurrent Session Block | Attempt to book 2 overlapping appointments. Confirm database constraint blocks the write. | [ ] |
| **FRC-005** | FR-301: Cryptographic Handshake | Capture WebRTC network logs, inspect JWT signature headers, and ensure token uses SSL. | [ ] |
| **FRC-006** | FR-302: Synchronous Chat Vault | Complete session, check database `consultation_chats` table to verify text data is encrypted. | [ ] |
| **FRC-007** | FR-401: Document Access Expiry | Manually trigger permission expiration cron job. Confirm access permissions are revoked. | [ ] |
| **FRC-008** | FR-402: Digital Signature | Verify issued prescription PDF contains signature hash matching doctor's public key. | [ ] |
| **FRC-009** | FR-501: Escrow Release | Simulate a dispute creation. Check that Stripe escrow release task is paused. | [ ] |

---

### 3. User Interface (UI) Checklist (UIC)

Verify the frontend app satisfies design system consistency:

- [ ] **UIC-001 (Responsive Grid):** All screens are fully responsive, showing no horizontal scrollbars on Apple iPhone (375px), Google Pixel (412px), Apple iPad (768px), or Desktop (1440px).
- [ ] **UIC-002 (Feedback Loaders):** Every button performing write requests transitions to disabled state with a loading spinner (e.g., "Booking..." or "Processing Payment...") until the promise resolves.
- [ ] **UIC-003 (Empty State UI):** Doctor list search shows custom icon and message "No specialists found for your search criteria. Try removing filters." instead of blank space.
- [ ] **UIC-004 (Visual Accessibility):** Text contrast ratio meets WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text).
- [ ] **UIC-005 (Focus Indicators):** Tabbing through forms highlights active inputs with outline highlights to support keyboard-only users.

---

### 4. Security & Compliance Checklist (SECC)

- [ ] **SECC-001 (Zero Trust API):** Verify that all endpoints under `/api/v1/` (except guest endpoints) return `HTTP 401 Unauthorized` when requested without a valid Bearer JWT.
- [ ] **SECC-002 (SQL Injection Safeguard):** Check that all database queries are built using ORM parameters or prepared statements. Verify zero raw concatenation.
- [ ] **SECC-003 (Cross-Site Scripting Mitigation):** Confirm HTML tags are escaped in patient medical notes, reviews, and search boxes. Verify that React/Next.js output escaping is not bypassed.
- [ ] **SECC-004 (CORS Configuration):** Ensure CORS policies on the API gateway permit requests only from whitelisted domain names (e.g., `https://*.telehealthconnect.com`).
- [ ] **SECC-005 (Audit Trail Completeness):** Check that access to any file under `ehr_documents` writes an entry in AWS Cloudwatch with timestamps, actor IDs, and IP addresses.

---

### 5. Performance & Scalability Checklist (PERFC)

| ID | Performance Metric | Condition / Method | SLA / Constraint | Status |
| :--- | :--- | :--- | :--- | :--- |
| **PERFC-001** | Page Load FCP | Lighthouse run on Patient Portal Home. | < 1.5 Seconds | [ ] |
| **PERFC-002** | Search API Latency | 500 concurrent virtual users querying `/api/v1/search`. | P95 < 250ms | [ ] |
| **PERFC-003** | WebRTC Jitter | Measure in-call audio packet variations. | < 30ms | [ ] |
| **PERFC-004** | Index Coverage | Check query plan output (`EXPLAIN ANALYZE`) for database lookups. | 100% Index scan usage (no sequential table scans) | [ ] |
| **PERFC-005** | Document Upload | Upload 15MB file from patient vault page. | Complete upload < 5.0 seconds | [ ] |

---

### 6. Testing Strategy & Coverage Requirements (TR)

#### 6.1 Automated Coverage
* **TR-001 (Unit Testing):**
  * All core libraries, utility helpers, and business calculation algorithms must be covered by unit tests (using Jest or Vitest).
  * Target coverage limit: **≥ 85% statement coverage**.
* **TR-002 (API Integration Testing):**
  * API endpoints must be audited using automated testing collections (Postman/Newman or Supertest).
  * Scope: Happy paths, authentication errors, boundary values, invalid payloads.
* **TR-003 (End-to-End Testing):**
  * Playwright/Cypress tests must run against staging builds to verify complete user flows:
    * Flow 1: Patient registration -> Search -> Appointment booking -> Stripe Checkout -> Confirmed state.
    * Flow 2: Doctor availability setup -> Patient scheduling -> WebRTC Room Join -> E-Sign prescription.

#### 6.2 Manual Testing Scope
* **TR-004 (Cross-Browser Compatibility):**
  * Verify UI alignment, video streaming functionality, and payment flows on:
    * Google Chrome (Version 120+)
    * Apple Safari (Version 17+)
    * Mozilla Firefox (Version 120+)
    * Microsoft Edge (Version 120+)

---

### 7. Launch Readiness Checklist (LRC)

- [ ] **LRC-001 (Domain & SSL):** Production domain `telehealthconnect.com` is configured with TLS 1.3 certificate enabled and auto-renewal checks scheduled.
- [ ] **LRC-002 (Production Secrets):** Verify environment variables in deployment environment contain production credentials only (database, Stripe Live, Auth0 Client IDs, SMTP mailer settings). Development keys are not active.
- [ ] **LRC-003 (Stripe Webhook Registry):** Stripe production webhooks are registered to point to production endpoints and the webhook signature signing keys are configured.
- [ ] **LRC-004 (Database Backups):** Weekly full backups and hourly WAL (Write-Ahead Log) archiving configured to target an isolated, multi-region AWS S3 bucket.
- [ ] **LRC-005 (Monitoring & Alarms):** Sentry error tracker integrated, and alerts configured to trigger email notifications when error rates exceed 1% in a 5-minute interval.
- [ ] **LRC-006** (Disaster Recovery Plan): Written guide on rolling back deployments and restoring Postgres tables inside 30 minutes in case of data corruption.

---

### 8. Definition of Done (DoD)

A user story is considered complete, marked as resolved, and ready to deploy to production only when it satisfies the following items:

* **DOD-001 (Criteria Satisfaction):** The code fully implements all requirements specified by the user story and passes the corresponding Feature Acceptance Criteria (AC).
* **DOD-002 (Code Review):** Code changes are peer-reviewed and approved by at least one senior engineer. No PR can be merged without approval.
* **DOD-003 (Linting & Standards):** The codebase passes the local lint checks (`npm run lint` or `eslint`) with zero errors or warnings, and conforms to coding standards.
* **DOD-004 (Automated Tests Passing):** All unit, integration, and E2E regression tests pass successfully in the CI/CD pipeline.
* **DOD-005 (No Critical Vulnerabilities):** Vulnerability scans (e.g., `npm audit` or Snyk) return zero high or critical security alerts.
* **DOD-006 (Documentation Updated):** API routes added/modified are fully updated in the API specification catalog. Relevant system setup documentation is updated.
* **DOD-007 (QA Sign-off):** The QA Lead has manually validated the feature in the staging sandbox and given a formal sign-off.
