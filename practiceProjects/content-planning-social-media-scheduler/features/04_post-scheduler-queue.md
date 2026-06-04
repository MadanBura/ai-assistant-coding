# Feature Specification: Post Scheduler Engine & Queue
## Feature ID: FEAT-202

---

## 1. Purpose
Define the core mechanism for creating, editing, and staging posts for future publication. Establish a resilient background scheduling worker queue that polls scheduled posts, validates execution requirements, and triggers API publishing calls to linked social networks (LinkedIn, Twitter/X, Facebook, and Instagram).

---

## 2. User Stories
* **US-203:** As an Editor, I want to create a new post, select target social networks, input text, attach media assets, and set a specific future publication date and time.
* **US-204:** As an SMM, I want to view a timeline/list of queued posts filtered by social network, status, and author.

---

## 3. Functional Requirements
1. **FR-202-1:** The API MUST allow creators to create a post specifying a caption, media ID references, scheduling time (ISO 8601 UTC), and an array of target platforms.
2. **FR-202-2:** Initial post records MUST default to state `DRAFT` or `PENDING_REVIEW` and cannot bypass approvals.
3. **FR-202-3:** Post creation MUST validate copy lengths:
   * Twitter/X: Max 280 characters.
   * LinkedIn: Max 3000 characters.
   * Instagram: Captions must not exceed 2200 characters and must include at least one media asset.
4. **FR-202-4:** The backend MUST utilize a background task queue (e.g. BullMQ / Redis) to process queue dispatches. A scheduler cron task runs every 60 seconds.
5. **FR-202-5:** The job runner MUST extract post attributes, check channel tokens, download media assets (where necessary for API compliance, or pass S3 links directly), and fire requests to provider endpoints.
6. **FR-202-6:** Successful publication transitions the post record to `PUBLISHED` and logs the external target URL/post reference ID.
7. **FR-202-7:** If publication fails, the scheduler MUST update the post status to `FAILED`, capture execution log diagnostics, and trigger an automated system-disconnected check.

---

## 4. Validation Rules
* **Scheduled Time:** Must be at least 15 minutes in the future from creation/update timestamp. Maximum schedule timeframe limit is 12 months.
* **Media Count Limits:** 
  * Twitter/X: Max 4 images or 1 video.
  * Instagram: Max 10 images/videos (carousel limits).
  * LinkedIn: Max 9 images or 1 video.

---

## 5. Edge Cases
* **Publishing During API Outage:** If a platform API returns 5xx errors or connection timeouts, the queue worker MUST attempt a retry:
  * Maximum: 3 retries.
  * Delay: Exponential backoff (retry 1: 2 min, retry 2: 10 min, retry 3: 30 min).
  * If still failing after 3 attempts, mark post as `FAILED` and log the detailed error traceback.
* **Simultaneous Double Dispatch:** Implement a database lock (e.g. `SELECT FOR UPDATE` or Redis lock key) on the post ID at queue fetch time to guarantee that the same post cannot be picked up by two concurrent worker instances.
* **Publishing Deleted Media:** If an attached media asset was deleted from S3 prior to execution, intercept worker run, skip publishing, set post to `FAILED`, and log: *"Attached asset is missing. Publishing cancelled."*

---

## 6. Dependencies
* **Redis Instance:** Necessary to queue and coordinate task schedules.
* **External API Adapters:** Interface handlers built for LinkedIn, Meta, and Twitter/X APIs.

---

## 7. API Requirements

### 7.1 Create a Post
* **POST `/api/v1/posts`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Request Body:**
  ```json
  {
    "platforms": ["linkedin", "twitter"],
    "caption": "Exciting product launch features!",
    "media_ids": ["c3b5d27a-8f9e-4b6a-8b83-a75d1f8876c1"],
    "scheduled_time": "2026-06-10T14:30:00.000Z"
  }
  ```
* **Response `201 Created`:**
  ```json
  {
    "post_id": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
    "status": "DRAFT",
    "scheduled_time": "2026-06-10T14:30:00.000Z",
    "created_at": "2026-06-04T16:25:00Z"
  }
  ```

### 7.2 Read Queue timeline
* **GET `/api/v1/posts/queue`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Query Parameters:** `status=PENDING_REVIEW,APPROVED`, `limit=20`, `offset=0`
* **Response `200 OK`:**
  ```json
  {
    "posts": [
      {
        "post_id": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
        "caption": "Exciting product launch features!",
        "platforms": ["linkedin", "twitter"],
        "status": "APPROVED",
        "scheduled_time": "2026-06-10T14:30:00.000Z"
      }
    ],
    "total_count": 1
  }
  ```

---

## 8. Database Impact
Updates database status values for target records in `POST`, links relations via `POST_MEDIA`, and inserts execution reports into `POST_PUBLISHING_LOG`:

```sql
CREATE TABLE post (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    caption TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'FAILED')),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    published_time TIMESTAMP WITH TIME ZONE,
    author_id UUID NOT NULL REFERENCES "user"(id),
    approved_by UUID REFERENCES "user"(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    media_asset_id UUID NOT NULL REFERENCES media_asset(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE post_publishing_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAIL')),
    error_message TEXT,
    external_post_id VARCHAR(255),
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_post_scheduled ON post(scheduled_time, status) WHERE status = 'APPROVED';
CREATE INDEX idx_post_workspace ON post(workspace_id);
```

---

## 9. UI Components
* **Post Composer Panel:** Form interface containing platform tabs, text input, asset attachment tray, schedule calendar picker, and control buttons.
* **Queue Timeline Feed:** List of upcoming posts ordered by date with platform badges and status indicator highlights.

---

## 10. Security Requirements
1. **Scope Validation Check:** Users must be validated for `EDITOR` or `ADMIN` roles in the workspace prior to inserting post records.
2. **Access token decryption:** Access keys retrieved by workers for social API connections must be decrypted on-the-fly and immediately disposed from memory after API requests finish execution.

---

## 11. Acceptance Criteria
* **AC-202-1:** Post records fail validation checks if character limits exceed target social network constraints.
* **AC-202-2:** Background worker picks up eligible posts, fires successful API publishing calls, updates database state to `PUBLISHED`, and logs third-party post reference IDs.
* **AC-202-3:** If third-party calls fail, retry triggers run, and final failures update status to `FAILED` with diagnostics logged.

---

## 12. Definition of Done (DoD)
1. **Mock Tests:** Queue schedulers verified using integration tests with mock HTTP endpoints for all 4 social API networks.
2. **Concurrency Verification:** Database query locking must demonstrate absolute prevention of double-publishing under parallel testing.
3. **Queue Health:** Server telemetry logs capture and display background queue worker performance statistics.
