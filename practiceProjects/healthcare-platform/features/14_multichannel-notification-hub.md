# Feature Specification: Multichannel Notification Hub

## Feature ID
`FEAT-702` (Epic: `EPC-007`)

## Purpose
Dispatch real-time SMS, email, and in-app push notifications to patients and doctors for appointment confirmations, video session link activations, medical record updates, and invoice receipts. The hub manages message templating, user channel preferences, and retry logic.

## User Stories
* **US-702.1:** As a patient, I want to receive an SMS reminder 30 minutes before my appointment, so that I can prepare and join the video consultation on time.
* **US-702.2:** As a doctor, I want to receive an email notification when a patient uploads files to their EHR vault for my review, so that I can audit them before the meeting.

## Functional Requirements
1. **Dynamic Templating Engine:** A central service managing predefined notification layouts for:
   * **APPOINTMENT_CONFIRMED:** Send patient invoice details and doctor schedule blocks.
   * **APPOINTMENT_REMINDER:** Sent 30 minutes before the session containing the direct WebRTC join URL.
   * **PRESCRIPTION_ISSUED:** Send patient details on downloading medication PDFs.
   * **EHR_UPLOAD_ALERT:** Alert assigned doctor that patient reports have been uploaded.
2. **Channel-based Preferences Routing:** Read patient/doctor settings profiles (`email_opt_in`, `sms_opt_in`, `push_opt_in`) before selecting dispatch channels.
3. **In-App Notification Feed:** A WebSocket-connected UI bell indicator storing notification alerts within the dashboard layout.
4. **Queue & Retry Worker:** Integrate a message queue coordinator (e.g. BullMQ) handling asynchronous notification dispatches. If a gateway fails, execute exponential retries.
5. **Analytics Logs:** Log notification metrics (`sent_at`, `status`, `delivery_receipt_status`).

## Validation Rules
* **Phone Number Formatting Check:** SMS destinations must match international E.164 formats (e.g. `+16175550192`).
* **Email Address Integrity:** Validate emails using RFC 5322 regex checks before dispatch.
* **Timezone Safety:** Send scheduling reminders using localized client times converted from backend UTC parameters.

## Edge Cases
* **Sms gateway returns a billing/quota error:** **Rule:** The worker catches the failure, updates the message status to `gateway_failed`, and dispatches the backup email channel, logging the routing change.
* **User has disabled all notification channels:** **Rule:** Log the dispatch as `skipped_by_user_preference` but force execution of `APPOINTMENT_REMINDER` and `PRESCRIPTION_ISSUED` notifications as these represent high-priority clinical security communications.
* **Appointment is booked, rescheduled, and canceled in quick succession:** **Rule:** The queue checks pending delay notifications for that appointment ID. If newer states arrive (e.g. cancellation), any older pending reminder messages are deleted from the queue.

## Dependencies
* **SMS Gateway Provider:** Twilio SMS API.
* **Email Gateway Provider:** AWS SES or Twilio SendGrid.
* **Background Queue Manager:** BullMQ (Redis-backed) or RabbitMQ.

## API Requirements

### `POST /api/v1/notifications/send-custom`
* **Security:** Authenticated (JWT) - Admin Only
* **Payload:**
```json
{
  "recipient_id": "pat-120938",
  "channel": "sms",
  "message_body": "Important notice: Telehealth platform scheduled maintenance on June 7, 02:00-04:00 UTC."
}
```
* **Response (200 OK):**
```json
{
  "notification_id": "not-110293",
  "status": "queued",
  "recipient": "+16175550192"
}
```

### `PUT /api/v1/users/:id/notification-preferences`
* **Security:** Authenticated (JWT) - User Owner Only
* **Payload:**
```json
{
  "email_alerts": true,
  "sms_alerts": false,
  "push_alerts": true
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "preferences": {
    "email_alerts": true,
    "sms_alerts": false,
    "push_alerts": true
  }
}
```

## Database Impact
* **`notification_logs` Table (New):**
  * `id` (VARCHAR(64), PK)
  * `recipient_id` (VARCHAR(64), FK to `users.id`)
  * `template_name` (VARCHAR(128))
  * `channel` (ENUM('email', 'sms', 'push'))
  * `destination` (VARCHAR(255))
  * `status` (ENUM('queued', 'sent', 'delivered', 'failed', 'skipped'))
  * `retries_attempted` (INT, Default: 0)
  * `created_at` (TIMESTAMP)
* **`users` Table:** Add preference control columns (`email_alerts`, `sms_alerts`, `push_alerts` - default all to true).

## UI Components
* **In-App Notification Center UI Widget (`SCR-103C`):**
  * Dropdown popover list triggered by a bell icon badge in global layout header.
  * Active/unread message item states with click-to-dismiss buttons.
  * "Mark all as read" control link.
* **Preferences Editor Grid (`SCR-103D`):**
  * Settings view toggle checkboxes for Email, SMS, and Push notification channels.

## Security Requirements
* **PHI Masking in Alerts:** SMS notifications must *never* contain patient symptoms details or clinical diagnoses (e.g. message says "Your prescription is ready" instead of "Your prescription for Atorvastatin is ready").
* **Authentication Security:** Ensure only authorized processes can access notification delivery endpoints directly.

## Acceptance Criteria
* **AC-702.1.1:** Verify that upcoming appointment schedules trigger the queue tasks to schedule SMS reminders exactly 30 minutes before the session starts.
* **AC-702.1.2:** Validate that disabling SMS alerts in the preferences editor blocks standard reminders but lets critical notifications pass.
* **AC-702.2.1:** Verify that files uploaded to the EHR vault trigger alert dispatches to the assigned doctor.

## Definition of Done
* Templating generator module and placeholders styled.
* Twilio / SendGrid gateway integrations written.
* Message queue worker scripts implemented and tested in test suite.
* UI Notification center widget completed and integrated.
* System compliance and security audits checked.
