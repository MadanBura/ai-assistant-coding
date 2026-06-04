# Feature Specification: Slot Booking & Locking

## Feature ID
`FEAT-201` (Epic: `EPC-002`)

## Purpose
Ensure patients can select a doctor's open appointment slot, temporarily reserve (lock) it for 10 minutes to complete checkout safely, and finalize the appointment scheduling upon successful transaction authorization.

## User Stories
* **US-201.1:** As a patient, I want to select an open slot from a doctor's profile page, so that I can secure it while I enter my symptom description and card payment info.
* **US-201.2:** As a patient, I want to be warned if the slot lock expires before I pay, so that I understand why I need to re-select my booking.

## Functional Requirements
1. **Appointment Availability Compiler:** Compile the doctor's weekly intervals, subtract exclusions, subtract booked slots in `appointments` table (where status is `confirmed` or `locked`), and output free intervals.
2. **Redis-based Distributed Lock:** When a patient initiates booking, write a temporary record to Redis:
   * Key: `lock:doctor:{doctor_id}:slot:{timestamp}`
   * Value: `patient_id`
   * Expiration (TTL): 600 seconds (10 minutes)
3. **Session Lock State Tracker:** Render a countdown timer (starting at 10:00) on the checkout UI.
4. **Permanent Slot Promotion:** Once payment webhook signals success, delete the Redis lock key and write a row in Postgres `appointments` with status `confirmed`.
5. **Auto-Release Task:** If Redis TTL expires, clear the checkout screen and redirect the user back to search page.

## Validation Rules
* **Slot Alignment:** Target booking timestamp must align exactly with the doctor's configured slot start/duration.
* **Past Date Blocker:** Appointments cannot be booked on past dates/times.
* **Symptom Text Sanitization:** Symptom description input limited to 1000 characters and stripped of HTML/script elements.

## Edge Cases
* **Patient attempts checkout on slot that expired mid-entry:** **Rule:** Before calling Stripe charging endpoint, system verifies Redis key exists and matches patient ID. If expired, Stripe charge is aborted, and client is redirected with error: "Your session has expired. Please select a slot again."
* **Concurrency Collision:** Two patients click "Confirm Slot" at the exact same millisecond. **Rule:** Redis `SETNX` (Set if Not Exists) operation enforces atomic writes. The first client gets the lock (HTTP 200), the second receives HTTP 409 Conflict.
* **Payment webhook delayed:** stripe payment succeeds but webhook arrives after 10 minutes (Redis lock expired, and another patient booked the slot). **Rule:** Escrow handler flags the transaction as `UNALLOCATED_FUNDS_RESERVED`. The administrator panel receives an alert to issue a refund or contact the patient to select a new slot manually.

## Dependencies
* **In-Memory Cache:** Redis Server.
* **Payment Engine Gateway:** Stripe Connect API.
* **Background Task Scheduler:** Node-Cron or BullMQ (for handling delayed payouts and webhook timeouts).

## API Requirements

### `POST /api/v1/appointments/lock`
* **Security:** Authenticated (JWT) - Patient Only
* **Payload:**
```json
{
  "doctor_id": "doc-robert-chen-77",
  "scheduled_time": "2026-06-05T09:30:00Z"
}
```
* **Response (200 OK):**
```json
{
  "lock_id": "lock_doctor_doc-robert-chen-77_slot_1780651800",
  "expires_at": "2026-06-04T16:23:07Z",
  "appointment_id": "appt-449102",
  "consultation_fee": 150.00
}
```

### `POST /api/v1/appointments/confirm`
* **Security:** Authenticated (JWT) - Patient Only
* **Payload:**
```json
{
  "appointment_id": "appt-449102",
  "symptoms_description": "Experiencing minor chest pains after light jogging.",
  "payment_method_id": "pm_1N238HFDSH"
}
```
* **Response (200 OK):**
```json
{
  "appointment_id": "appt-449102",
  "status": "confirmed",
  "scheduled_time": "2026-06-05T09:30:00Z",
  "meeting_link": "https://telehealthconnect.com/rooms/ch_con_309182"
}
```

## Database Impact
* **`appointments` Table:**
  * Insert row with status `locked` on lock confirmation.
  * Update status to `confirmed` on successful payment callback.
  * Update status to `canceled` or delete record if Redis lock expires.
* **Indexes Needed on `appointments`:**
  * Composite index on `(doctor_id, scheduled_time)` to speed up availability compiling.

## UI Components
* **Doctor Profile Booking Grid (`SCR-101B`):**
  * Selectable slots grid organized by calendar date.
  * Selected state highlight classes.
* **Symptom Entry & Checkout Form (`SCR-102A`):**
  * Display countdown timer component (10:00).
  * Text area symptom form with character counter.
  * Stripe card entry components.

## Security Requirements
* **Prevent Account Abuse:** Limit single patient accounts to a maximum of 3 concurrent active slot locks to prevent automated bots from blocking doctor schedules.
* **Strict Serializable Transaction:** PostgreSQL transactions selecting from `appointments` must set isolation level to `SERIALIZABLE` to prevent write skew anomalies.

## Acceptance Criteria
* **AC-201.1.1:** Verify that calling the lock endpoint sets a Redis key with exactly 10 minutes (600s) TTL.
* **AC-201.1.2:** Validate that a second user attempting to lock the same slot receives an HTTP 409 Conflict.
* **AC-201.2.1:** Verify that when the timer expires, the Redis key is deleted and the slot is open to others.

## Definition of Done
* Redis distributed lock middleware implemented.
* PostgreSQL transaction handling configured for serializable checks.
* Web checkout interface with countdown timer operates successfully.
* Postman automated script runs integration tests.
* QA testing verifies concurrency handling.
