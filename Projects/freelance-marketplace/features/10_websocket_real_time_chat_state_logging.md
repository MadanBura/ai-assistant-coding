# Feature Specification: WebSocket Real-Time Chat & State Logging
## Feature ID: F-10

---

### 1. Feature Description
Develop a real-time messaging workspace for active contracts. The system will leverage WebSockets to sync chat messages instantly and record platform action logs (e.g., funding milestones, submit work, release payments) directly inside the chat timeline as system-generated messages.

---

### 2. Scope & Boundaries

#### In-Scope:
- **Real-Time Chat**: Direct message exchange between Client and Freelancer with low-latency updates.
- **File Sharing**: Inline file attachment uploading within chat windows (drag-and-drop file preview panels).
- **WebSocket Integration**: Auto-reconnect WebSockets using Socket.io or native WebSockets with heartbeat keep-alive checks.
- **Activity Logs**: Automated system messages injected into the chat database logs when contract events are triggered.
- **Contract Notifications**: Desktop/in-app push notifications for new messages when user tab is unfocused.

#### Out-of-Scope:
- Video and voice calling channels.
- Global chat searches across multiple unrelated project folders.

---

### 3. Detailed Technical Requirements

```
[ User Browser ] <========= WebSocket (ws://) =========> [ Node.js/WS Server ]
       |                                                         |
       |-- Sends message "Hi Sarah"                              |-- Broadcasts message
       |                                                         |
[ Contract Module ] -- triggers event: Milestone Funded           |-- Inject activity log
       |                                                         |
       +---> POST /api/v1/projects/:id/system-log ---------------> [ System Alert Broadcast ]
```

#### 3.1. Frontend Views & UI Elements
- **Contract Workspace Chat Screen**: Split panel interface. Conversation pane features user avatars, chat bubbles, image previews, and embedded system notification banner logs (colored differently).
- **Typing Indicator**: Dynamic element showing *"Alex is typing..."* using light debounce events (300ms latency).
- **Attachment Preview Drawer**: Horizontal panel detailing files queued for upload inside the message bar.

#### 3.2. Backend APIs & Endpoints
- `GET /api/v1/chats/:contract_id/messages`: Rest-based fallback query retrieves past chat messages, supporting offset pagination (50 messages per load).
- `POST /api/v1/chats/:contract_id/attachments`: Upload endpoint returning CDN storage urls for files.
- **WS Event Handlers**:
  - `join_room(contract_id)`: Registers socket connection to channel.
  - `send_message(payload)`: Distributes messages to participants.
  - `typing(boolean)`: Triggers indicator signals.

#### 3.3. Database Schema Impact
- **Messages Table**: Create table containing `id` (UUID, PK), `contract_id` (UUID, FK), `sender_id` (UUID - NULL for system events), `content` (TEXT), `message_type` (ENUM: 'user', 'system'), `attachment_urls` (ARRAY), `created_at` (TIMESTAMP).

---

### 4. Acceptance Criteria & Edge Cases

| Scenario | Given | When | Then |
| :--- | :--- | :--- | :--- |
| **Offline Message Delivery** | Freelancer is offline during message send | Client sends a message in contract chat | Socket server saves the message to Postgres and schedules an offline email notification. |
| **Workspace Event Log Injection** | Client funds Milestone 2 | Transaction processes | System writes a record to messages table: sender_id = NULL, message_type = 'system', content = 'Milestone 2 Funded' and syncs socket room. |
| **Simultaneous Typing Broadcast** | Both users type at the same time | Keypress events trigger | Sockets broadcast both indicators, showing respective typing overlays. |
| **Reconnection Sync** | Freelancer disconnects in subway and regains connection | Socket detects reconnection | System triggers join-room calls and fetches missed messages using timestamp ranges. |
| **File Preview Security** | User uploads HTML file | File is sent in chat | Attachment card renders download option with sandboxed MIME type, preventing execution. |
