# Feature Specification: WebSocket Chat Cluster

---

## 1. Overview
The **WebSocket Chat Cluster** is a distributed, low-latency messaging framework that handles real-time player communication across direct messages, team lobbies, and public channels.

The service utilizes a pub/sub backbone (Redis) to route messages across multiple horizontally scaled WebSocket gateway nodes, ensuring global scalability. Additionally, it integrates a real-time profanity and toxicity filter to censor inappropriate messages before delivery.

---

## 2. User Stories

### 2.1. Social Chats
* **US-1.1:** As a player, I want to send instant direct messages to my online friends so that we can coordinate game strategies.
* **US-1.2:** As a lobby member, I want to participate in a shared lobby chat room so that I can communicate with all players in the session.

### 2.2. Moderation
* **US-2.1:** As a player, I want public chat channels to filter out offensive language automatically so that the gaming environment remains welcoming and safe.

---

## 3. Functional Requirements

### 3.1. Messaging Modes
* **FR-1.1 (Direct Messages):** Point-to-point secure text routing between friends.
* **FR-1.2 (Channel Chats):** Pub/sub rooms mapping to specific game lobby codes or global regions (e.g., `chat:lobby:LOB-87`).

### 3.2. Real-Time Routing & Filtering
* **FR-2.1 (Horizontal Routing):** When a message is sent to a node, it publishes the payload to Redis Pub/Sub, routing it to other cluster gateway nodes hosting the recipient's connection.
* **FR-2.2 (Profanity Scrubber):** Prior to message delivery, the server must process the text through a profanity filter, replacing blocked words with asterisks (`***`).

---

## 4. API Endpoints

### 4.1. WebSocket Messaging Events
* **Client Action: Send Message (`send_msg`)**
```json
{
  "event": "send_msg",
  "data": {
    "recipient_id": "usr_8z7y6x5w",
    "chat_channel": "DM",
    "text": "Hello, let's play!"
  }
}
```

* **Server Broadcast: Receive Message (`receive_msg`)**
```json
{
  "event": "receive_msg",
  "data": {
    "message_id": "msg_abc123",
    "sender_id": "usr_9a2b8c3d",
    "sender_username": "GamerOne",
    "text": "Hello, let's play!",
    "timestamp": "2026-06-03T13:45:00Z"
  }
}
```

---

## 5. Database Schema

For audit compliance, chat histories are recorded asynchronously in a relational database:

```sql
-- Chat histories
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for public channel chats
    channel_id VARCHAR(100), -- Matches lobby code or channel identifier
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_channel_history ON chat_messages(channel_id, created_at DESC);
```

---

## 6. Security Requirements

* **Verification of Friendship:** For direct messages (DMs), the API must verify that an active friendship exists between the sender and recipient before routing the message.
* **XSS Sanitization:** The gateway must escape all HTML/JS character patterns on input to prevent execution of script tags in the chat UI.

---

## 7. Validation Rules

* **Message Length:** Text length must reside within the boundaries `[1, 1000]` characters. Empty messages are rejected.

---

## 8. Error Handling

* **403 Forbidden (`CHAT_BLOCKED`):** Attempting to send a DM to a user who has blocked the sender.
* **429 Too Many Requests (`SPAM_THROTTLED`):** Client sending messages faster than 5 messages per second.

---

## 9. Acceptance Criteria (BDD Format)

#### Scenario: Profanity Scrub Validation
* **Given** Player A is in public lobby chat,
* **When** they submit a message containing the blacklisted word `badword`,
* **Then** the moderation filter must intercept the text, rewrite the output as `***`, and broadcast the cleaned version to all members.

---

## 10. Edge Cases & Mitigations

### 10.1. Client Connection Drops mid-transmission
* **Issue:** A user sends a critical message while their connection drops, causing a silent loss of communications.
* **Mitigation:** Implement client-side confirmation checks (ACK). The client displays a loading spinner next to the message until it receives a confirmation event (`msg_ack`) containing the message ID from the server.
