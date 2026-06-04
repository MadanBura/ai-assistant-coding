# Feature Specification: Patient Secure EHR Vault

## Feature ID
`FEAT-401` (Epic: `EPC-004`)

## Purpose
Provide patients with a highly secure storage system (EHR Vault) to upload, organize, and manage their medical history, blood tests, and imaging files. The system must support document access control permissions, allowing patients to share specific records with doctors for a limited duration.

## User Stories
* **US-401.1:** As a patient, I want to upload PDF and image records of my past medical tests, so that I have a digital repository of my health history.
* **US-401.2:** As a patient, I want to grant my consulting doctor access to my medical reports, and have that access expire automatically after 48 hours.

## Functional Requirements
1. **EHR Document Uploader:** Support multipart file uploads for PDFs, PNGs, and JPEGs.
2. **Database Hash Registry:** Compute the SHA256 checksum hash of the document upon receipt. Verify file integrity and block identical duplicate uploads.
3. **Access Control List (ACL) Rules Engine:** Patients can toggle access permissions for specific doctor IDs.
4. **Auto-Revocation Cron Service:** A background daemon monitors the access logs. When `current_time > appointment_end_time + 48 hours`, any temporary document access grants created for the consultation must be deleted.
5. **Secure Downloader:** Deliver temporary AWS S3 signed URLs (valid for 15 minutes) for verified download requests.

## Validation Rules
* **File Signature Validation:** Intercept file uploads and perform magic number verification (header validation) on the server to block disguised executable files.
* **File Size Constraint:** Reject files larger than 15MB.
* **Allowed Extensions:** Whitelist `.pdf`, `.png`, `.jpeg`, `.jpg`. Reject all other file formats.

## Edge Cases
* **Patient deletes a document that is linked to a past consultation:** **Rule:** Deletion is soft-deleted. The document is hidden from the patient dashboard, but the physical file is preserved in storage under an archived state for 7 years to satisfy medical audit regulations.
* **Doctor tries to access file after patient revokes permission mid-call:** **Rule:** The S3 URL generation requests require a live validation step checking active database permissions. If revoked, the next request throws HTTP 403 Forbidden.
* **Simultaneous file uploads exceeding user storage limits:** Standard patient vault storage is capped at 500MB. If uploads exceed this, return a warning explaining that storage limits have been reached.

## Dependencies
* **Files Storage:** AWS S3 (KMS Server-Side Encryption).
* **Metadata Database:** PostgreSQL (JSONB fields for ACL storage).
* **Malware Scanner:** ClamAV Daemon integration for file scanning.

## API Requirements

### `POST /api/v1/ehr/upload`
* **Security:** Authenticated (JWT) - Patient Only
* **Request:** Multipart Form-data (`document_file`, `document_name`)
* **Response (201 Created):**
```json
{
  "document_id": "doc_991238",
  "document_name": "Blood_Test_May_2026.pdf",
  "file_size_bytes": 1420193,
  "sha256_hash": "b5bb9d8014a0f9b1d61e21e796...",
  "uploaded_at": "2026-06-04T16:12:00Z"
}
```

### `POST /api/v1/ehr/permissions/grant`
* **Security:** Authenticated (JWT) - Patient Only
* **Payload:**
```json
{
  "document_id": "doc_991238",
  "doctor_id": "doc-robert-chen-77",
  "access_type": "temporary_48h",
  "appointment_id": "appt-449102"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "permission_expires_at": "2026-06-07T09:30:00Z"
}
```

### `GET /api/v1/ehr/documents/:id/download`
* **Security:** Authenticated (JWT) - Patient Owner or Authorized Doctor
* **Response (200 OK):**
```json
{
  "document_id": "doc_991238",
  "download_url": "https://telehealth-encrypted-bucket.s3.amazonaws.com/files/doc_991238.pdf?AWSAccessKeyId=...&Signature=...&Expires=1780652700"
}
```

## Database Impact
* **`ehr_documents` Table (New):**
  * `id` (VARCHAR(64), PK)
  * `patient_id` (VARCHAR(64), FK to `users.id`, Indexed)
  * `document_name` (VARCHAR(255))
  * `s3_object_uri` (VARCHAR(512))
  * `file_hash` (VARCHAR(64))
  * `file_size` (INT)
  * `is_archived` (BOOLEAN, Default: False)
  * `uploaded_at` (TIMESTAMP)
* **`ehr_permissions` Table (New):**
  * `id` (BIGINT, PK, Auto Increment)
  * `document_id` (VARCHAR(64), FK to `ehr_documents.id`)
  * `doctor_id` (VARCHAR(64), FK to `users.id`, Indexed)
  * `appointment_id` (VARCHAR(64), FK to `appointments.id`, Nullable)
  * `expires_at` (TIMESTAMP, Nullable)
  * `created_at` (TIMESTAMP)

## UI Components
* **Patient EHR Vault Dashboard (`SCR-103`):**
  * Drag-and-drop file uploader area with file upload status bars.
  * Document catalog table with column filters (Sort by: Date, Name, Doctor Shared).
  * Share Manager Modal showing lists of active doctors and toggle checkboxes next to access durations.

## Security Requirements
* **SSE-KMS Encryption:** All S3 objects must employ AWS KMS CMKs.
* **Malware Quarantine Block:** If malware scan fails, quarantine the upload and alert security admins.
* **Data Flow Audit Logs:** Write an audit log entry for every signature validation or URL generation event.

## Acceptance Criteria
* **AC-401.1.1:** Verify S3 upload generates an encrypted object and records checksum in the metadata database.
* **AC-401.1.2:** Validate that uploads containing non-whitelisted headers (such as `.exe` files renamed to `.pdf`) are blocked.
* **AC-401.2.1:** Verify that the access check endpoint returns HTTP 403 Forbidden 48 hours after the consultation's scheduled completion time.

## Definition of Done
* Multipart S3 file upload configurations completed.
* ClamAV / Virus scanning integration configured on routes.
* DB migration and Postgres permissions table created.
* Access validation middleware unit tests covered at 90%.
* Verification of access expiration via cron verified in test sandbox.
