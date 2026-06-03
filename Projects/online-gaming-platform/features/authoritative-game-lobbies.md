# Feature Specification: Authoritative Game Lobbies

---

## 1. Overview
The **Authoritative Game Lobbies** module manages the pre-game organization, room discovery, connection state, and rules configuration for multiplayer game sessions. 

Rather than relying on client-side hosts (which are susceptible to cheating and connection drops), this service utilizes a centralized, WebSocket-driven state manager backing onto a low-latency cache layer. The lobby service dynamically allocates and coordinates dedicated edge game server instances when a session launches, guaranteeing that the pre-game configurations (modes, team setups, rulesets) are securely transmitted and enforced.

---

## 2. User Stories

### 2.1. Lobby Creation and Discovery
* **US-1.1:** As a player, I want to create a public game lobby with custom rules (e.g., game mode, map, team limits) so that other players can search, join, and play with me.
* **US-1.2:** As a player, I want to search and filter available public lobbies by game mode, ping, and space availability to find active matches quickly.

### 2.2. Private Lobbies and Sharing
* **US-2.1:** As a group of friends, I want to create a private lobby protected by a password so that we can play together without uninvited guests.
* **US-2.2:** As a lobby creator, I want to copy a secure invitation link containing a token so that I can send it to external friends (e.g., via Discord or email) for direct, password-free entry.

### 2.3. Lobby Management & Host Actions
* **US-3.1:** As the lobby host, I want to promote another player to host or kick disruptive players so that I can maintain order in my lobby.
* **US-3.2:** As a lobby member, I want to mark myself as "Ready" or "Not Ready" so that the host knows when everyone is prepared to begin.
* **US-3.3:** As the host, I want to trigger the match launch once all players are ready, redirecting everyone to the deployed authoritative game server.

---

## 3. Functional Requirements

### 3.1. Lobby Creation & Lifecycle
* **FR-1.1:** Users can create public or private lobbies. The system must generate a unique, human-readable 6-character alpha-numeric `Lobby Code` (e.g., `G4-X9Z`) for identifying the session.
* **FR-1.2:** Lobbies must support dynamic configuration changes (e.g., game mode, map pools, max player counts) updated instantly via WebSockets to all connected clients.
* **FR-1.3:** The lobby stays active as long as there is at least one player inside. If the host leaves, the system must automatically promote the oldest joined player to the host role. If all players leave, the lobby must automatically destroy itself and release resources.

### 3.2. Joining & Invites
* **FR-2.1:** Players join via Lobby Code, public list, or invite link.
* **FR-2.2 (Password Protection):** Private lobbies must validate the password input before allowing connection.
* **FR-2.3 (Secure Invite Links):** Invite links must include a signed HMAC token that expires after 1 hour, allowing the client to bypass the password prompt.

### 3.3. State Sync & Ready Check
* **FR-3.1 (State Broadcast):** The server must maintain the lobby state in memory (Redis) and broadcast changes (joins, leaves, config updates, ready status) over a persistent WebSocket connection to all lobby members within 100ms.
* **FR-3.2 (Authoritative Launch):** The host cannot initiate a match unless all active players are marked as "Ready." Upon match start, the lobby state transitions to `launching`, and the lobby service calls the Game Server Manager API to spin up a dedicated server. Once deployed, the service broadcasts the server's IP address and access token to all clients to initiate loading.

---

## 4. API Endpoints

### 4.1. REST APIs (Discovery & Configuration)
#### `POST /api/v1/lobbies`
* **Description:** Creates a new game lobby.
* **Request Headers:** `Authorization: Bearer <access_token>`
* **Request Body:**
```json
{
  "game_mode": "DEATHMATCH",
  "max_players": 10,
  "is_private": true,
  "password": "SecretLobbyPassword123"
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "lobby": {
      "lobby_code": "LOB-87",
      "host_id": "usr_9a2b8c3d-e4f5-6a7b-8c9d-0e1f2a3b4c5d",
      "game_mode": "DEATHMATCH",
      "max_players": 10,
      "is_private": true,
      "invite_url": "https://gamingplatform.com/join/LOB-87?token=sig_abc123..."
    }
  }
}
```

#### `GET /api/v1/lobbies`
* **Description:** Lists all active, non-full public lobbies.
* **Query Parameters:** `game_mode`, `page`, `limit`
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "lobbies": [
      {
        "lobby_code": "PUB-45",
        "host_username": "SniperPro",
        "game_mode": "TEAM_BATTLE",
        "player_count": 6,
        "max_players": 10
      }
    ]
  }
}
```

---

### 4.2. WebSocket Operations
* **Connection Endpoint:** `wss://gateway.gamingplatform.com/lobbies?code=LOB-87`
* **Payload Protocols:**

#### Client Event: Player Ready Check (`client_ready`)
```json
{
  "event": "client_ready",
  "data": {
    "is_ready": true
  }
}
```

#### Server Broadcast: Lobby State Sync (`lobby_update`)
```json
{
  "event": "lobby_update",
  "data": {
    "lobby_code": "LOB-87",
    "host_id": "usr_9a2b8c3d-e4f5-6a7b-8c9d-0e1f2a3b4c5d",
    "status": "WAITING",
    "members": [
      {
        "user_id": "usr_9a2b8c3d-e4f5-6a7b-8c9d-0e1f2a3b4c5d",
        "username": "GamerOne",
        "is_ready": true,
        "joined_at": "2026-06-03T13:00:00Z"
      },
      {
        "user_id": "usr_8z7y6x5w-e4d3-c2b1-a0z9-8y7x6w5v4u3t",
        "username": "NewPlayer",
        "is_ready": false,
        "joined_at": "2026-06-03T13:01:10Z"
      }
    ]
  }
}
```

#### Server Broadcast: Match Launch Trigger (`match_launch`)
```json
{
  "event": "match_launch",
  "data": {
    "server_connection_string": "198.51.100.42:7777",
    "server_access_token": "token_session_secure_xyz"
  }
}
```

---

## 5. Database Schema

The lobbies database contains ephemeral states mapped in Redis for instant synchronization, backing up status updates to a persistent relational SQL storage engine:

```sql
-- Enums for lobby states
CREATE TYPE lobby_status_type AS ENUM ('WAITING', 'LAUNCHING', 'PLAYING', 'CLOSED');

-- Lobbies Table: Persistent metadata
CREATE TABLE lobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_code VARCHAR(10) UNIQUE NOT NULL,
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    game_mode VARCHAR(50) NOT NULL,
    max_players INT NOT NULL CHECK (max_players > 1 AND max_players <= 64),
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash VARCHAR(255), -- NULL for public lobbies
    status lobby_status_type NOT NULL DEFAULT 'WAITING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lobby Members Table: Active participant tracking
CREATE TABLE lobby_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_id UUID NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_ready BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lobby_id, user_id)
);

-- Indexes for performance lookups
CREATE INDEX idx_lobbies_status ON lobbies(status) WHERE status = 'WAITING';
CREATE INDEX idx_lobby_members_lookup ON lobby_members(lobby_id);
```

---

## 6. Security Requirements

* **Password Hashing:** Private lobby passwords must be encrypted using Bcrypt with a work factor of 10.
* **Invite URL Cryptography:** Invite URL tokens must be generated using HMAC-SHA256, signed using the server's private key, containing the user's ID, lobby code, and expiry timestamp to prevent forgery.
* **Action Authentication:** Every client message sent via WebSockets (e.g., kicking players, updating config) must verify that the sender's user ID matches the authoritative host ID saved in the Redis state.
* **Connection Rate Limiting:** Establish limits at the WebSockets Gateway preventing more than 5 connections/reconnections per IP address per 10 seconds.

---

## 7. Validation Rules

* **Lobby Code format:** Regex `/^[A-Z0-9]{3}-[A-Z0-9]{3}$/` (6 alphanumeric characters split by a hyphen).
* **Max Players Limit:** Must reside within the boundaries `[2, 64]`.
* **Password Constraint:** For private lobbies, passwords must contain 4 to 32 characters.

---

## 8. Error Handling

* **400 Bad Request (`LOBBY_FULL`):** The lobby has reached its maximum player limit.
* **401 Unauthorized (`LOBBY_PASSWORD_REQUIRED`):** Accessing a private lobby without submitting a password parameter.
* **401 Unauthorized (`INVALID_LOBBY_PASSWORD`):** The password submitted does not match the lobby password hash.
* **403 Forbidden (`NOT_LOBBY_HOST`):** A non-host member attempted to change configurations, kick players, or start the match.
* **404 Not Found (`LOBBY_NOT_FOUND`):** The requested Lobby Code does not correspond to an active session.

---

## 9. Acceptance Criteria (BDD Format)

#### Scenario 1: Private Lobby Password Verification
* **Given** a private lobby `LOB-87` exists with password hash for `Secret123`,
* **When** a player attempts to join using code `LOB-87` with password `WrongPassword`,
* **Then** the server must reject the connection, return HTTP 401 with code `INVALID_LOBBY_PASSWORD`, and block connection to the WebSocket channel.

#### Scenario 2: Host Auto-Promotion upon Departure
* **Given** a lobby `LOB-87` has Host A, Player B (joined next), and Player C,
* **When** Host A leaves the lobby or disconnects,
* **Then** the lobby service must promote Player B to host, update the lobby database record, and broadcast a `lobby_update` event identifying Player B as the new host.

#### Scenario 3: Prevent Starting without Ready Confirmation
* **Given** the host is attempting to start the match for lobby `LOB-87` with 4 players inside,
* **When** 3 players are marked as "Ready" but 1 player is "Not Ready",
* **Then** the server must reject the `start_match` command, send an error notification event, and block the transition to game server launch.

---

## 10. Edge Cases & Mitigations

### 10.1. Split-Brain Host Promotion
* **Issue:** Host A suffers a brief 5-second network drop. The server promotes Player B. Host A immediately reconnects, resulting in two clients claiming host privileges.
* **Mitigation:** The WebSocket gateway must gracefully disconnect Host A's previous socket on new connection. The rejoining user returns as a standard player unless Player B explicitly returns host status.

### 10.2. Deallocation Race Condition
* **Issue:** Two players join a lobby containing 1 empty slot at the exact same millisecond.
* **Mitigation:** The lobby join operation must execute inside a Redis transaction (utilizing a `WATCH` command on the lobby player count key) to ensure the player count does not exceed `max_players` during parallel updates.
