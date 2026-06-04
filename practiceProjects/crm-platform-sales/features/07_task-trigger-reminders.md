# Feature Specification: Task Trigger & Reminders
## Feature ID: FE-CTA-2 (Priority 07)

---

## 1. Purpose
To enable sales representatives to create actionable tasks (Calls, Emails, Meetings, Todo items) linked to Leads, Contacts, or Deals, and receive automated system triggers and email alerts 15 minutes prior to the due date.

---

## 2. User Stories
* **US-CTA-002:** As a Sales Representative, I want to create a follow-up task with a target due date and time so that I can manage my daily sales workflow.
* **US-CTA-003:** As a Sales Representative, I want to receive an in-app browser alert and email notification 15 minutes before a task is due so that I do not miss critical customer engagements.
* **US-CTA-004:** As a Sales Manager, I want to assign task reminders to my team members so that I can allocate customer follow-up actions.

---

## 3. Functional Requirements
1. **FR-TASK-001:** The system shall record Task properties: Title (required), Description, Type (ENUM: `Call`, `Email`, `Meeting`, `Todo`), Due Date/Time (required), Status (ENUM: `Pending`, `Completed`), Assignee ID (required), and Association IDs (Lead ID, Contact ID, or Deal ID).
2. **FR-TASK-002:** The system shall run a background process (cron scheduler) every 60 seconds to search for tasks due in exactly 15 minutes.
3. **FR-TASK-003:** When a task matches the 15-minute window, the background process must:
   - Dispatch an SMTP email notification to the assignee's registered email address.
   - Publish a message to the WebSocket server to trigger a real-time in-app notification banner.
4. **FR-TASK-004:** The system shall allow users to mark tasks as "Completed", which cancels any scheduled background reminders.
5. **FR-TASK-005:** Real-time reminders must update the browser client interface using WebSockets without requiring page reloads.

---

## 4. Validation Rules
1. The Task Due Date/Time must be a future timestamp during creation. Post-dating tasks into the past is blocked.
2. A task must have at least one valid parent association ID (must link to a Lead, Contact, or Deal).

---

## 5. Edge Cases
* **Edge Case 1 (User is Offline during alert):** If a user is offline when a WebSocket trigger is emitted, the system must write the notification to a persistent queue and deliver it as a toast immediately when the user re-establishes their connection.
* **Edge Case 2 (Reassigning Tasks of Deactivated Reps):** When an Admin deactivates a user account, the system must block the update and prompt the admin to either reassign all active `Pending` tasks to an active user or delete them in bulk.
* **Edge Case 3 (Overdue Tasks):** If a task passes its due date without being marked "Completed", the system must flag its status text in red as "Overdue" and position it at the top of the user's dashboard task widget.

---

## 6. Dependencies
* **FE-TAS-2 (RBAC):** Restricts viewing and creating tasks to authorized users.
* **FE-LCM-1 / FE-LCM-2:** Required to link tasks to existing Leads, Contacts, or Companies.

---

## 7. API Requirements

### 7.1 Create Task
* **URL:** `/api/v1/tasks`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <Token>`
* **Payload:**
  ```json
  {
    "title": "Call Marcus regarding contract",
    "type": "Call",
    "due_date": "2026-06-04T18:00:00Z",
    "assignee_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "deal_id": "52857e3f-67cf-4545-be02-4c2847a989ef"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "task": {
      "id": "22857e3f-67cf-4545-be02-4c2847a989ef",
      "status": "Pending"
    }
  }
  ```

### 7.2 Update Task Status
* **URL:** `/api/v1/tasks/:id/status`
* **Method:** `PATCH`
* **Headers:** `Authorization: Bearer <Token>`
* **Payload:**
  ```json
  {
    "status": "Completed"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "task_id": "22857e3f-67cf-4545-be02-4c2847a989ef",
    "status": "Completed"
  }
  ```

---

## 8. Database Impact
* **Table:** `TASKS`
  - Columns: `id` (UUID PK), `title` (VARCHAR), `description` (TEXT), `type` (VARCHAR), `due_date` (TIMESTAMP), `status` (VARCHAR), `assignee_id` (UUID FK to `USERS`), `lead_id` (UUID FK to `LEADS`, Nullable), `contact_id` (UUID FK to `CONTACTS`, Nullable), `deal_id` (UUID FK to `DEALS`, Nullable), `created_at` (TIMESTAMP).
* **Indexes:** Non-clustered index on `(assignee_id, due_date, status)` to optimize cron job polling queries.

---

## 9. UI Components
* **Task Composer Widget:** Sidebar/modal form with details input, due date picker, type picker, and association lookup search bar.
* **Dashboard Task List:** A panel rendering cards representing tasks sorted by due dates. Includes visual color alerts:
  - *Red:* Overdue.
  - *Orange:* Due today (under 24h).
  - *Gray:* Due later.
* **In-app Notification Banner:** Floating browser toast appearing dynamically in the top right corner.

---

## 10. Security Requirements
* Verify that the logged-in user possesses read access to the linked Deal/Contact before saving the task.
* Implement Rate-limiting on task alerts email dispatcher to prevent mail spamming.

---

## 11. Acceptance Criteria (AC)
* **AC-CTA-003:** Given a task scheduled for 10:15 AM, when the background scheduler executes at 10:00 AM, then the system must dispatch an email reminder and trigger the WebSocket toast notification.
* **AC-CTA-004:** Given a user is offline during their task due window, when they re-authenticate and open the dashboard, then the queued notification must display immediately.
* **AC-CTA-005:** Given a user attempts to create a task in the past, when they submit, the API must reject the call with code `400` validation error.

---

## 12. Definition of Done (DoD)
1. WebSocket notification delivery checked under 500 concurrent client simulations.
2. Background cron script test cases achieve 100% path coverage.
3. Frontend calendar inputs tested to ensure browser timezone conversions are offset correctly before API delivery.
