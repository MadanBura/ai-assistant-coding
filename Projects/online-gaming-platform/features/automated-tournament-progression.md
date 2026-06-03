# Feature Specification: Automated Tournament Progression

---

## 1. Overview
The **Automated Tournament Progression** module coordinates the progression of active tournaments.

The service processes authoritative match logs, automatically flags match winners/losers, resolves bracket node progressions, and handles elimination steps. It maintains the integrity of the tournament sequence by dynamically triggering subsequent match lobbies as parent rounds complete.

---

## 2. User Stories

### 2.1. Seamless Progression
* **US-1.1:** As a tournament competitor, I want the system to automatically advance me to the next round when I win a match so that I can prepare for my next opponent immediately.
* **US-1.2:** As a tournament spectator, I want the bracket visual display to update instantly when a match finishes so that I can stay updated on the results.

---

## 3. Functional Requirements

### 3.1. Match Result Processing
* **FR-1.1:** The service must listen for secure match completion notifications from authoritative game servers.
* **FR-1.2:** On score submission, verify signatures and determine the winner using game-mode rulesets.

### 3.2. Automated Bracket Progression
* **FR-2.1 (Winner Advancement):** Upon declaring a winner, the system must write their User ID to the recipient slot in the parent bracket node (the next round match).
* **FR-2.2 (Loser Elimination):** Flag the loser as eliminated and update their tournament state.
* **FR-2.3 (Lobby Trigger):** If both competitor slots for a next-round match are filled, the system must automatically create a new lobby and send invite codes to both players.

---

## 4. API Endpoints

### 4.1. Progression Tracking
#### `POST /api/v1/tournaments/matches/{match_id}/report`
* **Description:** Authoritative submission endpoint for match scores (restricted to server scope).
* **Request Headers:** `Authorization: Bearer <game_server_token>`
* **Request Body:**
```json
{
  "winner_id": "usr_9a2b8c3d",
  "loser_id": "usr_8z7y6x5w",
  "final_score": "3-2"
}
```
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Match processed. Bracket advanced."
}
```

---

## 5. Database Schema

The active tournament nodes are saved in a relational structure tracking bracket matches:

```sql
-- Tournament Match Nodes
CREATE TABLE tournament_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    player1_id UUID REFERENCES users(id),
    player2_id UUID REFERENCES users(id),
    winner_id UUID REFERENCES users(id),
    score VARCHAR(20),
    next_match_id UUID REFERENCES tournament_matches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tmatches_lookup ON tournament_matches(tournament_id, round_number);
```

---

## 6. Security Requirements

* **Secure Score Reporting:** Score reporting endpoints require validation of the game server's client tokens. Client app submissions are blocked.
* **Distributed Locks:** Use locks (e.g., Redis distributed lock) on the target `tournament_matches` row during progression queries to prevent dual-processing of duplicate score reporting events.

---

## 7. Validation Rules

* **Valid Participants:** The winning/losing user IDs must match the player IDs declared in the target match node.

---

## 8. Error Handling

* **403 Forbidden (`INVALID_SECRET`):** Unauthorized API client attempts to submit scores.
* **409 Conflict (`MATCH_ALREADY_RESOLVED`):** Duplicate score submission for a completed match.

---

## 9. Acceptance Criteria (BDD Format)

#### Scenario: Round-1 Winner Advancement
* **Given** a match node in Round 1 has Player A and Player B, with next-round pointer matching Round-2 Match node `TM-20`,
* **When** Player A wins and the authoritative server submits the score,
* **Then** Player A must be assigned to the `player1_id` slot of node `TM-20`, Player B must be flagged as eliminated, and a bracket update event must be broadcast to all connected WebSocket clients.

---

## 10. Edge Cases & Mitigations

### 10.1. Network Disconnection / Match Stalls
* **Issue:** A round-1 match hangs because one player loses connection, preventing round 2 from starting.
* **Mitigation:** Implement a strict round duration cap (e.g., maximum 30 minutes). If a match is not resolved within the limit, the system automatically checks connection logs and awards the win to the player with active connection stability, or forces a double forfeit if both are offline.
