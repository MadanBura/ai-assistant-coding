# Feature Specification: Unified Product Backlog Planner

## 1. Executive Summary & Value Proposition
Agile execution relies on a clear, well-groomed list of tasks. This feature introduces a unified Backlog planning view where teams can view their global task backlog, prioritize features through keyboard reordering or drag-and-drop actions, assign story point estimates, and assign tasks directly to Sprint schedules.

---

## 2. Target User Stories
* **Story 1:** As a Product Manager, I want to view all unassigned issues in a consolidated Backlog list, so I can plan future releases.
* **Story 2:** As a PM, I want to drag cards or use quick controls to reorder tasks in the Backlog, ensuring developers tackle high-value tasks first.
* **Story 3:** As an engineer, I want to quickly add story points (Fibonacci sequence: 1, 2, 3, 5, 8, 13) to tasks during grooming, so that team velocity can be calculated.

---

## 3. Detailed Functional Scope

### 3.1. Backlog View Layout
* Displays a list of issues not yet associated with any completed or active sprint.
* Renders issues as condensed list items containing: Issue Key, Title, Priority Badge, Story Points Badge, Assignee Avatar, and Target Sprint tag.
* Expandable/collapsible panels separating the main "Backlog" list from planned "Sprint" containers.

### 3.2. Task Prioritization
* Allows ranking list items by dragging tasks vertically up or down.
* High-priority items sit at the top. The index order determines task rank.

### 3.3. Story Points & Estimates
* Inline editor allowing quick edits of Story Points on each backlog line item.
* Restricts values to standard agile estimators: `0, 1, 2, 3, 5, 8, 13, 21` (or custom values).

### 3.4. Sprint Assignment
* Users can drag issues from the Backlog panel and drop them into a "Sprint" panel.
* Dynamic calculations update the total estimated story points for the target Sprint dynamically as items are added.

### 3.5. Issue Tracking Integrations
* Backlog list must support inline creation: typing a ticket title, pressing Enter, and instantly appending it to the bottom of the list.

---

## 4. API Interface Design

### 4.1. Update Task Story Points
* **Endpoint:** `PATCH /api/v1/issues/:issueId/estimate`
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
  ```json
  {
    "storyPoints": 5
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "id": "e9821c2a-928d-4ba3-81a1-9a7c88de0b18",
    "storyPoints": 5,
    "updatedAt": "2026-06-03T22:11:52Z"
  }
  ```

### 4.2. Assign Issue to Sprint
* **Endpoint:** `PATCH /api/v1/issues/:issueId/assign-sprint`
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
  ```json
  {
    "sprintId": "d091ac8e-1c3b-4ab2-811c-d901bc26b1f2"
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "id": "e9821c2a-928d-4ba3-81a1-9a7c88de0b18",
    "sprintId": "d091ac8e-1c3b-4ab2-811c-d901bc26b1f2"
  }
  ```

---

## 5. UI/UX Specifications
* **List Row Elements:** Slim lines, minimal padding. Displays hover handles for dragging on the left.
* **Estimate Dropdown:** Simple popover selector containing the Fibonacci numbers.
* **Search Filters:** Top bar with active filters: search by name, filter by assignee, filter by labels.

---

## 6. Acceptance Criteria & Verification

### Automated Verification
1. **Backlog Fetch Query:** Assert that calling the backlog endpoint returns only issues with a status of `todo/in_progress` AND where `sprint_id IS NULL`.
2. **Estimate Constraint Validation:** Validate that updating story points with non-integer strings triggers an validation error (HTTP 422).

### Manual Verification
1. Open the Backlog planner view. Drag a ticket from the Backlog container into "Sprint 1". Verify that the total story points tally at the top of Sprint 1 updates instantly.
2. Filter the backlog using a teammate's name. Confirm that the backlog rows reduce only to issues assigned to them.
