# Feature Specification: Metrics Dashboard
## Feature ID: FEAT-601

---

## 1. Purpose
Provide creators and social media managers with an analytical dashboard that consolidates post performance metrics (impressions, clicks, comments, shares, engagement rates) across all connected social channels. Run automated nightly background scraper queries to fetch metrics directly from network developer APIs.

---

## 2. User Stories
* **US-601:** As a Creator or SMM, I want to view core metrics (impressions, clicks, likes, shares, comments, engagement rate) aggregated across all connected platforms in a unified dashboard.

---

## 3. Functional Requirements
1. **FR-601-1:** The backend MUST run a daily automated background scraper task (using cron/scheduler) to fetch audience growth metrics and individual post stats.
2. **FR-601-2:** The scraper task MUST use the encrypted API connection keys of each `SOCIAL_CHANNEL` to call external metrics endpoints.
3. **FR-601-3:** The dashboard API MUST return metric aggregations grouped by platform or combined.
4. **FR-601-4:** Supported aggregations include:
   * **Audience Growth:** Total followers over time.
   * **Reach:** Total impressions.
   * **Engagement Rate:** Calculation: `(likes + comments + shares + clicks) / impressions * 100`.
   * **Activity Feed:** List of top-performing published posts ordered by engagement.
5. **FR-601-5:** The frontend dashboard MUST render charts mapping trend metrics over selectable historical ranges: Last 7 Days, Last 30 Days, Last 90 Days.
6. **FR-601-6:** Chart visualizations MUST dynamically filter out platforms based on checkmark control selections.

---

## 4. Validation Rules
* **Range Verification:** Query parameter range filters must validate against a whitelist: `['7d', '30d', '90d']`. Defaults to `30d` if omitted.
* **Math Safety:** Prevent division-by-zero errors when calculating Engagement Rate if impressions value returns 0. If impressions = 0, default engagement rate value to `0.0%`.

---

## 5. Edge Cases
* **Platform Scraper Rate Limits:** If a social platform API returns a `429 Too Many Requests` error:
  1. The scraper job worker MUST pause, backing off using exponential delays.
  2. Attempt a maximum of 3 retries.
  3. If failures persist, record the status in worker logs, skip the target workspace for that platform, and resume scraping the remaining queues.
* **Integrations Disconnected:** If the credentials token of a workspace channel is invalid/expired during nightly metrics scraping:
  1. Skip API call for that channel.
  2. Insert an entry in the system alert table.
  3. Keep existing historical metric records intact (do not delete or zero out past dataset logs).

---

## 6. Dependencies
* **Analytical Graphing Library:** Frontend integration (e.g. Chart.js, Recharts, or Tremor) to plot vector canvas graphs.
* **OAuth Credentials availability:** Relies on active connections mapped under `FEAT-102`.

---

## 7. API Requirements

### 7.1 Fetch Workspace Analytics Summary
* **GET `/api/v1/analytics/summary`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Query Parameters:** `range=30d`, `platforms=linkedin,twitter`
* **Response `200 OK`:**
  ```json
  {
    "summary": {
      "total_impressions": 142050,
      "total_clicks": 8540,
      "total_engagements": 12500,
      "average_engagement_rate": 8.8,
      "follower_growth_count": 1205
    },
    "history": [
      {
        "date": "2026-06-01",
        "impressions": 4500,
        "clicks": 250,
        "followers": 15200
      },
      {
        "date": "2026-06-02",
        "impressions": 4800,
        "clicks": 280,
        "followers": 15240
      }
    ]
  }
  ```

### 7.2 Fetch Top Performing Posts
* **GET `/api/v1/analytics/top-posts`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Query Parameters:** `limit=5`
* **Response `200 OK`:**
  ```json
  {
    "posts": [
      {
        "post_id": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
        "platform": "linkedin",
        "caption": "Acme Summer Launch Preview",
        "impressions": 42000,
        "engagement_rate": 10.4,
        "published_time": "2026-06-02T10:00:00Z"
      }
    ]
  }
  ```

---

## 8. Database Impact
Creates a new analytics data cache schema `DAILY_METRIC_AGGREGATE` and references individual metric columns:

```sql
CREATE TABLE daily_metric_aggregate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    record_date DATE NOT NULL,
    follower_count INTEGER DEFAULT 0,
    impressions_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (workspace_id, platform, record_date)
);

CREATE INDEX idx_analytics_fetch ON daily_metric_aggregate (workspace_id, record_date);
```

---

## 9. UI Components
* **Metrics Summary Banner:** Scorecard row displaying core metric volumes (Impressions, Clicks, Growth, Engagement Rate) with percentage change comparison indicators.
* **Trend Area Chart:** Interactive canvas element showcasing tooltips on hover. Includes key toggles to hide/show specific metrics.
* **Leaderboard List:** Vertical card list sorted by total engagements showcasing thumbnail summaries of published posts.

---

## 10. Security Requirements
1. **Isolation Audit:** Metrics queries must execute strict workspace-level isolation scopes.
2. **Access Security Check:** Enforce that callers requesting raw analytics endpoints are mapped with roles `ADMIN`, `EDITOR`, `APPROVER`, or `VIEW_CLIENT` inside that workspace context.

---

## 11. Acceptance Criteria
* **AC-601-1:** Automated script pulls analytics datasets, logs details, and inserts metrics cleanly into aggregation tables.
* **AC-601-2:** Dashboard API outputs correct values matching math logic parameters.
* **AC-601-3:** Graph widgets filter metrics dynamically based on platform checkbox inputs.
* **AC-601-4:** Database calculations process safely without dividing by zero on empty impression periods.

---

## 12. Definition of Done (DoD)
1. **Calculation Verification:** Unit tests confirm math and aggregation calculations yield zero mistakes against raw sets.
2. **Mock Scraper Coverage:** Scraper workers verified under simulated rate limiting error responses.
3. **Database Performance:** Run index verification plans confirming queries resolve in <150ms on sample databases of 100k metric entries.
