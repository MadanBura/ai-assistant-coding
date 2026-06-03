# Feature Specification: Dynamic Queue & MMR Expansion

---

## 1. Overview
The **Dynamic Queue & MMR Expansion** module governs the adaptive search thresholds used by the matchmaking engine.

During off-peak hours or for players with extreme skill ratings (very high or very low MMR), queues can stagnate. To prevent endless search loops, this service dynamically tracks player wait times and expands the matchmaking search range (MMR thresholds and ping limits) at scheduled intervals, expanding the pool of candidate opponents.

---

## 2. User Stories

### 2.1. Search Optimization
* **US-1.1:** As a player in queue during off-peak hours, I want the matchmaking boundaries to widen automatically so that I can find a game instead of waiting indefinitely.
* **US-1.2:** As an elite player with high MMR, I want the system to gradually search slightly lower tiers if no direct peers are online so that I can get into a match.

---

## 3. Functional Requirements

### 3.1. Wait-Time Tracking
* **FR-1.1:** The matchmaker must log the queue entry timestamp of every session.
* **FR-1.2:** Track queue elapsed duration in real-time.

### 3.2. Threshold Expansion Formula
* **FR-2.1 (MMR Expansion Schedule):**
  * **0 - 15 seconds:** Match within tight range: $\pm 50 \text{ MMR}$.
  * **At 15 seconds:** Initiate expansion.
  * **Every 5 seconds after:** Expand MMR range by $+20 \text{ MMR}$ and maximum ping tolerance by $+10\text{ms}$.
* **FR-2.2 (Max Limit Cap):** To prevent extremely unbalanced games, the MMR expansion must cap at a maximum deviation of $\pm 400 \text{ MMR}$ and a max latency cap of $250\text{ms}$.

---

## 4. API Endpoints

### 4.1. Queue Telemetry
#### `GET /api/v1/queue/telemetry`
* **Description:** Retrieves active queue volumes and average wait times.
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "active_queues": {
      "RANKED_5V5": {
        "players_in_queue": 1540,
        "avg_wait_time_seconds": 22.4
      }
    }
  }
}
```

---

## 5. Database Schema

Dynamic queue parameters are maintained in Redis memory keys (e.g., hash keys `queue:session:expiry`). Logs are persisted to standard database metrics for system analysis:

```sql
-- Queue logs
CREATE TABLE queue_expansion_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL,
    elapsed_seconds INT NOT NULL,
    expanded_mmr_range INT NOT NULL,
    expanded_ping_range INT NOT NULL,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Security Requirements

* **Anti-Spoofing:** All queue expansion math must execute on the backend server. The client has no input parameters to manipulate their search thresholds.
* **Telemetry Protection:** Cache statistics must be read-only for public endpoints, preventing raw player ID exposures.

---

## 7. Validation Rules

* **Expansion Limits:** Max MMR delta cannot exceed 30% of the player's starting MMR rating.

---

## 8. Error Handling

* **404 Not Found (`SESSION_EXPIRED`):** Polling statuses of queue keys that have been cleaned up or matched.

---

## 9. Acceptance Criteria (BDD Format)

#### Scenario: Scheduled MMR Threshold Expansion
* **Given** Player A (MMR 1000) is in queue,
* **When** their queue wait time reaches 20 seconds (5 seconds past the 15s limit),
* **Then** the matchmaker must expand their search range from initial bounds ($\pm 50$ MMR) to expanded bounds ($\pm 70$ MMR).

---

## 10. Edge Cases & Mitigations

### 10.1. Back-to-Back Match Cancellation
* **Issue:** After waiting in queue for 3 minutes (highly expanded MMR bounds), a match is found but a player declines, returning everyone to queue.
* **Mitigation:** Retain 50% of the elapsed time credits for the remaining players, putting them at the front of the queue with moderately expanded search parameters to find a new match quickly.
