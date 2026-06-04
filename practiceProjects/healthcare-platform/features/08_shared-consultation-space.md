# Feature Specification: Shared Consultation Space (Text Chat & Session Notes)

## Feature ID
`FEAT-302` (Epic: `EPC-003`)

## Purpose
Provide patients and doctors with an interactive collaboration workspace alongside the video consultation interface. This workspace enables real-time text messaging, document referencing, and doctor-side clinical session notes, preserving a secure communication record for reference.

## User Stories
* **US-302.1:** As a patient, I want to send text messages and link files from my vault during the video call, so that I can share symptoms or spell out medication names without interrupting the audio feed.
* **US-302.2:** As a doctor, I want to draft private clinical notes during the session, so that I can document the patient's symptoms and diagnostic findings.

## Functional Requirements
1. **Real-time Consultation Chat:** A WebSocket-based messaging window inside the video feed layout.
2. **Consultation File Referencer:** Patient/Doctor can choose documents from the patient's secure EHR vault to display in the session workspace.
3. **Private Clinical Notes Editor:** A text editor panel accessible only to the doctor to log patient complaints, observations, and treatment plans.
4. **Draft Auto-save:** Periodically auto-save clinical notes to the database using debounced API calls.
5. **Chat Vault Archiver:** Upon session completion, the text chat messages must be exported, hashed, encrypted, and attached to the medical records ledger.

## Validation Rules
* **Text Length Bounds:** Messages in chat are capped at 500 characters. Clinical notes are capped at 10,000 characters.
* **Chat Access Check:** Only user IDs associated with the active appointment can establish connection to the WebSocket namespace `/consultations/:id/chat`.
* **Sanitize Inputs:** Escape HTML/script inputs in the chat and notes field to block cross-site scripting (XSS) attempts.

## Edge Cases
* **WebSocket drops during call:** **Rule:** The chat engine must cache pending outbound messages in memory and automatically dispatch them once WebSockets reconnect, showing a "sending" status label in the interim.
* **Patient attempts to access Doctor's clinical notes:** **Rule:** Backend API must block read/write operations targeting clinical notes from patient roles. Patient only receives final summary reports if released by the doctor.
* **Special characters or medical symbols input:** The text inputs must support standard UTF-8 encodings to prevent data corruption when pasting chemical formulas or medical abbreviations.

## Dependencies
* **Real-time Messaging:** WebSockets (Socket.io) or AWS API Gateway WebSockets.
* **Text Editor Component:** TipTap or Quill.js (configured without dangerous raw HTML outputs).

## API Requirements

### `POST /api/v1/consultations/:id/notes`
* **Security:** Authenticated (JWT) - Doctor only
* **Payload:**
```json
{
  "clinical_notes": "Patient presents with mild arrhythmia. BP: 135/85. Recommended follow-up cardiology screening.",
  "is_finalized": false
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "last_saved_at": "2026-06-05T09:45:00Z"
}
```

### `GET /api/v1/consultations/:id/chat-history`
* **Security:** Authenticated (JWT) - Doctor/Patient associated with session
* **Response (200 OK):**
```json
{
  "consultation_id": "con-309182",
  "messages": [
    {
      "sender_id": "pat-120938",
      "sender_role": "patient",
      "message_text": "Here is my previous lab report link.",
      "created_at": "2026-06-05T09:32:00Z"
    }
  ]
}
```

## Database Impact
* **`consultation_notes` Table (New):**
  * `id` (VARCHAR(64), PK)
  * `consultation_id` (VARCHAR(64), FK to `consultations.id`, Unique)
  * `doctor_id` (VARCHAR(64), FK to `users.id`)
  * `notes_encrypted` (TEXT) - AES-256 encrypted content.
  * `last_saved` (TIMESTAMP)
* **`consultation_chats` Table (New):**
  * `id` (BIGINT, PK, Auto Increment)
  * `consultation_id` (VARCHAR(64), FK to `consultations.id`)
  * `sender_id` (VARCHAR(64), FK to `users.id`)
  * `message_encrypted` (TEXT)
  * `created_at` (TIMESTAMP)

## UI Components
* **Interactive Sidepanel Widget (`SCR-102C`):**
  * Tabbed layout container (Tabs: "Chat", "Vault", "Clinical Notes").
  * **Chat Tab:** Text message list with scrolling viewport, message input box, and file attachments launcher.
  * **Vault Tab:** Checkbox list of shared documents from the patient's EHR vault.
  * **Clinical Notes Tab (Doctor Only):** Simple Rich-text editor field with an "Auto-saving..." status indicator.

## Security Requirements
* **AES Encryption:** Chat logs and clinical notes must be encrypted in transit and stored as encrypted strings inside PostgreSQL (`notes_encrypted`, `message_encrypted`), using encryption keys tied to the application key manager.
* **Strict RBAC:** Verify doctor identities on `/notes` requests before committing updates to the database.

## Acceptance Criteria
* **AC-302.1.1:** Verify WebSocket authentication denies connection requests if the JWT credentials do not match the assigned appointment participants.
* **AC-302.1.2:** Validate that messages sent through chat render in the recipient UI within 1.0 second delay.
* **AC-302.2.1:** Verify patient accounts are blocked from accessing or reading the clinical notes API endpoints.

## Definition of Done
* Socket.io / WebSocket signaling server paths configured.
* Rich text notes editor UI integrated and styled.
* Database encryption algorithms implemented and verified via unit tests.
* Form auto-saving logic completed and verified.
* QA testing verifies security isolation boundaries.
