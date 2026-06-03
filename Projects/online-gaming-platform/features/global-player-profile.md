# Feature Specification: Global Player Profile & Dashboard

---

## 1. Overview
The **Global Player Profile & Dashboard** module handles the management of gaming identities, user personalization settings, and the calculations of player statistics and game progression across the platform.

This service manages:
1. **Public/Private Player Profiles:** Custom biographies, avatars, and visual states.
2. **System Configurations:** Preferred regional network routing settings to optimize ping times.
3. **Stat Aggregation Engine:** Dynamic aggregation of match logs to compile win/loss ratios, match histories, and play duration.
4. **Progression System:** Leveling progression formulas based on experience points (XP) earned from gameplay and competitive achievements.

---

## 2. User Stories

### 2.1. Profile Customization
* **US-1.1:** As a player, I want to edit my public profile (bio, avatar, display name) so that my friend circle and opponent lobby can recognize my persona.
* **US-1.2:** As a player, I want to set my preferred matchmaking region (e.g., Europe, Asia, North America) so that the matchmaker prioritizes edge servers with the lowest network latency.

### 2.2. Player Statistics & Dashboards
* **US-2.1:** As a competitive player, I want to view my dashboard displaying my total wins, losses, and win/loss ratio for each game mode to measure my skill improvement.
* **US-2.2:** As a player, I want to view another player's public profile and historical stats from the lobby so that I can inspect their gaming experience and history.

### 2.3. Level & XP Progression
* **US-3.1:** As a player, I want to earn Experience Points (XP) at the end of each completed match so that I can level up my profile and unlock milestone icons.
* **US-3.2:** As a player, I want to view my active progression bar and see how much XP is required to reach the next rank level.

---

## 3. Functional Requirements

### 3.1. Profile Management
* **FR-1.1:** Profiles must enforce unique usernames. If a user attempts to change their username, the system must check availability and enforce a 30-day cooldown before another change is allowed.
* **FR-1.2 (Avatars):** Support custom image uploads. The system must automatically resize, compress, and store the file on an edge-cached CDN (Content Delivery Network).
* **FR-1.3 (Region Selection):** Provide preferred region settings: `AUTO`, `US_EAST`, `US_WEST`, `EU_WEST`, `AS_EAST`.

### 3.2. Stats Aggregation Engine
* **FR-2.1:** The service must listen to completed match events published by the game servers.
* **FR-2.2:** On match completion, the system must recalculate the player's performance records: total matches, wins, losses, and current win/loss ratio: `Ratio = Wins / Max(1, Losses)`.
* **FR-2.3:** Match history records must keep the last 50 games queryable with metadata (game mode, duration, score, teammates, opponents).

### 3.3. Progression & Leveling (XP)
* **FR-3.1:** XP calculations are computed on match finalization. The baseline formula is:
  $$\text{XP Earned} = (\text{Match Duration in minutes} \times 10) + (\text{Result Bonus}) + (\text{Score Performance Bonus})$$
  *(Where Result Bonus = +100 XP for a Win, +20 XP for a Loss).*
* **FR-3.2:** The level requirements scale exponentially following the curve:
  $$\text{XP Required for Level } L = 1000 \times (L)^{1.5}$$
* **FR-3.3:** When a user's accumulated XP matches or exceeds the level requirement, the system must increment their level, trigger a level-up event, and log milestone details.

---

## 4. API Endpoints

### 4.1. Profiles & Settings
#### `GET /api/v1/profiles/{username}`
* **Description:** Retrieves the public profile details and active statuses of a player.
* **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "profile": {
      "user_id": "usr_9a2b8c3d-e4f5-6a7b-8c9d-0e1f2a3b4c5d",
      "username": "GamerOne",
      "avatar_url": "https://cdn.gamingplatform.com/avatars/usr_9a2b8c3d.png",
      "bio": "Competitive FPS and RPG enthusiast.",
      "preferred_region": "EU_WEST",
      "level": 15,
      "current_xp": 4500,
      "xp_needed_next": 58090
    }
  }
}
```

#### `PUT /api/v1/profiles/me`
* **Description:** Updates the profile info for the logged-in user.
* **Request Headers:** `Authorization: Bearer <access_token>`
* **Request Body:**
```json
{
  "username": "GamerOneUpdated",
  "bio": "Updated bio text.",
  "preferred_region": "US_EAST"
}
```
* **Response (200 OK):** Returns the updated profile block.

#### `POST /api/v1/profiles/me/avatar`
* **Description:** Uploads a binary image for the user's profile avatar.
* **Request Headers:** `Content-Type: multipart/form-data`, `Authorization: Bearer <access_token>`
* **Request Body:** File attachment (`avatar` field).
* **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "avatar_url": "https://cdn.gamingplatform.com/avatars/usr_9a2b8c3d_new.png"
  }
}
```

---

### 4.2. Stats & Progression APIs
#### `GET /api/v1/profiles/{username}/stats`
* **Description:** Retrieves statistics, win/loss history, and game logs.
* **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "statistics": {
      "matches_played": 120,
      "wins": 85,
      "losses": 35,
      "win_ratio": 2.42,
      "total_play_time_seconds": 324000
    },
    "recent_matches": [
      {
        "match_id": "match_5f6g7h8i...",
        "game_mode": "RANKED_5V5",
        "result": "WIN",
        "score": "16-10",
        "played_at": "2026-06-03T12:00:00Z"
      }
    ]
  }
}
```

---

## 5. Database Schema

```sql
-- Preferred regions config
CREATE TYPE region_type AS ENUM ('AUTO', 'US_EAST', 'US_WEST', 'EU_WEST', 'AS_EAST');
CREATE TYPE match_result_type AS ENUM ('WIN', 'LOSS', 'DRAW', 'FORFEIT');

-- Profiles Table: Extends the users auth table with metadata
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio VARCHAR(250),
    avatar_url VARCHAR(512) DEFAULT 'https://cdn.gamingplatform.com/avatars/default.png',
    preferred_region region_type NOT NULL DEFAULT 'AUTO',
    level INT NOT NULL DEFAULT 1,
    current_xp BIGINT NOT NULL DEFAULT 0,
    last_username_change TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Player Stats Table: Dynamic player metrics cache
CREATE TABLE player_statistics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    matches_played INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    draws INT NOT NULL DEFAULT 0,
    total_play_time_seconds BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Player Match History logs
CREATE TABLE player_match_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL, -- References game logs system
    game_mode VARCHAR(50) NOT NULL,
    result match_result_type NOT NULL,
    score VARCHAR(20) NOT NULL,
    xp_earned INT NOT NULL DEFAULT 0,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance queries
CREATE INDEX idx_profiles_xp ON profiles(current_xp DESC);
CREATE INDEX idx_match_logs_user_played ON player_match_logs(user_id, played_at DESC);
```

---

## 6. Security Requirements

* **Access Control:** All profile edit mutations (`PUT /me`, `/avatar`) require user session token validation. A user must only modify their own profile data.
* **File Upload Filtering:** The avatar upload system must:
  * Restrict uploads to `image/jpeg` and `image/png` MIME types.
  * Validate image dimensions (minimum 200x200px, maximum 2048x2048px).
  * Scan binary buffers for malicious malware attachments using sandboxed validation servers.
* **Database Updates Isolation:** Stats updates must execute in isolated database transactions, using pessimistic locking (`SELECT FOR UPDATE`) on the target `player_statistics` record to prevent race conditions during overlapping match finishes.

---

## 7. Validation Rules

* **Bio Content:** Max 250 characters. Escape raw HTML and character sequences to prevent Cross-Site Scripting (XSS).
* **Avatar File Constraints:**
  * File size: Maximum 2MB.
  * File extension matching MIME signatures (magic number bytes analysis).
* **Username Cooldown:** Check `last_username_change` field. If the timestamp is within 30 days of the current time, block request execution.

---

## 8. Error Handling

* **400 Bad Request (`FILE_TOO_LARGE`):** Avatar file exceeds 2MB limit.
* **400 Bad Request (`UNSUPPORTED_FILE_TYPE`):** File header bytes do not match JPEG or PNG magic numbers.
* **403 Forbidden (`USERNAME_CHANGE_COOLDOWN`):** Username change requested before the 30-day cooldown expires.
* **404 Not Found (`PROFILE_NOT_FOUND`):** The specified username does not exist.

---

## 9. Acceptance Criteria (BDD Format)

#### Scenario 1: Successful Username Modification
* **Given** a user is authenticated and is changing their username to `ProGamer`,
* **When** `ProGamer` is not taken and `last_username_change` is either NULL or greater than 30 days ago,
* **Then** the platform must update the username, set the `last_username_change` timestamp to the current time, and return HTTP 200.

#### Scenario 2: Progression Level-up Check
* **Given** a level 1 player has `950 XP` (with level requirement to level 2 set at `1000 XP`),
* **When** they complete a match and earn `150 XP` (making total `1100 XP`),
* **Then** the progression engine must update the profile level to 2, deduct the level cost, set the remaining XP to `100 XP`, and broadcast a level-up notification event.

---

## 10. Edge Cases & Mitigations

### 10.1. CDN Failures
* **Issue:** The external CDN hosting user avatar images experiences downtime, leading to broken images in lobbies.
* **Mitigation:** The client application must verify image loading states. If an avatar load fails, the application must immediately fall back to a local default SVG vector avatar.

### 10.2. Match Validation Delays
* **Issue:** Multiple game servers complete matches at the same millisecond, sending concurrent stats updates.
* **Mitigation:** Implement a queue broker (e.g., RabbitMQ or SQS) to buffer incoming match result events. The statistics engine processes them sequentially per user ID to guarantee database integrity.
