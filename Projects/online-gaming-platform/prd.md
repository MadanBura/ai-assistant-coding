# Product Requirement Document (PRD)
## Project: Scalable Global Online Gaming Platform

---

### 1. Introduction and Goals
This document specifies the technical and functional requirements for the Global Online Gaming Platform. The platform provides real-time matchmaking, competitive tournaments, global leaderboards, game session tracking, and a social network (chat and friends list) on a high-availability backend.

#### 1.1. Success Metrics
* **Monthly Active Users (MAU) & Daily Active Users (DAU)**.
* **Matchmaking Speed:** Over 90% of match requests resolved within 10 seconds.
* **Retained Games Played:** Average games played per user session.
* **System Uptime:** Uptime of the gateway, matchmaking, and database layers >= 99.99%.
* **Average Latency:** Network round-trip time (RTT) for active game states <= 80ms globally.

---

### 2. Functional Requirements

#### 2.1. Registration and Profile Management
* **FR-1.1:** Users must be able to sign up using email/password or OAuth (Google, Discord, Apple, Steam).
* **FR-1.2:** Global Profile customization including username (unique tags), avatars, regional preferences, and statistics dashboard.
* **FR-1.3:** Session security utilizing token-based authentication (JWT) with secure automatic token rotation.

#### 2.2. Matchmaking and Lobbies
* **FR-2.1 (Skill-Based Matchmaking):** System must match players of similar Matchmaking Rating (MMR).
* **FR-2.2 (Lobbies):** Support creation of public and private lobbies with password verification and invite links.
* **FR-2.3 (Region Selection):** Users can choose preferred region (e.g., NA-East, EU-West, AS-East) or select "Auto" which resolves to the closest edge server based on ping.
* **FR-2.4 (Queue Expansion):** If a match is not found within 15 seconds, the skill matching boundaries (MMR range) expand by 10% every 5 seconds.

#### 2.3. Tournaments Engine
* **FR-3.1:** Automated registration for scheduled daily/weekly tournaments.
* **FR-3.2 (Brackets):** Support Single-Elimination, Double-Elimination, and Round-Robin brackets.
* **FR-3.3:** Real-time bracket rendering showing match progress, wins/losses, and upcoming games.
* **FR-3.4 (Automated Progression):** The platform must automatically declare winners based on server-reported game scores and advance them to the next bracket round.

#### 2.4. Real-Time Chat & Friends List
* **FR-4.1 (Social Directory):** Send, receive, accept, decline, or block friend requests.
* **FR-4.2 (Presence Service):** Show active status of friends (Online, Offline, In-Game, Idle).
* **FR-4.3 (Instant Messaging):** Real-time text chat (1-to-1 DMs and multi-user party/lobby channels).
* **FR-4.4 (Profanity Filtering):** Automatic regex and API-based filter for offensive words in public channels.

#### 2.5. Scores, Statistics, and Leaderboards
* **FR-5.1:** Track game logs: start time, end time, duration, scores, active participants, MMR shifts, and game-specific stats.
* **FR-5.2 (Real-Time Leaderboards):** Sort rankings dynamically by Game Mode, Region, and Time Interval (Daily, Weekly, All-Time).
* **FR-5.3 (Caching):** Leaderboards must update instantly in cache (e.g., using Redis Sorted Sets) and persist asynchronously to the master database.

---

### 3. User Flows and UX States

#### 3.1. Matchmaking Flow
1. **Queue Start:** User selects a game mode and clicks "Find Match."
2. **Matchmaking State:** UI changes to a queue timer with the active MMR search window (e.g., "Searching for MMR 1200 - 1300...").
3. **Match Found:** An alert sound plays, and a 10-second countdown popup appears: "Match Found! Accept / Decline."
4. **Accept state:** If accepted, player transitions to a "Lobby Syncing" state. If all accept, the game initializes.
5. **Decline state:** If declined, the declining player is removed from the queue with a temporary matchmaking cooldown penalty. Other players return to the front of the queue.

#### 3.2. Tournament Flow
1. **Sign-up:** User visits the "Tournaments" tab, views tournament info (prizes, rules), and registers.
2. **Pre-Start Notification:** 5 minutes before start, user receives a push notification and in-app system alert.
3. **Automatic Join:** When tournament starts, brackets are locked, and the platform invites participants directly to their match lobby.
4. **Advancement / Elimination:** Winner proceeds; loser is redirected to a "Spectate" or "Exit" screen.

---

### 4. System Architecture & Data Schema Overview

#### 4.1. Architecture Diagram Description
* **Client Layer:** Web App (React/Vite), Mobile App (iOS/Android).
* **Gateway Layer:** Load Balancer (AWS ALB / NGINX) routing to API Gateway.
* **Microservices:**
  * **Auth Service:** PostgreSQL for user records.
  * **Matchmaker Service:** Running in-memory matching logic.
  * **Game Session Manager:** Spawning instances of game servers at edge locations.
  * **Chat & Presence Service:** WebSockets cluster utilizing Redis Pub/Sub for routing messages.
  * **Leaderboard & Analytics Service:** Redis cache backing up to PostgreSQL.

#### 4.2. Database Design (Conceptual Schema)
* **Users Table:** `id (PK), email, password_hash, username, global_mmr, region, status`
* **Match_History Table:** `match_id (PK), game_mode, start_time, end_time, winner_id, lobby_type`
* **Match_Participants Table:** `id (PK), match_id (FK), user_id (FK), final_score, mmr_change`
* **Friends Table:** `id (PK), user_id (FK), friend_id (FK), status (pending/accepted/blocked)`
* **Leaderboards Table:** `id (PK), user_id (FK), score, game_mode, last_updated`

---

### 5. Edge Cases & Mitigation Strategies

* **Player Disconnection Mid-Game:**
  * *Mitigation:* Allow a 60-second reconnection window. If the player does not reconnect, they forfeit the match, receive an MMR penalty, and their score registers as a loss. In team games, a bot takes over or team members receive a resource compensation.
* **Score Manipulation / Cheating:**
  * *Mitigation:* Game scores must never be submitted directly by the client. The game loop must run on authoritative dedicated servers that determine the final score and submit it with secure internal cryptographic headers to the API.
* **Race Conditions in Tournament Brackets:**
  * *Mitigation:* Use distributed locking (e.g., Redlock) on bracket matches when resolving scores to prevent dual-advancements or duplicate matches.
* **Network Spike / High Load:**
  * *Mitigation:* Implement rate limiting at the API Gateway (e.g., maximum 60 requests per minute per IP for non-gameplay APIs).
