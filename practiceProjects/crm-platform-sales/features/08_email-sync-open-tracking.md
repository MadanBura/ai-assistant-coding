# Feature Specification: Email Sync & Open Tracking
## Feature ID: FE-CTA-1 (Priority 08)

---

## 1. Purpose
To integrate sales representatives' corporate email accounts (Gmail, Outlook) via OAuth/IMAP/SMTP, automate the logging of client communications to matching Leads/Contacts, and track email opens and link clicks.

---

## 2. User Stories
* **US-CTA-001:** As a Sales Representative, I want to connect my Gmail or Outlook account to the CRM so that my incoming and outgoing client emails sync automatically to their profiles.
* **US-CTA-005:** As a Sales Representative, I want to see if a client has opened my sent email and when they opened it so that I can time my follow-up call.
* **US-TAS-006:** As an Admin, I want to blocklist internal company email domains from syncing so that sensitive employee-to-employee emails remain private.

---

## 3. Functional Requirements
1. **FR-MAIL-001:** The system shall authenticate and authorize external mailbox access using OAuth 2.0 (Google Workspace / Microsoft Office 365) or credentials-based IMAP/SMTP configurations.
2. **FR-MAIL-002:** The system must run a background daemon to poll connected mailboxes every 5 minutes, scanning for new messages where the sender or recipient email matches a Lead or Contact email in the database.
3. **FR-MAIL-003:** When a matching message is found, the system must write the email metadata (From, To, Subject, Body, Sent Timestamp) to the database and link it to the respective entity's timeline.
4. **FR-MAIL-004:** The system shall expose a tracker route `/api/v1/email/track/:tracking_token` that serves a transparent `1x1.png` pixel.
5. **FR-MAIL-005:** Outbound emails sent via the CRM client composer must contain the tracking image tag:
   ```html
   <img src="https://crm.apexsales.com/api/v1/email/track/abc123token" width="1" height="1" style="display:none;" />
   ```
6. **FR-MAIL-006:** Requests to the tracking pixel route must extract the `tracking_token`, log the open event with timestamp, IP address, and User-Agent in the database, and update the associated email status to "Opened".

---

## 4. Validation Rules
1. Emails matching domains listed in the `ORG_BLOCKLIST` table must be bypassed entirely.
2. Email size during database indexing must be restricted to 2MB. Large attachments must be stored on external object storage (S3) or omitted based on tenant configurations.

---

## 5. Edge Cases
* **Edge Case 1 (Token Revoked by Provider):** If a user revokes OAuth access or changes their email password, the worker must flag the `MAILBOX_CONNECTION` row as "Disconnected", trigger an in-app error badge, and skip synchronization until re-authorization is complete.
* **Edge Case 2 (Email Exists on both Lead and Contact):** If the client email is associated with both a Lead and a Contact (e.g. historical duplicates), the system must link the synced email to both timeline threads.
* **Edge Case 3 (Pixel Blocker):** If a client email application blocks tracking pixels, the system status remains "Sent". However, if the client clicks a tracked link, the redirect handler must override the status to "Opened" and log the event.

---

## 6. Dependencies
* **FE-LCM-1 / FE-LCM-2:** Required to resolve recipient/sender email addresses to valid database Entities.
* **FE-TAS-2 (RBAC):** To ensure email sync tokens are isolated per representative.

---

## 7. API Requirements

### 7.1 Connect Mailbox
* **URL:** `/api/v1/email/connect`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <Token>`
* **Payload:**
  ```json
  {
    "provider": "Google",
    "auth_code": "4/0AdQt8qiL23n..."
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "connected_email": "user@apexsales.com",
    "sync_status": "Active"
  }
  ```

### 7.2 Tracking Endpoint
* **URL:** `/api/v1/email/track/:tracking_token`
* **Method:** `GET`
* **Headers:** None (Public Endpoint)
* **Response (200 OK):**
  - Content-Type: `image/png`
  - Body: Binary data of 1x1 transparent PNG.

---

## 8. Database Impact
* **Table:** `MAILBOX_CONNECTIONS`
  - Columns: `id` (UUID PK), `user_id` (UUID FK to `USERS`), `provider` (VARCHAR), `access_token` (TEXT encrypted), `refresh_token` (TEXT encrypted), `expires_at` (TIMESTAMP), `status` (VARCHAR), `created_at` (TIMESTAMP).
* **Table:** `EMAILS`
  - Columns: `id` (UUID PK), `mailbox_connection_id` (UUID FK), `message_id` (VARCHAR), `subject` (VARCHAR), `body` (TEXT), `sender` (VARCHAR), `recipient` (VARCHAR), `tracking_token` (VARCHAR UK), `status` (VARCHAR "Sent, Opened"), `opened_at` (TIMESTAMP), `created_at` (TIMESTAMP).
* **Table:** `ORG_BLOCKLIST`
  - Columns: `id` (UUID PK), `tenant_id` (UUID FK), `domain_name` (VARCHAR).

---

## 9. UI Components
* **Mail Settings Panel:** Displaying status of connected mailboxes, OAuth connection buttons, and domain blocklist text-area configurations.
* **Email Composer Drawer:** Rich-text text area featuring tracking trigger switches, template placeholders, and link attachments helper buttons.
* **Status Badge on Timeline:** Tiny icon beside emails showing status: "Sent" (Gray check), "Opened" (Double green checks), "Opened 2h ago" (tooltip on hover).

---

## 10. Security Requirements
* OAuth credentials and refresh tokens must be encrypted in PostgreSQL using AES-256-GCM. Decryption keys must reside in environment variables (AWS KMS or similar secret managers).
* Serve static 1x1 pixel with `Cache-Control: no-cache, no-store, must-revalidate` to force browsers to load it every time the email is viewed.

---

## 11. Acceptance Criteria (AC)
* **AC-CTA-001:** Given a connected IMAP sync daemon, when an email from `lead@company.com` arrives at the server, then the timeline feed of Lead `lead@company.com` must reflect the incoming message within 5 minutes.
* **AC-CTA-002:** Given a recipient opens a tracked email, when the 1x1 pixel triggers a GET request to `/api/v1/email/track/abc123token`, then the database field `opened_at` must update, and the server must return the transparent PNG body.
* **AC-CTA-006:** Given an email domain listed on `ORG_BLOCKLIST` (e.g. `competitor.com`), when an email sync sweep occurs, then matching messages must be discarded by the parser.

---

## 12. Definition of Done (DoD)
1. Crypto utilities for encrypting sync credentials pass unit verification scripts.
2. Load testing on tracking endpoint validates performance metrics under 1,000 requests per second.
3. OAuth refresh loop code handles provider expired token errors gracefully without crash restarts.
