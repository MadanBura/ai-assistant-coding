# Feature Specification: Patient Consolidated Dashboard

## Feature ID
`FEAT-601` (Epic: `EPC-006`)

## Purpose
Provide patients with a centralized dashboard workspace acting as their health portal. This view displays upcoming appointment links, past consultation summaries, downloadable prescription links, billing invoices, and easy access controls to manage files in their secure EHR vault.

## User Stories
* **US-601.1:** As a patient, I want to see all my upcoming appointments and click a direct join link, so that I don't miss my scheduled consultations.
* **US-601.2:** As a patient, I want to access my past consultation details and download my doctor-signed prescriptions in one place, so that I can manage my recovery.

## Functional Requirements
1. **Aggregated Portal View:** Display a dashboard summary panel including:
   * **Upcoming Appointments:** Cards containing doctor name, specialty, date, and "Join Call" buttons.
   * **Medical Documents Snapshot:** Quick access list showing recently uploaded records and download options.
   * **Prescription Vault:** Quick download links for verified PDFs issued during appointments.
2. **Dynamic "Join Call" Actions:** The portal button changes style and triggers room navigation exactly 10 minutes prior to scheduled start times.
3. **Billing Invoice Grid:** Display transaction summaries detailing appointment date, doctor name, payment amount, and billing status.
4. **Recent Activity History:** A timeline list logging account updates (e.g. "Prescription issued by Dr. Chen on June 4").

## Validation Rules
* **Account Bounds Check:** A patient can only retrieve dashboard listings linked with their specific `patient_id`.
* **Appointment Link Control:** The "Join Call" action is disabled if the appointment status is not `confirmed`.
* **Prescription Download Verification:** Verify patient ownership of the parent appointment before generating prescription PDF download links.

## Edge Cases
* **Patient has no appointments or records booked:** **Rule:** Avoid displaying empty screen areas. Render placeholder cards with descriptive copy ("No upcoming consultations. Need to consult a doctor? Search specialties.") and a primary CTA search button.
* **Appointment is canceled by the doctor post-payment:** **Rule:** The portal automatically updates the card status, replaces the "Join Call" action button with a warning label ("Canceled - Refund Issued"), and highlights alternative dates.
* **Patient downloads prescription on mobile device:** **Rule:** PDF downloads must trigger system-level sharing panels or native PDF viewers safely without page crashes.

## Dependencies
* **Frontend Router:** Next.js Router / React Router.
* **EHR Vault Module:** FEAT-401 backend APIs.
* **Payment Engine:** FEAT-501 backend APIs.

## API Requirements

### `GET /api/v1/patients/:id/dashboard`
* **Security:** Authenticated (JWT) - Patient Owner or Admin
* **Response (200 OK):**
```json
{
  "patient_id": "pat-120938",
  "upcoming_appointments": [
    {
      "appointment_id": "appt-449102",
      "doctor_name": "Dr. Robert Chen",
      "specialty": "Cardiology",
      "scheduled_time": "2026-06-05T09:30:00Z",
      "status": "confirmed",
      "join_enabled": true
    }
  ],
  "recent_prescriptions": [
    {
      "prescription_id": "rx-772918",
      "doctor_name": "Dr. Robert Chen",
      "issued_date": "2026-06-04T16:30:00Z",
      "diagnosis": "Hypertension Stage II"
    }
  ],
  "recent_vault_documents": [
    { "document_id": "doc_991238", "document_name": "Blood_Test_May_2026.pdf", "uploaded_at": "2026-06-04T16:12:00Z" }
  ]
}
```

## Database Impact
* **Read Queries:** Reads from `appointments`, `ehr_documents`, and `prescriptions` tables using patient ID filters.
* **Indexes Needed on tables:** Ensure `patient_id` holds indexes on all three target tables to ensure sub-100ms dashboard compilation queries.

## UI Components
* **Patient Dashboard Portal (`SCR-103`):**
  * Profile Overview Widget showing avatar and user metrics.
  * Active Appointments Carousel displaying upcoming slots.
  * Interactive Timeline Widget logging recent updates.
  * Data grid table compiling prescriptions, vault files, and billing entries.

## Security Requirements
* **Session Verification:** Access to dashboard data is restricted via JWT token checks.
* **Cross-Tenant Defenses:** Validate that the requester patient ID corresponds with the target URL path parameter, preventing ID enumeration attacks.

## Acceptance Criteria
* **AC-601.1.1:** Verify that the "Join Call" button transitions to active state exactly 10 minutes prior to scheduled start.
* **AC-601.1.2:** Validate that the layout adjusts to mobile viewport specifications without cutting text.
* **AC-601.2.1:** Verify that clicking prescription items successfully generates secure download links.

## Definition of Done
* Dashboard responsive layout templates styled.
* Multi-table read compiler APIs written and tested.
* JWT verification checks configured on dashboard endpoints.
* Mobile device layouts verified in emulator.
* QA smoke testing checks pass.
