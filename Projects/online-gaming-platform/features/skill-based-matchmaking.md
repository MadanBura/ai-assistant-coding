# Feature Specification: Skill-Based Matchmaking Engine

---

## 1. Overview
The **Skill-Based Matchmaking Engine (SBMM)** is a low-latency, real-time matchmaking service designed to match players of comparable skill ratings within their designated geographic region.

By analyzing player Matchmaking Ratings (MMR), connection latency (ping), and active queue volumes, the engine balances fair competitive outcomes with low search times. The matchmaking engine acts as an authoritative service that group players and allocates dedicated match lobbies.

---

## 2. User Stories

### 2.1. Fair Competitiveness
* **US-1.1:** As a player, I want to be matched against opponents of similar skill levels so that matches are challenging and fair.
* **US-1.2:** As a new player, I want to avoid being paired with highly experienced veterans so that I can learn the game mechanics at an appropriate pace.

### 2.2. Latency Optimization
* **US-2.1:** As a competitive player, I want the system to pair me with opponents in my region so that our in-game ping remains low and stable.
* **US-2.2:** As a player in a low-population region, I want the option to allow cross-region matchmaking if local queues are empty.

---

## 3. Functional Requirements

### 3.1. Matchmaking Parameters
* **FR-1.1 (MMR-Based Sorting):** The system must read the active player's global or game-mode specific MMR before queue insertion.
* **FR-1.2 (Regional Constraints):** Matchmaking must restrict initial pairings to players within the same physical region (e.g., `US_EAST`, `EU_WEST`) to guarantee low ping.
* **FR-1.3 (Party Matchmaking):** When a party queues, the team's combined MMR is calculated using a weighted formula that skews towards the highest rating to prevent high-level smurfing:
  $$\text{Party MMR} = \text{Max}(MMR) + 0.4 \times (\text{Average}(MMR) - \text{Max}(MMR))$$

### 3.2. Queue Management & Pairing
* **FR-2.1 (Centralized Queue):** Active queues are cached in Redis to support real-time querying.
* **FR-2.2 (Match Resolution):** A polling or event-driven matchmaker loops through active queues, pairing players into a match slot when their MMR difference falls below the current search boundary.

---

## 4. API Endpoints

### 4.1. Queue Operations
#### `POST /api/v1/matchmaker/join`
* **Description:** Inserts the user or party into the matchmaking queue.
* **Request Headers:** `Authorization: Bearer <access_token>`
* **Request Body:**
```json
{
  "game_mode": "RANKED_5V5",
  "region": "EU_WEST"
}
```
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "queue_session": {
      "session_id": "qss_abc123_xyz",
      "game_mode": "RANKED_5V5",
      "joined_at": "2026-06-03T13:30:00Z",
      "initial_mmr": 1540
    }
  }
}
```

#### `POST /api/v1/matchmaker/leave`
* **Description:** Removes the user/party from the active matchmaking queue.
* **Request Body:**
```json
{
  "session_id": "qss_abc123_xyz"
}
```
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Successfully exited matchmaking queue."
}
```

#### `GET /api/v1/matchmaker/status`
* **Description:** Polls matchmaking search status (Alternative to WebSocket updates).
* **Success Response (200 OK):**
```json
{
  "status": "searching",
  "elapsed_seconds": 12,
  "current_threshold": 50
}
```

---

## 5. Database Schema

The matchmaker uses Redis for memory-based queue states, backing up histories in persistent storage:

```sql
-- Matchmaker active logs
CREATE TABLE matchmaking_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_mode VARCHAR(50) NOT NULL,
    region VARCHAR(20) NOT NULL,
    start_mmr INT NOT NULL,
    time_spent_seconds INT NOT NULL,
    matched_successfully BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matchmaking_attempts_user ON matchmaking_attempts(user_id);
```

---

## 6. Security Requirements

* **Authoritative Queue Insertion:** Queue entry MMR must be pulled directly from the server database, never accepted from client-side requests.
* **DDoS Prevention:** Restrict queue insertion/exit events to 2 attempts per user per 30 seconds to prevent spam.
* **Anti-Cheat Integration:** Validate player ban status (`is_banned = TRUE`) at checkout before insertion.

---

## 7. Validation Rules

* **Region Validation:** Input region must match supported edge servers.
* **Party Limits:** Party sizes must match the selected game mode limit (e.g., maximum 5 players for `RANKED_5V5`).

---

## 8. Error Handling

* **400 Bad Request (`ALREADY_IN_QUEUE`):** Player tries to join a queue while active in another queue session.
* **403 Forbidden (`PLAYER_BANNED`):** Suspended users blocked from competitive matchmaking.
* **404 Not Found (`SESSION_NOT_ACTIVE`):** Match cancellation request sent with invalid/expired session IDs.

---

## 9. Acceptance Criteria (BDD Format)

#### Scenario: Matchmaking Skill Balance
* **Given** Player A (MMR 1200) and Player B (MMR 1220) queue in the same region for a 1v1 mode,
* **When** they reside in queue simultaneously and their MMR difference is within the active bounds,
* **Then** the matchmaker must group them into a lobby, outputting a match success websocket event.

---

## 10. Edge Cases & Mitigations

### 10.1. Smurfing Prevention
* **Issue:** High MMR players create fresh profiles to play against low-skill players.
* **Mitigation:** Implement rapid MMR calibration (increasing MMR gains by 300% on consecutive dominant wins) to push smurfs out of low-tier brackets quickly.
