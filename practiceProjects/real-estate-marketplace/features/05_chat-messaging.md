# Feature Specification: Monitored Chat System

## 1. Feature Info
* **Feature ID:** `FT-5.1`
* **Priority:** 5 (Core Communication Hub)
* **Title:** Monitored Chat System

---

## 2. Purpose
Provides a secure, real-time chat interface connecting buyers directly with listing owners or agents. Messages sync instantly using WebSockets, archiving threads relative to specific properties, with email notifications dispatched to offline recipients.

---

## 3. User Stories
* **US-5.1:** As a Buyer, I want to initiate a secure message thread from a property detail page so that I can discuss specifications and schedule site visits.
* **US-5.2:** As an Agent or Owner, I want to receive real-time messages in a consolidated dashboard inbox so that I can quickly respond to prospective buyers.

---

## 4. Functional Requirements

### FR-501.1: WebSockets Gateway Integration
* **Description:** Establish real-time duplex connections using Socket.io or native WebSockets. On client connection, the server must authenticate the session token and join the user to their unique channel room.

### FR-501.2: Chat Inbox & History Engine
* **Description:** Load active conversation threads sorted by last activity timestamp. Clicking a thread loads message records in chronological segments (paginated by 50 messages).

### FR-501.3: Offline Push Email Dispatcher
* **Description:** Track recipient active socket states. If a recipient's connection is inactive when a message is sent, wait 15 minutes. If they do not log back online within that time, compile unread messages and email them.

---

## 5. Validation Rules
* **VAL-501.1 (Message Character Bounds):** Message body strings must have a length between `1` and `5000` characters. Empty messages or attachments without a reference ID must be rejected.
* **VAL-501.2 (Property Context Validation):** A new inquiry thread can only be initiated against a property with status `APPROVED`.

---

## 6. Edge Cases
* **Edge Case 1: Unauthorized Thread Traversal:** A user tries to query message logs for a thread where they are neither the buyer nor the listing author.
  * *Resolution:* The server must execute an ownership validation check, returning a `403 Forbidden` response.
* **Edge Case 2: Concurrent Disconnect Handling:** A client socket drops mid-transmission.
  * *Resolution:* Keep message status as `SENDING` in the UI; if confirmation doesn't return from the server in 10 seconds, render a red retry icon next to the message bubble.

---

## 7. Dependencies
* **Upstream:** `FT-1.1` (Requires user identities), `FT-2.1` (Requires listings context).
* **Downstream:** `FT-1.3` (Inbox UI integration), `FT-5.2` (Reviews validation).

---

## 8. API & Socket Requirements

### Create Inquiry Thread
* **Endpoint:** `POST /api/v1/inquiries`
* **Headers:** `Authorization: Bearer <token>`
* **Request Schema:**
```json
{
  "propertyId": "prop_a298109bf",
  "initialMessage": "Hello, is this property still available for viewing?"
}
```
* **Success Response (210 Created):**
```json
{
  "success": true,
  "data": {
    "inquiryId": "inq_99201fba",
    "propertyId": "prop_a298109bf",
    "buyerId": "usr_772091aef"
  }
}
```

### WebSocket Events
* **Event: `join_room`** (Client -> Server)
  * Payload: `{ "inquiryId": "inq_99201fba" }`
* **Event: `send_message`** (Client -> Server)
  * Payload: `{ "inquiryId": "inq_99201fba", "body": "How about 3 PM?" }`
* **Event: `receive_message`** (Server -> Client)
  * Payload:
```json
{
  "messageId": "msg_00192bc",
  "inquiryId": "inq_99201fba",
  "senderId": "usr_772091aef",
  "body": "How about 3 PM?",
  "sentAt": "2026-06-04T18:31:00Z"
}
```

---

## 9. Database Impact
* **Target Tables:** `INQUIRY` (creates thread link), `MESSAGE` (creates message logs).
* **Indexes:**
  * Index on `MESSAGE(inquiry_id, sent_at)` to optimize loading chat histories.
  * Index on `INQUIRY(buyer_id)` and `INQUIRY(property_id)`.

---

## 10. UI Components
* **Inbox Panel:** Left pane displaying thread previews (listing thumbnail, sender name, message preview, unread count).
* **Chat Pane Window:** Center scroll area, rendering user messages on the right (primary theme color bubble) and external messages on the left (light grey color bubble).
* **Attachment Toolbar:** Interactive row supporting image and PDF selections.

---

## 11. Security Requirements
* **SEC-501.1 (Message Sanitization):** Scrub incoming message strings of HTML tags and Javascript attributes backend-side to prevent XSS script executions.
* **SEC-501.2 (Access Authorization Middleware):** Force socket connection authorization using signed cookie session tokens, refusing connection if authorization fails.

---

## 12. Acceptance Criteria
* **AC-501:** Real-time messages sync within 500ms when both users are in the chat panel.
* **AC-502:** Email summary alerts dispatch correctly after 15 minutes of recipient inactivity.

---

## 13. Definition of Done
* [ ] WebSocket library integrated and verified using automated headless scripts.
* [ ] Database models and relationship indexes applied.
* [ ] Offline email alert queue configured and tested using mock mail catchers.
