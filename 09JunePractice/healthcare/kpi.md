# KPI and Acceptance Criteria Mapping — healthCare

## Module 1: Doctor Profiles

### M1-F1: Profile Display
- **Acceptance Criteria**:
  - **AC 1 (Information Coverage)**: Given a patient views a verified doctor's public profile page, then the system must display the doctor's full name, credentials/board certifications, specialties, consultation fee per session, physical clinic locations, aggregated rating, all written reviews, and an interactive availability calendar.
  - **AC 2 (Availability Display)**: Given a patient views the doctor's interactive calendar, then the system must display only the slots designated as active and unbooked for the upcoming 14 days.

### M1-F2: Profile Setup & Calendar Configuration
- **Acceptance Criteria**:
  - **AC 1 (Configuration Save)**: Given a logged-in verified doctor is on the schedule settings page, when they specify daily recurring working hours (e.g., 09:00 to 17:00), session durations (e.g., 30 minutes), and consultation fees, then saving must persist the configuration and generate the corresponding open time slots.
  - **AC 2 (Calendar Sync Integration)**: Given a doctor links an external calendar, when a new event is added to the external calendar, then the overlapping slot in the healthCare platform must automatically change status to "Busy" and be hidden from patient search.

---

## Module 2: Appointment Booking

### M2-F1: Slot Reservation Engine
- **Acceptance Criteria**:
  - **AC 1 (Initiate Reservation)**: Given a logged-in patient selects an open slot on a doctor's profile and inputs a visit reason, when they click "Book Appointment", then the system must transition the slot status to "Temporarily Reserved" (5-minute expiration timer) and generate a Stripe checkout session with status `pending_payment`.
  - **AC 2 (Session Expiry Release)**: Given a temporary reservation, when the 5-minute checkout timer expires without payment confirmation, then the system must release the slot status back to "Open" and invalidate the Stripe checkout session.

### M2-F2: Real-time Slot Availability
- **Acceptance Criteria**:
  - **AC 1 (Race Condition Prevention)**: Given two patients concurrently click "Book Appointment" for the exact same slot, when the first patient's request acquires the database row-level lock (via `SELECT FOR UPDATE`), then the second patient's request must immediately fail with an HTTP 409 status code and a message stating: "This slot is no longer available."

### M2-F3: Appointment Cancellation
- **Acceptance Criteria**:
  - **AC 1 (Cancellation Window & Refund)**: Given a patient cancels an appointment more than 24 hours before the scheduled time, when the cancellation request is submitted, then the slot status must transition to "Open", the appointment status must change to `cancelled`, and the Stripe authorization hold must be fully released.
  - **AC 2 (Late Cancellation)**: Given a patient cancels an appointment less than 24 hours before the scheduled time, when the cancellation request is submitted, then the Stripe hold must be fully captured as a late fee, and the appointment status must update to `cancelled_late` with zero refund.

---

## Module 3: Video Consultations

### M3-F1: Embedded Video Room
- **Acceptance Criteria**:
  - **AC 1 (Secure Session Token generation)**: Given a scheduled appointment, when the patient or doctor clicks the dashboard consultation link within 15 minutes of the start time, then the system must verify their identity and issue a secure, time-bound WebRTC session token.
  - **AC 2 (P2P Stream Initialization)**: Given both parties join the video room, when the connection completes, then the system must establish a secure, encrypted peer-to-peer video/audio stream with connection latency under 150ms.

### M3-F2: Reconnection Window
- **Acceptance Criteria**:
  - **AC 1 (Automatic Reconnection Trigger)**: Given an active consultation video call, when one party's internet disconnects, then the system must display a reconnection modal and maintain the WebRTC channel open for exactly 3 minutes.
  - **AC 2 (Timeout Dispute Flag)**: Given a disconnected call does not recover within 3 minutes, when the total elapsed call time prior to disconnect is under 5 minutes, then the system must terminate the session and flag the appointment as `disrupted` in the database.

### M3-F3: Session Logging & Completion
- **Acceptance Criteria**:
  - **AC 1 (Call Termination & Capture)**: Given an active call where the doctor clicks "End Consultation", when the action is executed, then the WebRTC session must terminate, the total call duration must be logged in seconds, and the payment status must transition to capturing the pre-authorized hold.

---

## Module 4: Medical Records

### M4-F1: Secure Upload & Storage
- **Acceptance Criteria**:
  - **AC 1 (Access Logs & Encryption)**: Given a logged-in patient or authorized doctor uploads a diagnostic report or lab result, when the file is processed, then the system must encrypt the file at rest using AES-256, store it securely, and append a read/write trace to the immutable database audit log.
  - **AC 2 (Invalid Access Block)**: Given a doctor who has no current appointment or explicit share consent from a patient attempts to access that patient's records, when the request is sent, then the system must return an HTTP 403 Forbidden error.

### M4-F2: Consent Controls
- **Acceptance Criteria**:
  - **AC 1 (Revoking Access)**: Given a patient changes access rights for a doctor from "Granted" to "Revoked" on their dashboard, when they click "Revoke Access", then the system must invalidate the doctor's access token cache immediately, block any subsequent GET requests by that doctor, and log the revocation event.

---

## Module 5: Prescription Management

### M5-F1: Prescription Issuance
- **Acceptance Criteria**:
  - **AC 1 (Doctor Authorization & Format)**: Given a verified doctor, when they fill out a digital prescription form post-consultation detailing medications (name, dosage, frequency, duration) and click "Sign & Submit", then the system must apply a cryptographic digital signature matching the doctor's credentials and save the record.

### M5-F2: Prescription Download & Access
- **Acceptance Criteria**:
  - **AC 1 (Patient Retrieval)**: Given a patient logged into their dashboard, when they navigate to the prescription tab, then they must see a list of issued prescriptions and be able to download a PDF copy containing the digital signature verification seal.

---

## Module 6: Notifications

### M6-F1: Transactional Alerts
- **Acceptance Criteria**:
  - **AC 1 (Booking Receipt)**: Given a patient completes a booking checkout, when the payment gateway confirms the authorization hold, then the notification engine must trigger an email and SMS containing the receipt and the secure video room URL to the patient within 5 seconds.
  - **AC 2 (Reminders)**: Given an upcoming appointment, when the system time reaches exactly 24 hours and 1 hour prior to the appointment slot, then the system must dispatch SMS and email reminders to both patient and doctor.

---

## Module 7: Payments

### M7-F1: Consultation Fee Authorization Hold
- **Acceptance Criteria**:
  - **AC 1 (Pre-Authorization Hold)**: Given a booking action, when the patient completes checkout via the Stripe interface, then the Stripe API must return a `requires_capture` status code confirming the authorization hold is successfully placed for the exact amount of the consultation fee.

### M7-F2: Charge Capture & Doctor Payouts
- **Acceptance Criteria**:
  - **AC 1 (Capture Charge)**: Given a completed video session status (`completed`), when the background checkout processor runs, then the system must capture the pre-authorized Stripe hold within 2 hours.
  - **AC 2 (Split Payout)**: Given a captured charge, when the system calculates the doctor's earnings, then it must execute a payout routing the consultation fee (minus platform fee) directly to the doctor's connected bank account via Stripe Connect.

### M7-F3: Payment Webhook Reconciler
- **Acceptance Criteria**:
  - **AC 1 (Webhook Reconciliation)**: Given a checkout completes but the server-to-server webhook is delayed, when the client dashboard polls the server status 10 seconds post-checkout, then the backend must verify the transaction status directly using the Stripe SDK API and confirm the booking state immediately.

---

## Module 8: Patient Dashboard

### M8-F1: Aggregated Dashboard View
- **Acceptance Criteria**:
  - **AC 1 (Data Fetch Aggregation)**: Given a logged-in patient visits their dashboard, when the index route loads, then the client must execute aggregated backend queries to return: a list of upcoming appointments, a list of historical consultations, downloadable prescription links, uploaded medical records, and payment history summaries in under 300ms.

---

## Module 9: Reviews

### M9-F1: Rating & Feedback Submission
- **Acceptance Criteria**:
  - **AC 1 (Verified Consultation Validation)**: Given a user on the review page, when they attempt to submit a rating (1-5 stars) and a comment for a doctor, then the system must verify that the user is the specific patient of a completed appointment for that doctor.
  - **AC 2 (Unauthorized Review Block)**: Given a patient who has not completed an appointment with a doctor attempts to submit a review, when they send the request, then the system must block the review and return an HTTP 403 Forbidden error.

---

## Module 10: Admin Portal

### M10-F1: Doctor Registration Verification
- **Acceptance Criteria**:
  - **AC 1 (License Verification Workflow)**: Given a newly registered doctor, when they upload their board license files, then their profile status must set to `pending_verification` and they must be excluded from search queries.
  - **AC 2 (Admin Approval Activation)**: Given a logged-in admin clicks "Verify & Approve" in the Admin Portal, when the request is processed, then the doctor's status must update to `verified` and they must become searchable on the patient booking engine.

### M10-F2: Moderation & Dispute Handling
- **Acceptance Criteria**:
  - **AC 1 (Comment Moderation)**: Given a review flagged as inappropriate by a user, when an admin clicks "Remove Review" in the moderation queue, then the review must be instantly hidden from the doctor's profile page.
  - **AC 2 (Manual Refund Execution)**: Given an appointment status flagged as `disrupted` or disputed, when the admin selects "Initiate Refund" in the Admin Portal, then the system must trigger the Stripe API to release/refund the pre-authorized amount and update the transaction record.

### M10-F3: Platform Health Audit
- **Acceptance Criteria**:
  - **AC 1 (Metric Aggregation UI)**: Given a logged-in admin opens the dashboard statistics, when the page loads, then the system must display the total number of consultations, active user count (daily/weekly/monthly), total transaction volume in USD, and system latency metrics calculated within the last 5 minutes.
