# Feature Specification: Interactive Kanban Board with Drag-and-Drop

## 1. Executive Summary & Value Proposition
Visual board tracking provides an intuitive, high-level overview of team progress. This feature implements an interactive Kanban Board where tasks are rendered as cards inside status columns. Members can adjust task status by dragging cards across columns, manage columns, and experience instant updates.

---

## 2. Target User Stories
* **Story 1:** As a Developer, I want to drag my task from "To Do" to "In Progress" so that the team knows I have started working on it.
* **Story 2:** As an Admin, I want to add a new column named "QA Review" and place it between "In Progress" and "Done" to accommodate our QA process.
* **Story 3:** As a User, I want the card position to transition smoothly, and if saving fails, the card should snap back to its previous status with a notification.

---

## 3. Detailed Functional Scope

### 3.1. Drag & Drop Cards
* Uses library-less HTML5 Drag and Drop API or a library like `@hello-pangea/dnd` for smooth transitions.
* While dragging, column drop-zones must highlight. Drag states must handle 60 FPS transition speeds.
* Visually locks vertical/horizontal scrolling during dragging to prevent erratic screen jumps.

### 3.2. Column Management
* Add Column: Append custom columns to the right side of the board.
* Rename Column: Double click header to inline-edit names.
* Delete Column: Removes column. Users are prompted to move remaining tasks in that column to another stage.

### 3.3. Status Tracking & Optimistic Updates
* Dragging a card triggers an optimistic UI change: the frontend updates card status and order index immediately.
* An asynchronous API patch (`PATCH /api/v1/issues/:issueId`) is sent.
* If API returns an error:
  * Revert card state back to original column and position.
  * Show a toast message indicating connection or authorization failure.

### 3.4. Board Reordering
* Supports shifting columns horizontally (e.g. swap "Testing" and "QA Review") updating the project workflow order index schema.

---

## 4. API Interface Design

### 4.1. Update Issue Position (Status / Order Index)
* **Endpoint:** `PATCH /api/v1/projects/:projectId/board/move`
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
  ```json
  {
    "issueId": "f784e201-1b2c-491a-810a-b9211c26b3e9",
    "targetStatus": "in_progress",
    "targetIndex": 2
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "success": true,
    "issueId": "f784e201-1b2c-491a-810a-b9211c26b3e9",
    "status": "in_progress",
    "index": 2
  }
  ```

---

## 5. UI/UX Specifications
* **Visual Styling:** HSL color variables styling task cards with borders indicating priority (Red for Urgent, Yellow for High, Grey for Low).
* **Hover Micro-animations:** Slight card elevation shadow shift and scale (1.01x) on hover.
* **Column Metrics:** Header displays total tasks count and aggregated story points inside that column.

---

## 6. Acceptance Criteria & Verification

### Automated Verification
1. **Drag Success Integration:** Trigger the mock drag event and assert the target API payload is correctly dispatched with expected `targetStatus` and `targetIndex`.
2. **Revert Validation:** Simulate an API network failure (500 status code) on card move and assert that the frontend state accurately rolls back.

### Manual Verification
1. Drag a card from "To Do" to "In Review". Check that the column card counts and story point aggregates recalculate instantly.
2. Log in as a `Viewer`. Verify that trying to drag cards is blocked and drag cursors do not render.
