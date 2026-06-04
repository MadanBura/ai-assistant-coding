# Feature Specification: Status-based Approval Gate
## Feature ID: FEAT-501

---

## 1. Purpose
Implement a strict, status-based quality control workflow that acts as a hard gate preventing unapproved social media posts from being published. Define transition states (`DRAFT` -> `PENDING_REVIEW` -> `APPROVED` or `REJECTED/DRAFT`), lock down approved posts from editors, and enforce time-lock windows close to publication runtime.

---

## 2. User Stories
* **US-501:** As an Editor, I want to submit a completed draft for review, change its status to `Pending Review`, and automatically notify the assigned Approvers.
* **US-502:** As an Approver, I want to review pending posts, view their live previews (desktop/mobile simulators), and either approve them (changing status to `Approved` and queuing them for release) or reject them (changing status to `Rejected/Draft`).

---

## 3. Functional Requirements
1. **FR-501-1:** A post record MUST adhere to the following workflow states: `DRAFT`, `PENDING_REVIEW`, `APPROVED`, `PUBLISHED`, and `FAILED`.
2. **FR-501-2:** Users with `EDITOR` and `ADMIN` roles can transition a post from `DRAFT` to `PENDING_REVIEW`.
3. **FR-501-3:** Only users with `APPROVER` or `ADMIN` roles can transition a post status to `APPROVED` or reject it (transitioning back to `DRAFT`).
4. **FR-501-4:** The system MUST prevent an Editor from modifying post caption, media, or schedule settings once a post's status is `APPROVED`.
5. **FR-501-5:** If a post is scheduled to go live in less than 10 minutes, the status CANNOT be transitioned out of `APPROVED` or modified by any user role (including Admins) to prevent race conditions with the publisher worker.
6. **FR-501-6:** Submitting a post to `PENDING_REVIEW` MUST trigger a real-time event that generates dashboard notifications and email alerts for all workspace Approvers and Admins.
7. **FR-501-7:** The review screen MUST show live preview simulators mimicking feed layouts of native platforms (mobile & desktop views).

---

## 4. Validation Rules
* **Status Transitions Diagram:**
  ```
  [DRAFT] <---- (Reject) ----+
     |                       |
  (Submit)                   |
     v                       |
  [PENDING_REVIEW] --------->+
     |
  (Approve)
     v
  [APPROVED] ----(Execute)----> [PUBLISHED] / [FAILED]
  ```
* **Lockout Window Check:** At the moment of any update or status modification request, the system runs:
  `currentTime + 10 minutes <= post.scheduled_time`
  If false and post is `APPROVED`, reject request with a code `400 Bad Request` and message: *"Post is locked for queue release."*

---

## 5. Edge Cases
* **Scheduling Time is Passed While in Review:** If a post is still in `PENDING_REVIEW` when its `scheduled_time` is reached, it must NOT be published. When an Approver subsequently reviews and approves it, the system must detect that the scheduled time is historical and prompt the Approver: *"Scheduled time has passed. Please select a new publication time to approve."*
* **Changing Approver Status mid-review:** If an Approver's permission role is revoked while they are looking at the review screen, the API MUST reject their approval command and return a `403 Forbidden` code.
* **Bulk Approval Execution:** If an Admin selects multiple posts in the list view to bulk-approve, the backend validation query must run single-transaction isolation audits for each post ID, skipping and flagging those that fall inside their 10-minute lockout window.

---

## 6. Dependencies
* **Workspace Role Mapping:** Relies on permissions checks against the `USER_WORKSPACE_ROLE` table.
* **WebSocket/Notification Service:** Required to alert approvers when items change status to `PENDING_REVIEW`.

---

## 7. API Requirements

### 7.1 Submit Post for Review
* **POST `/api/v1/posts/:post_id/submit`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Response `200 OK`:**
  ```json
  {
    "post_id": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
    "status": "PENDING_REVIEW",
    "updated_at": "2026-06-04T16:35:00Z"
  }
  ```

### 7.2 Approve Post
* **POST `/api/v1/posts/:post_id/approve`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Response `200 OK`:**
  ```json
  {
    "post_id": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
    "status": "APPROVED",
    "approved_by": "uuid-approver-user",
    "updated_at": "2026-06-04T16:36:00Z"
  }
  ```

### 7.3 Reject Post
* **POST `/api/v1/posts/:post_id/reject`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Request Body:**
  ```json
  {
    "rejection_reason": "Typo in caption. Please correct 'SaaS' capitalization."
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "post_id": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
    "status": "DRAFT",
    "updated_at": "2026-06-04T16:37:00Z"
  }
  ```

---

## 8. Database Impact
Updates the `status` and `approved_by` fields in the `POST` table, and logs rejection comments. Adding a `POST_REJECTION_HISTORY` log table:

```sql
CREATE TABLE post_rejection_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    rejected_by UUID NOT NULL REFERENCES "user"(id),
    rejection_reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rejection_post ON post_rejection_history(post_id);
```

---

## 9. UI Components
* **Approver Review Center:** Interface dedicated to reviewing pending content. Contains live rendering simulators and decision action buttons (`Approve` in green / `Reject` in red).
* **Rejection Reason Modal:** Displays a text area inputting why a post was sent back to draft status.
* **Status Badges:** Color indicators displayed on post list tables and headers.

---

## 10. Security Requirements
1. **Approval Authorization Check:** The backend `/api/v1/posts/:post_id/approve` and `/:post_id/reject` endpoints MUST verify that the authenticated user possesses an `APPROVER` or `ADMIN` role for the post's target workspace in the database.
2. **Editor Read-Only Block:** Write requests (`PUT`, `DELETE`) targeting posts in `APPROVED` status must check caller credentials and return `403 Forbidden` if executed by an Editor.

---

## 11. Acceptance Criteria
* **AC-501-1:** Submit for review transitions post status to `PENDING_REVIEW` and triggers notifications to Approvers.
* **AC-501-2:** Approving transitions status to `APPROVED` and records the Approver ID.
* **AC-501-3:** Rejecting transitions status back to `DRAFT` and records the reason in the database rejection history log.
* **AC-501-4:** Editor role accounts cannot modify approved posts, yielding `403 Forbidden` responses.
* **AC-501-5:** If target post is within 10 minutes of schedule release, status change calls are rejected for all roles.

---

## 12. Definition of Done (DoD)
1. **Workflow Verification:** State machine transitions exhaustively validated using automated unit tests.
2. **Lockout Validation:** Time lock validation logic verified with tests verifying updates block at 9min 59sec.
3. **Notification Delivery:** Integrations verify simulated socket events trigger correctly.
