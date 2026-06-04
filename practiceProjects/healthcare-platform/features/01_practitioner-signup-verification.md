# Feature Specification: Practitioner Signup & License Verification

## Feature ID
`FEAT-101` (Epic: `EPC-001`)

## Purpose
Enable medical professionals to register on the platform, upload credentials (medical license, diplomas, proof of identity), and undergo a mandatory background compliance check. This ensures only qualified, licensed medical professionals can consult with patients.

## User Stories
* **US-101.1:** As a prospective doctor, I want to sign up with my email, input my professional details, and upload my medical board registration certificate, so that I can apply to join the platform.
* **US-101.2:** As a platform admin, I want to receive notifications when a new doctor application is submitted, and view their credentials, so that I can cross-reference with medical board registries and approve/reject their profile.

## Functional Requirements
1. **Multistep Signup Form:** Provide a registration wizard capturing:
   * **Step 1: Account Credentials:** Email, password (hashed using Argon2id), phone number.
   * **Step 2: Professional Details:** First name, last name, primary specialty, secondary specialties, clinic address, gender, languages spoken.
   * **Step 3: Medical Registration:** License state, license number, license expiry date, issuing authority.
   * **Step 4: Document Upload:** PDF/PNG uploads for Medical License, Board Certifications, and Government ID.
2. **Post-Registration State:** Upon submission, the database user role must be set to `doctor` and profile status to `pending_verification`.
3. **Registry Check Linkout:** Generate an automated URL targeting the State Medical Board lookup page pre-filled with the doctor's license parameters to aid admins.
4. **Status Notifications:** Email and SMS updates dispatched when profile transitions from `pending_verification` to `verified` or `rejected`.

## Validation Rules
* **Password Strength:** Must be at least 12 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
* **License Date Check:** License expiry date must be at least 3 months in the future at the time of registration.
* **File Restrictions:** Documents must be in `.pdf`, `.png`, or `.jpeg` formats. Maximum size of 15MB per file.
* **Mandatory Fields:** Check that the license registration number is non-empty and contains alphanumeric characters only.

## Edge Cases
* **Doctor uploads documents and closes tab mid-signup:** Draft is saved in local storage / database under a `draft` status, allowing the doctor to resume signup within 7 days.
* **License expires post-verification:** A nightly CRON job checks all doctors' license expiry dates. Any doctor whose license expires transitions to `expired` status immediately, disabling their profile in search.
* **Multiple registration applications with duplicate license IDs:** The system blocks duplicate license submissions, returning a validation message indicating that the registration is already pending review or verified.

## Dependencies
* **Files Storage:** AWS S3 (with encrypted buckets) to store medical registration documents.
* **Email Gateway:** Twilio SendGrid / AWS SES.
* **Authentication Platform:** Integration with JWT Auth handlers.

## API Requirements

### `POST /api/v1/auth/register/doctor`
* **Security:** Public
* **Payload:**
```json
{
  "email": "dr.robert.chen@bostonclinic.org",
  "password": "SecurePassword123!",
  "first_name": "Robert",
  "last_name": "Chen",
  "specialty": "Cardiology",
  "license_state": "MA",
  "license_number": "MA-908123",
  "license_expiry": "2028-12-31",
  "phone_number": "+16175550192"
}
```
* **Response (201 Created):**
```json
{
  "doctor_id": "doc-robert-chen-77",
  "status": "pending_verification",
  "message": "Account created. Please upload verification files."
}
```

### `POST /api/v1/doctors/:id/documents`
* **Security:** Authenticated (JWT) - Doctor owner only
* **Request:** Multipart Form-Data containing files `license_file` and `id_file`.
* **Response (200 OK):**
```json
{
  "success": true,
  "uploaded_documents": [
    { "type": "license", "url": "https://s3.amazonaws.com/telehealth-docs/licenses/MA-908123.pdf" },
    { "type": "id", "url": "https://s3.amazonaws.com/telehealth-docs/ids/doc-robert-chen-77.pdf" }
  ]
}
```

## Database Impact
* **`users` Table:** Insert user account with role `doctor`.
* **`doctors` Table:** Create record with initial status `pending_verification`.
* **`doctor_documents` Table (New):**
  * `id` (VARCHAR(64), PK)
  * `doctor_id` (VARCHAR(64), FK to `doctors.id`)
  * `document_type` (ENUM('license', 'certification', 'government_id'))
  * `s3_uri` (VARCHAR(512))
  * `uploaded_at` (TIMESTAMP)

## UI Components
* **Doctor Registration Wizard (`SCR-101A`):**
  * Stepper indicating Step 1 to Step 4.
  * Form fields with real-time regex feedback.
  * Drag-and-drop file upload target with file size validation indicator.
  * Loading state overlay disabling submit buttons during upload.

## Security Requirements
* **PHI Isolation:** Verification documents must be stored in a segregated AWS S3 bucket with strict private access policies. Signed temporary URLs (valid for 15 minutes) are generated for admins to review.
* **Rate Limiting:** IP-based rate limiting on the registration endpoint to 5 requests per hour.
* **Malware Scanning:** Uploaded files must be processed by an antivirus scanner before S3 finalization.

## Acceptance Criteria
* **AC-101.1.1:** Verify that registering a doctor profile transitions the database state to `pending_verification` and restricts the profile from appearing in patient searches.
* **AC-101.1.2:** Validate that file uploads exceeding 15MB are rejected by the client and server with a readable error message.
* **AC-101.1.3:** Verify that an expired license date triggers an input validation error preventing signup submission.

## Definition of Done
* Multi-step UI wizard is integrated and matches brand design standards.
* Database schemas and S3 file processors are created and tested.
* Unit test statement coverage for registration routes is ≥ 85%.
* Static code analysis (e.g., SonarQube) verifies zero high-level security bugs.
* Formal QA validation completed on staging environment.
