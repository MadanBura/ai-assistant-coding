# Feature Detail: Inquiry Messaging System

## Feature ID: FEAT-501

---

## 1. Purpose
Provide a secure, real-time message exchange system connecting prospective buyers/renters directly with listing owners or agents, sending email copies, and protecting user privacy via email masking.

---

## 2. User Stories
* **US-501-1 (Direct Property Inquiry):** As a Buyer, I want to submit an inquiry through a listing page so that I can ask the owner or agent questions directly.
  * *Dependency:* FEAT-101 (Registration) and FEAT-201 (Property Creation).
  * *Edge Case:* The buyer sends repetitive inquiries within minutes.
  * *Resolution:* Enforce rate limiting: a maximum of 1 inquiry per property per user every 10 minutes.
* **US-501-2 (Seller Inquiry Dashboard):** As an Agent or Owner, I want to view, filter, and reply to all buyer inquiries from a central inbox dashboard.
  * *Dependency:* US-501-1.
  * *Edge Case:* Agent reads message on external email and replies there.
  * *Resolution:* Mask sender and receiver emails using a secure relay domain (e.g. `buyer-xyz@platform.com` and `agent-abc@platform.com`), mapping replies back to the internal database thread.

---

## 3. Functional Requirements
1. **FR-501-1 (Inquiry Form):** Add a floating contact form widget to the Property Details Page, enabling logged-in users to type a text message.
2. **FR-501-2 (Real-Time Communication):** Integrate Socket.io / WebSockets. When a message is sent, push it directly to the receiver's inbox screen if they are online.
3. **FR-501-3 (Secure Relay Mailer):** Generate anonymous email addresses for both participants upon thread creation. Forward notifications through these proxies to shield real personal details.
4. **FR-501-4 (Thread Status Logging):** Update thread status to `unread` when new messages arrive, and mark `read` when the receiver opens the chat panel.

---

## 4. Validation Rules
* **Message Content:** Required. Minimum 10 characters, maximum 1000 characters.
* **Daily Cap:** A buyer user can send a maximum of 15 new property inquiries within a rolling 24-hour window (preventing scraping).

---

## 5. Edge Cases
* **Edge Case 1: Inquiring about a Closed Property**
  * *Scenario:* Property listing transitions to status `archived` or `sold` while user is typing a reply.
  * *Resolution:* Freeze the input text block, display a red banner: "This property listing is no longer active. Conversions are locked.", and disable further message submissions.
* **Edge Case 2: Multi-Owner Transition**
  * *Scenario:* Property listing is reassigned from Owner A to Owner B.
  * *Resolution:* Maintain historical threads with Owner A, but route all *new* contact forms to Owner B, creating separate threads.

---

## 6. Dependencies
* Real-time WebSocket server setup (Socket.io or WS module).
* Email masking service provider (e.g. Twilio SendGrid Inbound Parse or Mailgun Route Engine).

---

## 7. API Requirements

### Create Inquiry Thread
* **Method & Route:** `POST /api/inquiries`
* **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
* **Request Payload:**
```json
{
  "propertyId": "prop_8820391",
  "message": "Hello, is this property available for viewing this Saturday?"
}
```
* **Response `201 Created`:**
```json
{
  "status": "success",
  "threadId": "thread_500129",
  "maskedBuyerEmail": "buyer-500129@relay.platform.com"
}
```

### Send Reply Message
* **Method & Route:** `POST /api/inquiries/threads/:threadId/messages`
* **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
* **Request Payload:**
```json
{
  "message": "Yes, we are open between 10 AM and 2 PM."
}
```
* **Response `200 OK`:**
```json
{
  "status": "success",
  "messageId": "msg_901920",
  "createdAt": "2026-06-04T12:05:00Z"
}
```

---

## 8. Database Impact
* **Tables:** `inquiries`, `messages` (New table).
* **New Table Scheme:** `messages`
  * `id` (uuid, primary key)
  * `inquiry_id` (uuid, foreign key referencing `inquiries.id`)
  * `sender_id` (uuid, foreign key referencing `users.id`)
  * `content` (text)
  * `created_at` (timestamp)
* **Indexes:**
  * Index on `inquiries.buyer_id` and `inquiries.property_id`.

---

## 9. UI Components
* **Listing Contact Widget:** A card embedded on the property page containing a textarea, user email display (prefilled, read-only), and a primary "Send Inquiry" button.
* **Unified Messaging Inbox Dashboard:** Split-screen layout:
  * Left side lists conversations sorted by latest message, featuring property thumbnail preview and "unread" dot indicators.
  * Middle pane showing scrollable chat thread bubble layout.
  * Right side showing summary detail of the inquired property (price, location, image, owner contact).

---

## 10. Security Requirements
* Authenticate socket handshakes using JWT token validation hooks.
* Block users from viewing or posting to threads where their `id` does not match either the thread's buyer ID or property listing owner ID.

---

## 11. Acceptance Criteria
* **AC-501-1:**
  * *Given* a logged-in buyer,
  * *When* they send an inquiry,
  * *Then* the backend returns thread details, pushes the message via WebSocket, and sends a masked email to the owner.
* **AC-501-2:**
  * *Given* an owner has received a message,
  * *When* they open the dashboard thread,
  * *Then* the state of the latest message transitions from `unread` to `read` in the database.

---

## 12. Definition of Done
* WebSockets load-tested with 100 concurrent active connections.
* Email masking relays tested with incoming webhook configurations.
* Conversation permissions unit-tested (preventing third-party users from accessing threads).
