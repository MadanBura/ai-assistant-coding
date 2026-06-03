# Feature Specification: Contextual Comments & @Mention Notifications

## 1. Executive Summary & Value Proposition
Collaboration happens directly in the context of the work. This feature implements comments inside tasks, letting teammates debate technical options or leave feedback. It integrates a user mention system (`@username`) that automatically registers in-app notifications and dispatches emails if the user is offline.

---

## 2. Target User Stories
* **Story 1:** As a Developer, I want to leave comments on a task detailing why a specific architecture was chosen, so other team members have context.
* **Story 2:** As a PM, I want to type `@aadil Please verify this QA criteria` so that Aadil is notified immediately to review the ticket.
* **Story 3:** As an offline engineer, I want to receive an email alert with a direct link to the task whenever I am mentioned.

---

## 3. Detailed Functional Scope

### 3.1. Task Comments List
* Comments section at the bottom of the task modal displaying details in reverse-chronological order.
* Allows authors to edit or delete their own comments within 24 hours of creation.

### 3.2. Markdown Support
* Comments field supports markdown tags (lists, code snippets, bold formatting).

### 3.3. User Mentions (`@username`)
* Typing `@` triggers a popover search panel displaying workspace member matching names.
* Selecting a member parses the mention into a markup sequence (e.g. `<mention userId="uuid">@Aadil</mention>`).

### 3.4. In-App Notifications
* A global notification center (bell icon) in the header.
* Triggers real-time unread count badges. Clicking the item highlights the text, and routes the user to the target issue modal.

### 3.5. Email Alerts
* Scheduled jobs evaluate if a mentioned user is active (last active status timestamp < 5 minutes ago).
* If user is offline, an email containing the commenter's avatar, task key, and comment snippet is sent via integration (e.g. SendGrid, Resend).

---

## 4. API Interface Design

### 4.1. Add Task Comment
* **Endpoint:** `POST /api/v1/issues/:issueId/comments`
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
  ```json
  {
    "body": "Hey @aadil, I resolved the merge conflicts. Let's merge."
  }
  ```
* **Response Body (201 Created):**
  ```json
  {
    "id": "c198df21-3a1c-4b3b-811c-d901bc26b1a2",
    "body": "Hey @aadil, I resolved the merge conflicts. Let's merge.",
    "author": {
      "id": "b90fd21a-45c1-4b13-912f-9273f081ee8b",
      "displayName": "John Doe"
    },
    "createdAt": "2026-06-03T22:11:52Z"
  }
  ```

---

## 5. UI/UX Specifications
* **Mention Dropdown UI:** Renders directly beneath the cursor inside the textbox, supporting arrow-keys navigation and Enter-to-select.
* **Notification Bell:** Animates with a shake/wobble micro-interaction when a new notification is delivered.

---

## 6. Acceptance Criteria & Verification

### Automated Verification
1. **Mention Parsing Test:** Post a comment containing `@user1`. Check database insertion to verify the system creates a notification row matching `user1`'s ID.
2. **Delete Restrict Validation:** Attempt to delete comment using User B credentials when the comment belongs to User A. Assert error is `403 Forbidden`.

### Manual Verification
1. Open a task details panel. Type comment text and include `@`. Select a team member. Submit the comment.
2. Log in as the mentioned team member in another browser. Verify that the bell icon displays a red dot, and clicking it displays the comment detail linking directly to the task.
