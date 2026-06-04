# Feature Specification: Back-Office Admin Operations

## Feature ID
`FEAT-701` (Epic: `EPC-007`)

## Purpose
Provide administrative staff with an operations dashboard to audit doctor applications, review uploaded medical credentials, approve/reject profiles, manage flagged reviews, and process escrow disputes/refunds.

## User Stories
* **US-701.1:** As an admin, I want to see a list of all doctor applications pending verification, so that I can audit them.
* **US-701.2:** As an admin, I want to approve a doctor's credentials or reject them with a custom reason, so that the registration pipeline is completed.
* **US-701.3:** As an admin, I want to override escrow payments to trigger refunds for disputed patient appointments, so that patient satisfaction is maintained during technical issues.

## Functional Requirements
1. **Admin Workspace Console:** A secure dashboard restricted to users with the `admin` role.
2. **Pending Registrations Queue:** A sortable data table displaying pending applications with doctor details, license numbers, and quick access buttons to download verification PDFs.
3. **Approval and Rejection Engine:**
   * **Approve action:** Sets doctor's status to `verified`, indexes the doctor profile in search, and sends an activation email.
   * **Reject action:** Opens a modal requesting rejection reason (from a dropdown list + custom comment), sets status to `rejected`, and sends a rejection email.
4. **Escrow Dispute Management:** Allows admins to search transactions by `appointment_id`, read session logs/connection details, and manually override the Stripe hold to trigger a 100% or 50% refund to the patient.
5. **System Audit Logs:** Log all administrative updates in a read-only database table.

## Validation Rules
* **Rejection Reason Mandatory:** Rejection comments must be non-empty and minimum of 20 characters if "Other" is chosen in the dropdown.
* **Role Check:** Every HTTP request to admin endpoints must validate that the token subject holds the `admin` role.
* **Escrow Override Bounds:** Admin refund overrides can only be processed on transactions in `held_in_escrow` or `disputed` status. Once funds are captured to the doctor's wallet, direct escrow refund overrides are blocked.

## Edge Cases
* **Admin rejects a doctor who already has bookings:** (Can occur if a doctor is re-audited after verification changes). **Rule:** Block future search discovery, and trigger automated emails notifying existing patients of rescheduling options.
* **Admin executes a refund override at the exact moment of Stripe auto-capture:** **Rule:** DB transaction utilizes a database row lock (`FOR UPDATE`) on the transaction record. If capture starts, the refund action is rejected with a message to contact Stripe support manually.
* **Admin session timeout during review:** If the session expires, form drafts must be stored locally in sessionStorage so no data is lost upon re-authentication.

## Dependencies
* **Auth System:** Role-Based Access Control (RBAC) verification middleware.
* **Payment API:** Stripe Connect (Refund endpoint).
* **Search Integration:** Elasticsearch re-indexing dispatcher.

## API Requirements

### `GET /api/v1/admin/doctors/pending`
* **Security:** Authenticated (JWT) - Admin role required
* **Response (200 OK):**
```json
{
  "total_records": 1,
  "data": [
    {
      "doctor_id": "doc-robert-chen-77",
      "name": "Robert Chen",
      "specialty": "Cardiology",
      "license_state": "MA",
      "license_number": "MA-908123",
      "uploaded_documents": [
        { "type": "license", "url": "https://s3.amazonaws.com/telehealth-docs/licenses/MA-908123.pdf?sig=..." }
      ],
      "registered_at": "2026-06-04T16:12:00Z"
    }
  ]
}
```

### `POST /api/v1/admin/doctors/:id/verify`
* **Security:** Authenticated (JWT) - Admin role required
* **Request:**
```json
{
  "action": "approve" 
}
```
* **Response (200 OK):**
```json
{
  "doctor_id": "doc-robert-chen-77",
  "status": "verified",
  "activated_at": "2026-06-04T16:18:00Z"
}
```

### `POST /api/v1/admin/payments/override-refund`
* **Security:** Authenticated (JWT) - Admin role required
* **Request:**
```json
{
  "appointment_id": "appt-449102",
  "refund_percentage": 100,
  "reason_code": "DISPUTE_TECHNICAL_FAILURE",
  "admin_notes": "Patient reported dropped video feed. Verified Agora logs showing doctor did not connect."
}
```
* **Response (200 OK):**
```json
{
  "transaction_id": "tx_stripe_8819238",
  "refund_status": "succeeded",
  "refunded_amount_usd": 150.00
}
```

## Database Impact
* **`doctors` Table:** Status column updated to `verified` or `rejected`.
* **`appointments` Table:** Status updated to `canceled` (if canceled due to profile rejection).
* **`admin_audit_logs` Table (New):**
  * `id` (VARCHAR(64), PK)
  * `admin_id` (VARCHAR(64))
  * `target_id` (VARCHAR(64)) - ID of target entity (doctor, transaction, review)
  * `action` (VARCHAR(128)) - e.g., 'VERIFY_DOCTOR', 'REFUND_TRANSACTION'
  * `details` (JSONB) - Changes committed and notes
  * `created_at` (TIMESTAMP)

## UI Components
* **Admin Verification View (`SCR-701A`):**
  * Data grid listing pending applications with paging.
  * Preview Pane displaying credentials side-by-side with state board lookups.
  * "Approve" button (Green, triggers confirm modal).
  * "Reject" button (Red, opens rejection reason form modal).
* **Admin Escrow Dispute Panel (`SCR-701B`):**
  * Search bar querying transactions.
  * Detailed invoice layout with patient-doctor logs.
  * "Issue Manual Refund" button.

## Security Requirements
* **MFA for Admins:** Admin dashboard access requires MFA verification.
* **Document Signed URLs:** AWS S3 access configurations must require HMAC signature verification. URLs must expire in 15 minutes.
* **Audit Trail Immutability:** The `admin_audit_logs` table must restrict UPDATE and DELETE operations via PostgreSQL triggers or application-level rules.

## Acceptance Criteria
* **AC-701.1.1:** Verify that only authenticated users with the `admin` role can access `/api/v1/admin/*` endpoints; others must receive a 403 Forbidden.
* **AC-701.1.2:** Validate that approving a doctor shifts their status to `verified` and immediately pushes their details to the Elasticsearch index.
* **AC-701.1.3:** Verify that a dispute refund updates the transaction state to `refunded` in the database and dispatches the refund request to Stripe.

## Definition of Done
* Security middleware limits access to admins only.
* S3 Document viewer generates temporary secure links successfully.
* Database auditing scripts are implemented and verified.
* Postman validation scripts cover admin endpoints successfully.
* Verification workflow signed off by Product Operations.
