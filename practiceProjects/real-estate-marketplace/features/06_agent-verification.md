# Feature Specification: Agent Verification System

## 1. Feature Info
* **Feature ID:** `FT-1.2`
* **Priority:** 6 (Agent Credentialing Pipeline)
* **Title:** Agent Verification System

---

## 2. Purpose
Provides agents with a system to upload license details and structural proof (PDF scans of licensing documents). Submitted accounts are locked in a review state for administrators, ensuring credentials are valid before agents receive a trust badge and unlimited listings.

---

## 3. User Stories
* **US-1.3:** As an Agent, I want to submit my real estate license numbers and brokerage details so that I can establish my credentials.
* **US-1.4:** As an Agent, I want to view my profile verification status (Pending/Verified/Rejected) so that I know when I am authorized to publish listings.

---

## 4. Functional Requirements

### FR-102.1: License Submission Interface
* **Description:** Input form fields: License ID (String), Issuing State (String), Brokerage Firm (String), and License Document file upload.
* **Requirements:** Document file must be stored in a secure bucket, generating a temporary presigned URL on query.

### FR-102.2: Verification State Machine
* **Description:** Track user verification states:
  * `UNVERIFIED` (Initial state)
  * `PENDING_VERIFICATION` (Form submitted, awaiting Admin audit)
  * `VERIFIED` (Approved by Admin, adds profile verification badge)
  * `REJECTED` (Rejected by Admin, profile remains restricted)

### FR-102.3: System Capabilities Boundary
* **Description:** While state is `UNVERIFIED` or `PENDING_VERIFICATION`, listing uploads must be restricted to standard Owner limits (max 2 active listings). Once `VERIFIED`, listing caps are lifted.

---

## 5. Validation Rules
* **VAL-102.1 (Document Constraints):** Uploaded files must match PDF, JPG, JPEG, or PNG, with a maximum size of 5MB.
* **VAL-102.2 (Verification Lock):** If the status is `PENDING_VERIFICATION`, the submission form must be disabled, preventing agents from overriding fields during active reviews.

---

## 6. Edge Cases
* **Edge Case 1: Post-Verification Modifications:** An approved Agent edits their License ID or Issuing State to update outdated records.
  * *Resolution:* Updating license credentials immediately changes status to `PENDING_VERIFICATION`, hiding the verified badge and applying Owner listing restrictions until admin re-approval.
* **Edge Case 2: Rejected Verification Re-Submission:** If verification is set to `REJECTED`, the system must email the agent detailing the admin's rejection notes, allowing them to re-edit and submit updated credentials.

---

## 7. Dependencies
* **Upstream:** `FT-1.1` (Auth), `FT-2.1` (Properties cap controls).
* **Downstream:** `FT-6.1` (Admin moderation dashboard).

---

## 8. API Requirements

### Submit Agent Verification
* **Endpoint:** `POST /api/v1/agents/verify`
* **Headers:** `Authorization: Bearer <token>`
* **Request Format:** Multipart Form Data
* **API Fields:** `licenseNumber` (String, required), `licenseState` (String, required), `brokerageName` (String, required), `verificationDocument` (File, required).
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "PENDING_VERIFICATION",
    "updatedAt": "2026-06-04T18:31:30Z"
  }
}
```

### Get Verification Status
* **Endpoint:** `GET /api/v1/agents/status`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "PENDING_VERIFICATION",
    "licenseNumber": "RE-00921-X",
    "rejectionNotes": null
  }
}
```

---

## 9. Database Impact
* **Target Table:** `USER` (Updates status and credential details fields).
* **New Database Columns:**
  * `license_number` (VARCHAR, Nullable)
  * `license_state` (VARCHAR, Nullable)
  * `brokerage_name` (VARCHAR, Nullable)
  * `verification_document_url` (VARCHAR, Nullable)
  * `verification_status` (ENUM: `UNVERIFIED`, `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`, default: `UNVERIFIED`)

---

## 10. UI Components
* **Dashboard Verification Banner:** Inline call-to-action warning user that their account is unverified, referencing restrictions.
* **Drag-and-Drop File Box:** Visual container with helper icons representing document state.
* **Status Badge:** A prominent badge element located adjacent to the agent name across public and private headers:
  * Yellow badge for `PENDING_VERIFICATION`.
  * Green badge for `VERIFIED`.
  * Red badge for `REJECTED`.

---

## 11. Security Requirements
* **SEC-102.1 (Storage Confidentiality):** S3 bucket objects containing agent certificates must be set to `private`. Access requests must authenticate through JWT middleware, fetching documents via short-lived (15-minute) presigned URLs generated solely for authorized `Admin` sessions.

---

## 12. Acceptance Criteria
* **AC-103:** Verify that uploading credentials larger than 5MB triggers validation errors.
* **AC-104:** Confirm listing creation is restricted to 2 active listings while status is unverified or pending.

---

## 13. Definition of Done
* [ ] Database migration schema updated.
* [ ] Document storage bucket access controls configured.
* [ ] Integration tests verify capability limitations based on user status flags.
