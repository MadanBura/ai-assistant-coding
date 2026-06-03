# Feature Specification: Agile Sprint Lifecycle Management

## 1. Executive Summary & Value Proposition
Agile teams require sprints to divide goals into time-boxed iterations. This feature handles the entire lifecycle of a Sprint—from creation, scheduling (dates and goals setting), tracking active tasks on the board, and completing the sprint with automated task rollover mechanisms.

---

## 2. Target User Stories
* **Story 1:** As a Scrum Master, I want to create a new Sprint container in the Backlog planner so I can start planning the team's capacity.
* **Story 2:** As a Scrum Master, I want to define start/end dates and sprint goals, and click "Start Sprint" to load the active board.
* **Story 3:** As a PM, I want to close the active sprint and choose whether remaining open items are moved to the general Backlog or carried forward to the next planned Sprint.

---

## 3. Detailed Functional Scope

### 3.1. Sprint Creation
* Sprints can be created within Scrum projects from the Backlog page.
* Newly created Sprints initialize in a `draft` status.
* Multiple draft sprints can be created sequentially to plan milestones ahead.

### 3.2. Sprint Scheduling
* "Start Sprint" triggers a modal requiring:
  * Sprint Name (prepopulated with "Sprint [Number]")
  * Duration (1 week, 2 weeks, 4 weeks, or custom)
  * Start Date & End Date (automatic date calculation based on duration)
  * Sprint Goal (freeform text area)
* Validation: A project can have only one `active` sprint at a time. Starting a sprint requires any existing active sprint to be completed first.

### 3.3. Active Sprint Tracking
* Once started, the sprint status changes to `active`.
* The board view is populated exclusively with tasks assigned to this active sprint.

### 3.4. Sprint Completion
* "Complete Sprint" button appears at the top right of the board.
* Shows a breakdown summary: "X completed tasks, Y remaining incomplete tasks."

### 3.5. Task Carry Forward
* The completion modal prompts the user to select the destination for incomplete tasks:
  * Option A: Move to Backlog (clears their `sprint_id`).
  * Option B: Move to Next Sprint (creates a draft sprint if none exists, updating their `sprint_id`).
* Upon confirmation, the sprint status transitions to `completed`.

---

## 4. API Interface Design

### 4.1. Start Sprint
* **Endpoint:** `PATCH /api/v1/sprints/:sprintId/start`
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
  ```json
  {
    "name": "Sprint 1: Core Authentication",
    "startDate": "2026-06-03T22:11:52Z",
    "endDate": "2026-06-17T22:11:52Z",
    "goal": "Implement signup, multi-tenant schemas and basic dashboards."
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "id": "d091ac8e-1c3b-4ab2-811c-d901bc26b1f2",
    "status": "active",
    "startDate": "2026-06-03T22:11:52Z",
    "endDate": "2026-06-17T22:11:52Z"
  }
  ```

### 4.2. Complete Sprint
* **Endpoint:** `POST /api/v1/sprints/:sprintId/complete`
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
  ```json
  {
    "incompleteTasksDestination": "next_sprint"
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "completedSprintId": "d091ac8e-1c3b-4ab2-811c-d901bc26b1f2",
    "status": "completed",
    "rolloverCount": 3,
    "nextSprintId": "c71a30c8-ab21-4f3b-81cc-d238128919b1"
  }
  ```

---

## 5. UI/UX Specifications
* **Active Sprint Board Header:** Displays the Sprint Goal in small italics, countdown timers (e.g. "5 days remaining"), and the primary "Complete Sprint" button.
* **Sprint Complete Modal:** Renders a progress summary (doughnut chart showing tasks completed vs incomplete) and clear action radio inputs for rollover rules.

---

## 6. Acceptance Criteria & Verification

### Automated Verification
1. **Concurrent Active Sprints Lock:** Attempt to start Sprint B when Sprint A is already `active`. Verify that the endpoint returns `400 Bad Request` with message "Another sprint is currently active".
2. **Rollover Execution Test:** Create a sprint with 3 complete tasks and 2 incomplete tasks. Call complete endpoint with `"incompleteTasksDestination": "backlog"`. Check database records to confirm the completed tasks are locked to the sprint and the 2 incomplete tasks have their `sprint_id` set to `null`.

### Manual Verification
1. Click "Complete Sprint" on the board. In the modal, select "Next Sprint". Go to the Backlog page and verify that the incomplete tasks now sit in a new draft container labeled "Sprint [Next]".
