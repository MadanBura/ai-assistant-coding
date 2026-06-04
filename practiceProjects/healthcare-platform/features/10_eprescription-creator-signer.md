# Feature Specification: E-Prescription Creator & Signer

## Feature ID
`FEAT-402` (Epic: `EPC-004`)

## Purpose
Enable authorized medical practitioners to write, validate, and cryptographically sign digital prescription forms during or immediately after a video consultation. Signed prescriptions are rendered into secure, read-only PDF format containing verification hashes for pharmacies to reference.

## User Stories
* **US-402.1:** As a doctor, I want to create a digital prescription form containing medication names, dosage parameters, and instructions, so that I can send it to my patient immediately.
* **US-402.2:** As a doctor, I want to sign the prescription using a security code, so that the document is legally binding and verified.

## Functional Requirements
1. **Prescription Builder Form:** Interactive UI fields targeting:
   * **Diagnosis:** Core clinical diagnostic summary text.
   * **Medication Line Items:** Auto-complete medication search (generic & brand names), dosage, frequency, route of administration, duration, and quantity/refill limits.
   * **Doctor Digital Seal:** Automatic pre-population of doctor registration ID, clinic address, phone, and contact details.
2. **Cryptographic Signing Engine:** Before finalizing, the doctor must input a verification code (SMS OTP or token). The system hashes the prescription payload, signs it using the doctor's private signature keys, and appends a verification hash.
3. **Immutable PDF Generation:** Render the finalized prescription to a read-only PDF containing a verification QR code linking to the platform's verification portal.
4. **Patient Access Lock:** Patients cannot modify or delete prescription documents; they are read-only downloads.

## Validation Rules
* **Medication Input Integrity:** Each prescription must contain at least one medication entry with non-empty fields for dosage and duration.
* **Sign Deadline Limit:** Prescription generation is blocked once 4 hours have elapsed after the consultation end time.
* **MFA Validation:** The digital signature is blocked if the verification OTP input does not match the active Redis record.

## Edge Cases
* **Doctor makes a mistake post-signing:** **Rule:** Signed prescriptions are immutable and cannot be edited. The doctor must invalidate the original prescription by calling `/prescriptions/:id/invalidate` (marking status as `revoked`) and generate a new one.
* **Offline signature buffer sync:** If network connection fails during signature submittal, the local client cache holds the payload state, warning the doctor to keep the window open until network restores and verifies the signature on the server.
* **Cross-state licensing conflict:** (Relevant for multi-state practitioners). **Rule:** System validates that the doctor's licensing state matches the patient's state profile address before issuing. If mismatching, warn the doctor prior to completion.

## Dependencies
* **PDF Builder Engine:** PDFKit or Puppeteer (headless generator).
* **MFA Services:** Auth0 or Twilio Verify (for OTP verification).
* **Signing Library:** Web Crypto API or Node `crypto` library.

## API Requirements

### `POST /api/v1/prescriptions`
* **Security:** Authenticated (JWT) - Doctor Only
* **Payload:**
```json
{
  "appointment_id": "appt-449102",
  "diagnosis": "Hypertension Stage II",
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily in the morning",
      "duration_days": 90,
      "refills": 2
    }
  ]
}
```
* **Response (201 Created):**
```json
{
  "prescription_id": "rx-772918",
  "status": "draft",
  "requires_signature": true
}
```

### `POST /api/v1/prescriptions/:id/sign`
* **Security:** Authenticated (JWT) - Doctor Owner Only
* **Payload:**
```json
{
  "otp_token": "887321"
}
```
* **Response (200 OK):**
```json
{
  "prescription_id": "rx-772918",
  "status": "signed_and_issued",
  "digital_signature_hash": "sha256-df30ba2491fae29c8821a8d11c...",
  "pdf_download_url": "https://telehealthconnect.com/download/rx/rx-772918.pdf"
}
```

## Database Impact
* **`prescriptions` Table (New):**
  * `id` (VARCHAR(64), PK)
  * `appointment_id` (VARCHAR(64), FK to `appointments.id`, Unique)
  * `doctor_id` (VARCHAR(64), FK to `users.id`)
  * `patient_id` (VARCHAR(64), FK to `users.id`)
  * `diagnosis` (TEXT)
  * `status` (ENUM('draft', 'signed_and_issued', 'revoked'))
  * `signature_hash` (VARCHAR(255), Nullable)
  * `signed_at` (TIMESTAMP, Nullable)
  * `created_at` (TIMESTAMP)
* **`prescription_medications` Table (New):**
  * `id` (BIGINT, PK, Auto Increment)
  * `prescription_id` (VARCHAR(64), FK to `prescriptions.id`)
  * `medication_name` (VARCHAR(255))
  * `dosage` (VARCHAR(128))
  * `frequency` (VARCHAR(128))
  * `duration_days` (INT)
  * `refills` (INT, Default: 0)

## UI Components
* **E-Prescription Composer Panel (`SCR-102D`):**
  * Modal drawer sliding over consultation page.
  * Dynamically added form row components for multiple medication slots.
  * "Request Sign Verification Code" button.
  * Digit-entry modal interface for inputting the SMS OTP code.
  * PDF print preview container.

## Security Requirements
* **Immutability Guard:** PDF documents are generated via headless servers. Once created, files are locked down via AWS S3 Object Lock policies in Compliance mode, preventing alteration or deletion.
* **Verification QR Code:** QR code contents must embed a secure lookup path: `https://telehealthconnect.com/verify-prescription?hash=sha256-signature...`

## Acceptance Criteria
* **AC-402.1.1:** Verify that creating a prescription associates the record with the correct patient and doctor IDs in Postgres.
* **AC-402.1.2:** Validate that the system blocks new prescription submissions if more than 4 hours have passed since the appointment's scheduled completion.
* **AC-402.2.1:** Verify that entering an invalid MFA OTP rejects the signing action with a 400 Bad Request.

## Definition of Done
* PDF template engine layouts completed.
* Cryptographic signature generator modules implemented and tested.
* S3 bucket storage locks configured.
* UI composer component integrated with the video interface.
* QA testing verifies immutable properties of issued records.
