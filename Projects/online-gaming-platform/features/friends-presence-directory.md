# Feature Specification: Friends & Presence Directory

---

## 1. Overview
The **Friends & Presence Directory** service manages user connections, social interactions, and real-time status tracking across the platform.

It maintains the friendship graph (active, pending, blocked relationships) and coordinates the real-time presence indicators (online, offline, in-game, idle) of active players. Status updates are pushed instantly through a Redis-backed WebSocket cluster to all active friends.

---

## 2. User Stories

### 2.1. Social Networking
* **US-1.1:** As a player, I want to send a friend request to another player using their username so that we can form a social connection on the platform.
* **US-1.2:** As a player, I want to block abusive users so that they cannot send me invitations, messages, or friend requests.

### 2.2. Real-Time Presence
* **US-2.1:** As a player, I want to see which of my friends are online or currently in a match so that I know when to invite them to a game lobby.
* **US-2.2:** As a player, if I step away from my device, I want my status to automatically transition to "Idle" so that my friends know I am currently away.

---

## 3. Functional Requirements

### 3.1. Friendship Graph Management
* **FR-1.1 (States):** Relationships must support four states: `PENDING_SENT`, `PENDING_RECEIVED`, `FRIENDS`, and `BLOCKED`.
* **FR-1.2 (Abuse Prevention):** Blocked users cannot see the online presence of the blocking user, nor can they send invites, direct messages, or new requests.

### 3.2. Real-Time Presence Routing
* **FR-2.1 (WebSocket Connection):** When a user establishes a gateway connection, their presence status is set to `ONLINE` in the global cache (Redis key `user:presence:<id>`).
* **FR-2.2 (Status Broadcaster):** On status updates, the presence service retrieves the user's friends list and publishes a status update event over Redis Pub/Sub to all connected friend sockets.
* **FR-2.3 (Idle Tracking):** If no client activity is detected for 10 minutes, the client or server must trigger a status transition to `IDLE`.

---

## 4. API Endpoints

### 4.1. Relationship Management
#### `POST /api/v1/friends/requests`
* **Description:** Sends a friend request to a target username.
* **Request Body:**
```json
{
  "target_username": "GamerTwo"
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "Friend request successfully sent."
}
```

#### `PUT /api/v1/friends/requests/{request_id}`
* **Description:** Accepts or declines a pending friend request.
* **Request Body:**
```json
{
  "action": "ACCEPT"
}
```
* **Success Response (200 OK):** Updates the friendship state.

---

### 4.2. Presence WebSocket Protocol
* **Server Broadcast: Friend Status Change (`presence_change`)**
```json
{
  "event": "presence_change",
  "data": {
    "user_id": "usr_9a2b8c3d",
    "status": "IN_GAME",
    "activity": {
      "match_id": "match_xyz123",
      "game_mode": "RANKED_5V5"
    }
  }
}
```

---

## 5. Database Schema

```sql
-- Friendship states
CREATE TYPE friendship_status AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- Friendships
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status friendship_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_lookup ON friendships(user_id, status);
```

---

## 6. Security Requirements

* **Isolation of Blocked Users:** The API and socket routers must filter out status updates and invitation payloads if the target user has blocked the sender.
* **Input Scrubber:** Sanitize search inputs on the friend finder API to prevent SQL injection.

---

## 7. Validation Rules

* **Self-Request Prevention:** Users cannot send friend requests to themselves.
* **Blocked Actions:** If User A has blocked User B, block any API requests from User B trying to initiate contact.

---

## 8. Error Handling

* **400 Bad Request (`SELF_FRIEND`):** Attempting to add oneself.
* **409 Conflict (`REQUEST_ALREADY_EXISTS`):** Resubmitting a pending friend request.

---

## 9. Acceptance Criteria (BDD Format)

#### Scenario: Accepting a Friend Request
* **Given** Player A has a pending friend request from Player B,
* **When** Player A calls the PUT endpoint with action `ACCEPT`,
* **Then** the database status must update to `ACCEPTED`, and both players' clients must receive a friendship confirmation websocket event.

---

## 10. Edge Cases & Mitigations

### 10.1. Reconnection Storms
* **Issue:** After a brief regional server outage, 10,000 players reconnect at the same time, generating 100,000 status updates to friend lists, overloading the database.
* **Mitigation:** Throttle presence broadcast events using a debouncing queue (e.g., buffering status updates for up to 3 seconds before sending them in bulk) and prioritize active in-game status shifts.
