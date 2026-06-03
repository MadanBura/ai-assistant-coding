# Feature Specification: Tournament Bracket Generator

---

## 1. Overview
The **Tournament Bracket Generator** module manages competitive event registrations and generates interactive tournament bracket layouts. 

The system supports automated seeding, bracket generation, and real-time visualization endpoints. It handles three standard tournament formats:
1. **Single Elimination:** Knockout rounds where a single defeat eliminates the participant.
2. **Double Elimination:** Competitors must lose twice in separate winner/loser brackets before elimination.
3. **Round Robin:** Everyone plays everyone once, scoring points to decide rankings.

---

## 2. User Stories

### 2.1. Registration & Entry
* **US-1.1:** As a competitive player, I want to register for upcoming scheduled tournaments so that I can compete for trophies and prizes.
* **US-1.2:** As a tournament organizer, I want to configure team size, max entrants, and seeding rules prior to bracket generation.

### 2.2. Bracket Visualization
* **US-2.1:** As a spectator, I want to view a real-time visual representation of the tournament bracket so that I can track match outcomes and standings.
* **US-2.2:** As a player, I want to see who my next opponent is and when our match is scheduled to begin.

---

## 3. Functional Requirements

### 3.1. Registration Management
* **FR-1.1:** Enforce registration validation (e.g., minimum level, active status, party sizes, check-in confirmations).
* **FR-1.2:** Implement a pre-tournament check-in window (e.g., 15 minutes before launch) to filter inactive registrations.

### 3.2. Bracket Generator Logic
* **FR-2.1 (Automated Seeding):** Generate brackets based on participant MMR (e.g., high-seed vs low-seed pairings to avoid early elimination of top players).
* **FR-2.2 (Bracket Nodes):** Structure bracket configurations in JSON models, where each match node links to parent and child nodes.
* **FR-2.3 (Bye Round Allocation):** If the registrant count is not a power of 2, the system must automatically allocate "Bye" matches to top seeds in the first round.

---

## 4. API Endpoints

### 4.1. Tournament Management APIs
#### `POST /api/v1/tournaments/{tournament_id}/register`
* **Description:** Registers the authenticated player or party for the tournament.
* **Request Headers:** `Authorization: Bearer <access_token>`
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "registration": {
      "id": "reg_xyz789",
      "tournament_id": "trn_001_major",
      "registered_at": "2026-06-03T13:40:00Z"
    }
  }
}
```

#### `GET /api/v1/tournaments/{tournament_id}/bracket`
* **Description:** Retrieves the current JSON bracket layout structure for client visualization.
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "format": "SINGLE_ELIMINATION",
    "rounds": [
      {
        "round_number": 1,
        "matches": [
          {
            "match_id": "tmatch_001_1",
            "p1": "GamerOne",
            "p2": "GamerTwo",
            "winner": null,
            "status": "SCHEDULED"
          }
        ]
      }
    ]
  }
}
```

---

## 5. Database Schema

```sql
-- Tournament types
CREATE TYPE tournament_format_type AS ENUM ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN');
CREATE TYPE tournament_status_type AS ENUM ('REGISTRATION', 'CHECK_IN', 'IN_PROGRESS', 'COMPLETED');

-- Tournaments Table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    format tournament_format_type NOT NULL,
    status tournament_status_type NOT NULL DEFAULT 'REGISTRATION',
    min_level INT NOT NULL DEFAULT 1,
    max_registrants INT NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Registrations
CREATE TABLE tournament_registrants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checked_in BOOLEAN NOT NULL DEFAULT FALSE,
    seed INT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, user_id)
);
```

---

## 6. Security Requirements

* **Verification of Registrations:** Ensure that users satisfy minimum level requirements by retrieving stats directly from the database during registration checks.
* **Seeding Tamper Prevention:** Seeding ranks must be calculated programmatically on the server; client input for seeds is blocked.

---

## 7. Validation Rules

* **Entrant Limits:** Total checked-in players must match the minimum requirements for the selected format (e.g., minimum 4 players for single-elimination).

---

## 8. Error Handling

* **400 Bad Request (`REGISTRATION_CLOSED`):** Registering after the deadline or after max capacity is reached.
* **403 Forbidden (`LEVEL_REQUIREMENT_NOT_MET`):** User profile level is too low.

---

## 9. Acceptance Criteria (BDD Format)

#### Scenario: Bracket Seeding Generation
* **Given** a single-elimination tournament is scheduled to start with 8 checked-in players,
* **When** the initialization script executes,
* **Then** it must generate a round-1 match matrix where the highest-seeded player (1) plays the lowest-seeded player (8).

---

## 10. Edge Cases & Mitigations

### 10.1. No-Show Entrants
* **Issue:** A player registers, checks in, but does not join their round-1 lobby.
* **Mitigation:** Implement a strict match-start grace timer (e.g., 5 minutes). If a player fails to connect within this window, their opponent receives an automatic walkover victory ("Bye") and advances to the next round.
