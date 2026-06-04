# Feature Specification: Kanban Deal Board
## Feature ID: FE-SPD-1 (Priority 06)

---

## 1. Purpose
To provide a visual drag-and-drop Kanban board interface that maps Deal records to columns representing Pipeline Stages, aggregates pipeline values in real-time, and guides users through qualified sales actions.

---

## 2. User Stories
* **US-SPD-001:** As a Sales Representative, I want to drag my Deal card from "Discovery" to "Proposal Sent" so that I can update the sales stages quickly during client negotiations.
* **US-SPD-005:** As a Sales Representative, I want to see a visual warning tag on Deal cards that have had no logged activity for over 7 days so that I know which leads are slipping.
* **US-RPA-003:** As a Sales Manager, I want to see aggregated stage totals on the pipeline view so that I can quickly assess the health of our active pipeline.

---

## 3. Functional Requirements
1. **FR-DEAL-001:** The system shall display deals in vertical column lanes representing the stages of the selected pipeline.
2. **FR-DEAL-002:** The system must allow users to move Deal cards between columns via drag-and-drop actions.
3. **FR-DEAL-003:** Moving a deal card must invoke an asynchronous API PATCH request to update `pipeline_stage_id` and recalculate stage value metrics instantly.
4. **FR-DEAL-004:** Dragging a Deal to "Closed-Won" or "Closed-Lost" columns must intercept the action and display a modal demanding input for:
   - **Closed-Won:** `actual_value` (positive numeric) and `close_date` (current or historical date).
   - **Closed-Lost:** `lost_reason` (text explanation).
5. **FR-DEAL-005:** Card item elements must show: Deal Name, Associated Company, Value, Owner Avatar, and a "Stagnant" warning icon if no activity is logged in the past 7 days.

---

## 4. Validation Rules
1. Deal Value must be positive, stored as `NUMERIC(15, 2)`.
2. Close dates must be valid calendar dates formatted as `YYYY-MM-DD`.
3. If the deal update API receives an invalid stage ID, the transaction must reject and trigger a client roll-back action.

---

## 5. Edge Cases
* **Edge Case 1 (User Cancels Close Modal):** If a user drags a card to "Closed-Won" but dismisses the modal or cancels, the card must revert immediately to its pre-drag column coordinate, and no database edit should be made.
* **Edge Case 2 (Large Datasets):** Pipelines containing >100 active cards per column must leverage lazy loading (infinite scrolling) within columns to prevent DOM bottlenecks and script lags.
* **Edge Case 3 (Multi-Window Edits):** If Representative A moves a deal that was deleted by Representative B 5 seconds prior, the server must return a `404 Not Found` response, and Representative A's frontend must remove the card and show a warning notification.

---

## 6. Dependencies
* **FE-LCM-2:** Contact & Company Directory (required to associate contacts/accounts to deals).
* **FE-SPD-2:** Multiple Sales Pipelines (required to render pipeline structures and stages).

---

## 7. API Requirements

### 7.1 Fetch Deals for Pipeline
* **URL:** `/api/v1/deals`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <Token>`
* **Parameters:** `pipeline_id` (UUID), `limit` (INT), `offset` (INT)
* **Response (200 OK):**
  ```json
  {
    "status": "success",
    "deals": [
      {
        "id": "52857e3f-67cf-4545-be02-4c2847a989ef",
        "name": "Acme - Enterprise Cloud License",
        "value": 150000.00,
        "company_name": "Acme Corp",
        "pipeline_stage_id": "87920ab2-fc43-4e4b-9f93-131dbfa2cfd1",
        "owner_avatar": "https://cdn.apexsales.com/avatars/rep1.png",
        "days_since_activity": 4
      }
    ]
  }
  ```

### 7.2 Move Deal Stage
* **URL:** `/api/v1/deals/:id/stage`
* **Method:** `PATCH`
* **Headers:** `Authorization: Bearer <Token>`
* **Payload:**
  ```json
  {
    "target_stage_id": "c1f72922-a9b0-466d-888e-17ef367ba4f3",
    "actual_value": 150000.00,
    "close_date": "2026-06-04",
    "lost_reason": null
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "deal_id": "52857e3f-67cf-4545-be02-4c2847a989ef",
    "stage_id": "c1f72922-a9b0-466d-888e-17ef367ba4f3"
  }
  ```

---

## 8. Database Impact
* **Table:** `DEALS`
  - Columns: `id` (UUID PK), `name` (VARCHAR), `value` (NUMERIC(15,2)), `account_id` (UUID FK to `ACCOUNTS`), `contact_id` (UUID FK to `CONTACTS`), `pipeline_stage_id` (UUID FK to `PIPELINE_STAGES`), `owner_id` (UUID FK to `USERS`), `close_date` (DATE), `lost_reason` (TEXT), `created_at` (TIMESTAMP).
* **Triggers:** Any stage change writes a row to the `ACTIVITIES` tracking timeline.

---

## 9. UI Components
* **Kanban Board Container:** Multi-lane horizontal layout with drag boundary limits.
* **Deal Card Element:** Displays deal information, visual stagnancy tag warning, and hover effects.
* **Drag-and-Drop Handler Library:** Built on React Beautiful DND or HTML5 drag interfaces.
* **Deal Close Capture Modal:** Prompt capturing value inputs, calendar selectors, and validation summaries.

---

## 10. Security Requirements
* Sales Representatives are restricted to drag cards owned by themselves or manually delegated accounts.
* Sanitize all text fields (like `lost_reason`) against HTML characters to prevent script injection.

---

## 11. Acceptance Criteria (AC)
* **AC-SPD-001:** Given a user drops a Deal card onto another column, when the database update is committed, the columns totals must update dynamically without full page reflow.
* **AC-SPD-002:** Given a Deal card is moved to Closed-Won, when the user closes the pop-up data prompt without entering values, the card must snap back to its original location.
* **AC-SPD-005:** Given a Deal has no activities logged within the database for the last 8 days, when rendered on the Kanban board, it must show a red warning icon.

---

## 12. Definition of Done (DoD)
1. E2E browser tests (Playwright) verifying card dragging, dropping, and target column value calculations.
2. Index benchmarks evaluated for GET query routines to fetch deals under heavy load.
3. Component verified for layout stability down to 1024px tablet monitors.
