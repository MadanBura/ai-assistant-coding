# Feature Specification: Encrypted WebRTC Video Rooms

## Feature ID
`FEAT-301` (Epic: `EPC-003`)

## Purpose
Provide a secure, HIPAA-compliant environment for real-time video and audio consultations directly inside the web browser. The system must authenticate participants, issue WebRTC tokens, encrypt channels, and handle network connection drops gracefully.

## User Stories
* **US-301.1:** As a patient/doctor, I want to click a simple link in my appointment details to join a secure, high-definition video call, so that I don't have to download external communication apps.
* **US-301.2:** As a doctor, I want to share my screen during the consultation, so that I can show the patient their x-ray or test results.

## Functional Requirements
1. **Dynamic WebRTC Room Provisioner:** When a consultation is initialized, the system must interact with the WebRTC coordinator (e.g., Agora or Twilio) to request an encrypted, private channel matching the `consultation_id`.
2. **Access Control Tokens:** Generate short-lived (1-hour validity) JWT signaling tokens for verified participants.
3. **Session Expiry Logic:** Automatically disconnect connections and close the WebRTC room 60 minutes after the scheduled appointment start time, preventing room reuse.
4. **Call State Logger:** Record room events (`USER_JOINED`, `USER_MUTED`, `SCREEN_SHARE_ON`, `USER_DISCONNECTED`) into the audit logs.
5. **Quality of Service (QoS) Optimizer:**
   * Dynamic bitrate scaling based on active connection latency.
   * Auto-downgrade to audio-only if network speed drops under 300 Kbps.

## Validation Rules
* **Strict Participant Match:** The channel tokens must only authorize the designated patient ID and doctor ID associated with the booked appointment.
* **Encryption Standards:** Channel streams must enforce AES-128 or AES-256 end-to-end encryption.
* **Minimum WebRTC Requirements:** The browser client must support standard WebRTC interfaces (getUserMedia, RTCPeerConnection). If unsupported, render an error page guiding the user to update their browser.

## Edge Cases
* **Doctor or Patient loses connection mid-consultation:** **Rule:** The WebRTC SDK attempts auto-reconnection for 120 seconds. If successful, room state remains active. If connection cannot be re-established after 120 seconds, the SDK writes a `CONNECTION_TIMEOUT` log.
* **Patient joins but doctor does not show:** **Rule:** If the patient is alone in the room for 15 minutes past the start time, the platform alerts operations, ends the video call session, and initiates the automated no-show refund routine.
* **Browser denies camera/microphone permissions:** **Rule:** The UI intercepts the permission denial, blocks joining, and displays a step-by-step modal guide on how to enable hardware permissions in browser settings.

## Dependencies
* **WebRTC signaling gateway:** Agora.io SDK or Twilio Programmable Video SDK.
* **Client Interface:** Modern browser support for HTML5 Media Devices API.

## API Requirements

### `POST /api/v1/consultations/join`
* **Security:** Authenticated (JWT) - Doctor/Patient associated with appointment
* **Payload:**
```json
{
  "appointment_id": "appt-449102"
}
```
* **Response (200 OK):**
```json
{
  "consultation_id": "con-309182",
  "webrtc_channel": "ch_con_309182",
  "webrtc_token": "00644b910fae120...token_data",
  "uid": 128938,
  "encryption_key": "aes_crypto_shared_secret_string",
  "expires_at": "2026-06-05T10:30:00Z"
}
```

### `POST /api/v1/consultations/:id/log-event`
* **Security:** Authenticated (JWT) - Participant only
* **Payload:**
```json
{
  "event_type": "PEER_DISCONNECTED",
  "timestamp": "2026-06-05T09:42:12Z",
  "details": {
    "disconnected_user_id": "pat-120938",
    "reason": "network_loss"
  }
}
```
* **Response (200 OK):**
```json
{
  "success": true
}
```

## Database Impact
* **`consultations` Table (New):**
  * `id` (VARCHAR(64), PK)
  * `appointment_id` (VARCHAR(64), FK to `appointments.id`, Unique)
  * `webrtc_channel_name` (VARCHAR(128))
  * `started_at` (TIMESTAMP)
  * `ended_at` (TIMESTAMP, Nullable)
  * `duration_seconds` (INT)
  * `status` (ENUM('scheduled', 'active', 'completed', 'interrupted'))
* **`consultation_events` Table (New):**
  * `id` (BIGINT, PK, Auto Increment)
  * `consultation_id` (VARCHAR(64), FK to `consultations.id`)
  * `event_type` (VARCHAR(64))
  * `logged_by` (VARCHAR(64), FK to `users.id`)
  * `payload` (JSONB)
  * `created_at` (TIMESTAMP)

## UI Components
* **Consultation Video UI Panel (`SCR-102`):**
  * Grid video overlay displaying remote stream in main layout and local preview in picture-in-picture box.
  * Overlay status bar (Connection Health indicator - Excellent/Poor, Elapsed Call duration counter).
  * Hover floating control toolbar: Mute Audio, Toggle Camera, Share Screen, End Call.
  * Hardware Permission troubleshooting modal screen.

## Security Requirements
* **AES Encryption:** Raw media packets (audio/video) must be encrypted using DTLS-SRTP, conforming to WebRTC core specifications.
* **Token Expiry Enforcement:** Signaling server must deny connections using expired JWT tokens.

## Acceptance Criteria
* **AC-301.1.1:** Verify that generating a room token assigns access rights only to the registered doctor and patient IDs linked with the appointment.
* **AC-301.1.2:** Validate that the room rejects connection requests arriving 60 minutes after the scheduled start time.
* **AC-301.1.3:** Verify that screen sharing streams initialize without rendering distortions or canvas breaks on modern Chrome browsers.

## Definition of Done
* Agora/Twilio token generator integrated on the backend.
* WebRTC client container component built and styled.
* Hardware permission diagnostic utilities integrated.
* Automated connection interruption simulation tests pass.
* HIPAA review and security compliance signed off.
