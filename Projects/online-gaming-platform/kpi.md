# Key Performance Indicators (KPIs) & Project Acceptance Criteria
## Project: Scalable Global Online Gaming Platform

---

### 1. Overview
This document outlines the Key Performance Indicators (KPIs) and the formal Project Acceptance Criteria based on [brd.md](file:///d:/vibeCoding2026/Projects/online-gaming-platform/brd.md). The acceptance criteria define the validation guidelines for sign-off, utilizing a Behavior-Driven Development (BDD) style (Given-When-Then) to ensure all core functionalities meet business standards.

---

### 2. Core KPI Matrix

| Req ID | Feature Area | Business KPI Target | Technical KPI Target |
| :--- | :--- | :--- | :--- |
| **BR-001** | Account Management | * Sign-up completion rate > 85%.<br>* Weekly active user growth > 5%. | * Login / Auth latency (P95) < 200ms.<br>* Session validation rate: 100% accurate. |
| **BR-002** | Matchmaking Lobbies | * Queue abandonment rate < 5%.<br>* Average wait time < 10 seconds. | * Region-based match resolution < 2s.<br>* WebSocket drop-offs in queue < 0.5%. |
| **BR-003** | Leaderboards & Rank | * Leaderboard page loads per day.<br>* Average share rate of rankings. | * Redis Sorted Set updates < 5ms.<br>* Database write-back latency < 5s. |
| **BR-004** | Tournament Engine | * Total tournament matches played.<br>* User tournament conversion rate. | * Bracket generation < 2s (1024 players).<br>* Score verification latency < 500ms. |
| **BR-005** | Chat & Social Hub | * Active friend lists percentage > 60%.<br>* Total messages sent per DAU. | * Real-time DM propagation latency < 150ms.<br>* Profanity check regex runtime < 10ms. |
| **BR-006** | Score & Stats Logs | * Game stats accuracy rate: 100%.<br>* Retrospective statistics check. | * DB transaction write latency < 50ms.<br>* Data loss rate: 0.00%. |

---

### 3. Detailed Project Acceptance Criteria (BDD Format)

#### 3.1. Account & Security (BR-001)
##### Scenario 1: New User Email Sign-up
* **Given** a user is on the platform registration page,
* **When** they fill in a unique email, username, secure password, and submit,
* **Then** the platform must hash the password, write the user record to the Database, generate a secure JWT access token, and log the user in instantly.

##### Scenario 2: Multi-Region Login Support
* **Given** a registered user attempts to log in from a new region,
* **When** they submit valid credentials,
* **Then** the platform must validate their session via the authentication service and assign them to the closest regional edge routing server without requiring a profile re-creation.

---

#### 3.2. Skill-Based Matchmaking (BR-002)
##### Scenario 1: Successful Matchmaking within MMR Limits
* **Given** a player with MMR `1500` starts matchmaking for a 1v1 game mode in regional server `US-East`,
* **When** another player with MMR `1520` joins the same queue in `US-East` within 10 seconds,
* **Then** the system must pair both players, initialize a dedicated game lobby, and notify both clients via WebSockets with an "Accept/Decline" prompt.

##### Scenario 2: Dynamic Search Range Expansion
* **Given** a player is in the queue for more than 15 seconds,
* **When** no match within their initial MMR range (+/- 50 MMR) is found,
* **Then** the system must automatically expand the search range by 10% MMR every 5 seconds until a player is found or queue timeout is reached.

---

#### 3.3. Real-Time Leaderboards (BR-003)
##### Scenario 1: Immediate Leaderboard Updates
* **Given** an authoritative match ends and the winner is updated in the game record,
* **When** the database records the victory and updates the player's global MMR,
* **Then** the leaderboard service must immediately update the Redis Sorted Set rank, and the updated global and regional rank must reflect on the client leaderboard UI within 2 seconds.

---

#### 3.4. Tournament Bracket Progression (BR-004)
##### Scenario 1: Bracket Generation on Tournament Start
* **Given** a tournament is scheduled to start and has 64 registered players,
* **When** the start timer triggers,
* **Then** the platform must lock registration, generate a single-elimination bracket layout, assign match slots, and automatically invite players to their respective matches.

##### Scenario 2: Automated Next-Round Advancement
* **Given** a tournament match completes and the authoritative server reports the winner,
* **When** the scoring service registers the match result,
* **Then** the system must immediately advance the winner to the next bracket round, eliminate the loser, update the bracket UI for all spectators, and prepare the next lobby.

---

#### 3.5. Social Chat & Moderation (BR-005)
##### Scenario 1: Real-Time Direct Messaging
* **Given** Player A and Player B are friends and online,
* **When** Player A sends a direct message to Player B,
* **Then** the chat service must route the message over WebSockets to Player B with a delivery latency of under 150ms.

##### Scenario 2: Automated Profanity and Abuse Filtering
* **Given** a user types an offensive message containing a blacklisted word in a public lobby chat,
* **When** they click send,
* **Then** the platform's chat moderation engine must replace the blacklisted words with asterisks (`***`) before broadcasting the message and log a warning indicator on the user's profile.

---

#### 3.6. Score Tracking & Authoritative Game Logs (BR-006)
##### Scenario 1: Game Score Authorization Check
* **Given** a multiplayer match session completes,
* **When** a client tries to submit the score directly to the API,
* **Then** the API must reject the request with HTTP 403 Forbidden, accepting scores only from the authoritative game server instance signed with a private cryptographic key.

##### Scenario 2: Zero-Loss Session Logging
* **Given** a match terminates normally,
* **When** the match server submits the final stats payload to the score engine,
* **Then** the system must successfully execute a database transaction writing matching details, player stats, duration logs, and MMR changes with 100% consistency before returning a success signal.
