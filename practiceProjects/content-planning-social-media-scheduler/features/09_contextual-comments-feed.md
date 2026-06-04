# Feature Specification: Contextual Comments Feed
## Feature ID: FEAT-502

---

## 1. Purpose
Facilitate team collaboration by providing a contextual, real-time comments thread on each scheduled post card. Team members (Admins, Editors, Approvers, and Clients) can write notes, ask for revisions, highlight issues, and receive push responses immediately via WebSocket connections.

---

## 2. User Stories
* **US-503:** As any team member, I want to leave comments and tag teammates directly on a post's detail view to discuss revisions.

---

## 3. Functional Requirements
1. **FR-502-1:** The comment engine MUST support listing all text comment threads associated with a specific `post_id`.
2. **FR-502-2:** Comments MUST display the author's name, profile avatar, role, and the relative timestamp (e.g., "5 minutes ago").
3. **FR-502-3:** The client app MUST connect to the backend server via WebSockets (Socket.io) to support real-time message delivery.
4. **FR-502-4:** If a user posts a comment, the WebSocket server MUST broadcast the new comment payload to all active clients currently viewing the details drawer for that `post_id`.
5. **FR-502-5:** **Fallback Protocol:** If the client WebSocket connection fails to initialize, the client MUST fall back to a long-polling REST API query executing once every 10 seconds.
6. **FR-502-6:** Users MUST be able to delete their own comments. Admins can delete any comment inside their workspace.
7. **FR-502-7:** The text editor MUST support standard markdown text representation (bold, italic, list items).

---

## 4. Validation Rules
* **Comment Body Size:** Must be between 1 and 1000 characters. Cannot be empty or comprise solely whitespace.
* **Workspace Match:** Comments can only be added/read if the authenticated user's workspace role check yields permissions for the target post's parent workspace.

---

## 5. Edge Cases
* **Post Deleted Mid-Discussion:** If a post is deleted by an Admin while another user is typing a comment, the next message dispatch from the client will return a `404 Not Found` API exception. The client handles this by locking the input field and alerting: *"This post has been deleted. Discarding changes."*
* **WebSocket Reconnect Sync:** If a user loses internet connectivity while viewing a thread, and reconnects 5 minutes later, the client must automatically trigger a standard `GET /api/v1/posts/:id/comments` fetch to sync and display any new messages written during their offline window.
* **Mentions Check (@user):** If a user types `@Name`, parse the input string on backend, verify the target username is a member of the active workspace, and dispatch an email alert containing a snippet of the comment.

---

## 6. Dependencies
* **WebSocket Library:** Integration of Socket.io (Node.js backend + client listener).
* **Relative Timestamp Parser:** Frontend component utilizing libraries like `dayjs` or `date-fns` to format output.

---

## 7. API Requirements

### 7.1 Fetch Post Comments
* **GET `/api/v1/posts/:post_id/comments`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Response `200 OK`:**
  ```json
  {
    "comments": [
      {
        "comment_id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
        "post_id": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
        "user": {
          "user_id": "uuid-user-1",
          "display_name": "Marcus Chen",
          "role": "EDITOR",
          "avatar_url": "https://creatorsuite.com/avatars/marcus.png"
        },
        "body": "Can we adjust the image crop slightly to emphasize the logo?",
        "created_at": "2026-06-04T16:40:00.000Z"
      }
    ]
  }
  ```

### 7.2 Post a Comment (REST Fallback + Initialization API)
* **POST `/api/v1/posts/:post_id/comments`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Request Body:**
  ```json
  {
    "body": "Done. Image replaced."
  }
  ```
* **Response `201 Created`:**
  ```json
  {
    "comment_id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6d",
    "body": "Done. Image replaced.",
    "created_at": "2026-06-04T16:42:00.000Z"
  }
  ```

---

## 8. Database Impact
Inserts records into the `COMMENT` table, referencing `POST` and `USER` tables:

```sql
CREATE TABLE comment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comment_post ON comment(post_id);
```

---

## 9. UI Components
* **Comments Drawer:** Side slider container containing:
  * Vertically scrollable history list showing comment text bubbles.
  * Message input box containing a Markdown toolbar.
  * User roles badges displayed next to usernames.
* **Comment Count Indicator:** Small speech bubble badge overlay indicating count of comments left on the parent calendar card.

---

## 10. Security Requirements
1. **Sanitization Filter:** Input text MUST pass rigorous HTML sanitization libraries (e.g. `DOMPurify` on frontend or `sanitize-html` on backend) to completely strip script inputs, CSS styling, or iframe injections.
2. **Access Authorization:** WebSocket connection setup MUST require JWT handshake verification. Refuse WebSocket subscription requests target to a `post_id` workspace if the socket user is not mapped in `USER_WORKSPACE_ROLE`.

---

## 11. Acceptance Criteria
* **AC-503-1:** Fetching post comments returns messages ordered sequentially from oldest to newest.
* **AC-503-2:** Posting a comment executes the write and immediately updates the views of other connected clients.
* **AC-503-3:** If socket fails, polling client kicks in and captures comment inputs successfully.
* **AC-503-4:** Users are blocked from writing comments on posts located in workspaces they are not members of.

---

## 12. Definition of Done (DoD)
1. **Real-time Tests:** Multi-browser simulations confirm that messages reflect instantly without reload actions.
2. **Security Checks:** Verify that markdown inputs containing JS scripts render safely as plain text and do not execute.
3. **Database Performance:** Verify that the `idx_comment_post` index is applied, ensuring rapid fetch speeds under high concurrent loads.
```
