# Feature Specification: WebSocket-Powered Real-Time Board Sync

## 1. Executive Summary & Value Proposition
Agile team members often plan sprints and track statuses concurrently during standups. If multiple users view the same board without real-time sync, updates are missed and conflict overrides occur. This feature integrates WebSockets to synchronize card movements, metadata updates, and status columns instantly across all active users.

---

## 2. Target User Stories
* **Story 1:** As a Scrum Master facilitating daily standups, I want card movements made by remote engineers to reflect on my shared projector screen instantly without manually reloading.
* **Story 2:** As a Developer, I want to see a visual indication when another user is viewing or editing the same task card I have open, avoiding concurrent overwrite conflicts.

---

## 3. Detailed Functional Scope

### 3.1. WebSocket Server & Connection
* Establishes secure WebSocket connection (`wss://`) after user authentication.
* Reconnect Protocol: Implements exponential backoff retry algorithms if the socket connection is lost.
* Connection states (Connected, Reconnecting, Disconnected) are shown in the board header.

### 3.2. Real-Time Channel Routing
* Connections subscribe to channels based on Workspace and Project IDs: `/ws/workspace/:workspaceId/project/:projectId`.
* Messages are broad-casted to all active project workspace subscribers except the sender.

### 3.3. Live Card Movement & Synced Events
* Triggers event `ISSUE_MOVED`: contains card ID, source status, destination status, and new index ordering.
* Triggers event `ISSUE_UPDATED`: updates title, assignee avatar, priority, or estimates inline without closing active modals.
* Triggers event `PRESENCE_UPDATED`: shows active cursors or avatar indicator cards in the board header showing who is online.

### 3.4. Conflict Resolution & Overwrites
* If User A and User B edit the same task description simultaneously, the system uses "Last-Write-Wins" policy or triggers a warning toast informing the second editor that modifications were overwritten.

---

## 4. API & WebSocket Protocol Design

### 4.1. WS Message Format
```json
{
  "event": "ISSUE_MOVED",
  "workspaceId": "a90df21a-45c1-4b13-912f-9273f081ee8b",
  "projectId": "c108ac20-3b21-4f1b-ba21-12cd248b11a9",
  "payload": {
    "issueId": "f784e201-1b2c-491a-810a-b9211c26b3e9",
    "status": "in_progress",
    "index": 3,
    "movedBy": {
      "userId": "d748ad29-231a-4ab2-811c-b8471c26b2b9",
      "displayName": "Aadil"
    }
  }
}
```

---

## 5. UI/UX Specifications
* **Collaboration Avatars:** Active subscribers are displayed as circular avatars in the top-right header of the board.
* **Live Movement Transitions:** When a card is dragged by another user, it slides to the new column with a subtle green pulse glow effect, detailing "Moved by Aadil."
* **Offline Status:** If websocket connection drops, show a discrete banner: "Offline. Trying to reconnect..." while locking board mutations temporarily.

---

## 6. Acceptance Criteria & Verification

### Automated Verification
1. **Multi-Subscriber Test:** Instantiate two mock client connections subscribed to the same project channel. Send a simulated move event from Client A and verify that Client B receives the payload within < 50ms.
2. **Auto-Reconnect Test:** Drop connection on the mock client and verify that the client retries connection up to 5 times.

### Manual Verification
1. Open two browser windows (Chrome and Firefox) signed in with different user accounts viewing the same project board.
2. Drag a task card in Window 1. Verify that Window 2 renders the card transition smoothly, displaying the movement highlight.
