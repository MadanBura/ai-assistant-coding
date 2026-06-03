# Feature Specification: Real-Time Leaderboard System

---

## 1. Overview
The **Real-Time Leaderboard System** compiles and displays competitive player rankings across different game modes, regions, and timeframes.

To maintain real-time updates at global scale, the ranking calculations utilize high-speed **Redis Sorted Sets (ZSET)**. This setup offloads heavy ranking queries from the primary relational database, allowing clients to fetch real-time player ranks, top percentiles, and regional standings instantly.

---

## 2. User Stories

### 2.1. Dynamic Rankings
* **US-1.1:** As a competitive player, I want my rank to update immediately after a match victory so that I can see my progress on the leaderboard.
* **US-1.2:** As a player, I want to filter rankings by region (e.g., North America, Europe) and game mode to see where I stand relative to local competitors.
* **US-1.3:** As a player, I want to view leaderboards filtered by timeframes (e.g., Weekly, All-Time) to track seasonal or historical performance.

---

## 3. Functional Requirements

### 3.1. Redis Sorted Set Routing
* **FR-1.1 (ZSET Keys):** Leaderboard data is partitioned in Redis using sorted sets with composite keys:
  `leaderboard:<game_mode>:<region>:<timeframe>` (e.g., `leaderboard:RANKED_5V5:EU_WEST:WEEKLY`).
* **FR-1.2 (Score Updates):** On match resolution, update the player's ranking score in the relevant sorted set keys using `ZADD`.
* **FR-1.3 (Rank Queries):** Retrieve top-N lists using `ZREVRANGE` and player-specific ranks using `ZREVRANK`.

### 3.2. Relational Synchronization
* **FR-2.1 (Async Persistence):** Run an asynchronous cron job every 5 minutes to dump the top 1,000 ranks from Redis to the PostgreSQL master database for historical archives.

---

## 4. API Endpoints

### 4.1. Ranking Retrieval
#### `GET /api/v1/leaderboards`
* **Description:** Retrieves a paginated list of ranked players based on filter parameters.
* **Query Parameters:** `game_mode`, `region`, `timeframe`, `page`, `limit`
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "username": "GamerOne",
        "score": 2840,
        "win_ratio": 3.1
      },
      {
        "rank": 2,
        "username": "SniperPro",
        "score": 2795,
        "win_ratio": 2.8
      }
    ],
    "total_entrants": 15403
  }
}
```

#### `GET /api/v1/leaderboards/me`
* **Description:** Retrieves the active player's exact rank and surrounding entries (context ranking).
* **Request Headers:** `Authorization: Bearer <access_token>`
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "my_rank": 432,
    "score": 1540,
    "surrounding": [
      { "rank": 431, "username": "PlayerAbove", "score": 1545 },
      { "rank": 432, "username": "GamerOne", "score": 1540 },
      { "rank": 433, "username": "PlayerBelow", "score": 1535 }
    ]
  }
}
```

---

## 5. Database Schema

The persistent archive table handles historical rankings snapshot logging:

```sql
-- Historical leaderboards
CREATE TABLE historical_leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_mode VARCHAR(50) NOT NULL,
    region VARCHAR(20) NOT NULL,
    timeframe VARCHAR(20) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank INT NOT NULL,
    score INT NOT NULL,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_leaderboard_snapshot ON historical_leaderboard_snapshots(game_mode, region, timeframe, snapshot_date);
```

---

## 6. Security Requirements

* **Authoritative Score Reporting:** Score updates on leaderboards are restricted to internal server-to-server API calls. No client-side inputs are accepted.
* **Caching Queries:** Cache leaderboard query responses on the edge CDN for 30 seconds to prevent query floods to the Redis instances during peak usage.

---

## 7. Validation Rules

* **Allowed Timeframes:** Limit queries to `DAILY`, `WEEKLY`, and `ALL_TIME`.

---

## 8. Error Handling

* **400 Bad Request (`INVALID_TIMEFRAME`):** The query submitted an unsupported timeframe parameter.

---

## 9. Acceptance Criteria (BDD Format)

#### Scenario: Dynamic Ranking Update
* **Given** Player A is ranked 5th on the leaderboards with a score of 2000,
* **When** they win a match and their rating increases to 2150, overtaking Player B (ranked 4th with 2100),
* **Then** the leaderboard service must update their rank to 4th and shift Player B to 5th instantly.

---

## 10. Edge Cases & Mitigations

### 10.1. Peak-load Write Floods
* **Issue:** Millions of players finish matches simultaneously, creating write locks on Redis or crashing the cache cluster.
* **Mitigation:** Deploy Redis Cluster with master-replica sharding based on hash-slots of the `game_mode` key (e.g., sharding the `RANKED_5V5` set to a dedicated node).
