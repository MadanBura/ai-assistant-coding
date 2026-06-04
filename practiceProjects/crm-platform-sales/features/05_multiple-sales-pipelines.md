# Feature Specification: Multiple Sales Pipelines
## Feature ID: FE-SPD-2 (Priority 05)

---

## 1. Purpose
To allow sales managers and admins to construct and manage multiple distinct sales processes (pipelines) containing custom stages, display orders, and default closure probabilities (e.g., Enterprise Sales, SMB Sales, renewals).

---

## 2. User Stories
* **US-SPD-002:** As a Sales Manager, I want to define separate pipelines for Enterprise and SMB sales cycles so that our representatives follow appropriate qualification steps for different transaction sizes.
* **US-SPD-003:** As an Admin, I want to reorder stages and change default win-probabilities so that forecasting calculations remain aligned with our actual historical sales performance.

---

## 3. Functional Requirements
1. **FR-PIPE-001:** The system shall support creating multiple Pipelines (e.g. "Enterprise", "Inbound", "Renewals").
2. **FR-PIPE-002:** Each Pipeline must contain one or more Pipeline Stages in a sequential display order (e.g., Discovery, Qualification, Proposal, Won, Lost).
3. **FR-PIPE-003:** Each stage must possess a "Default Win Probability" percentage representing the likelihood of closing a deal in that stage.
4. **FR-PIPE-004:** The system shall restrict deleting a Pipeline Stage if there are active Deals associated with it. The user must first reassign the deals to a different stage.
5. **FR-PIPE-005:** The system shall validate stage transition pathways to prevent deals from bypassing critical pipeline steps unless permission overrides are set.

---

## 4. Validation Rules
1. Stage probability percentage must be an integer between `0` and `100` inclusive.
2. Stage position order must be sequential, positive integers starting from `1` (e.g. `1, 2, 3...`).
3. Pipeline names must be unique within a single tenant space.

---

## 5. Edge Cases
* **Edge Case 1 (Reordering Collision):** If two stages are assigned the same order position (e.g., two stages marked as Position 2) during updates, the system must automatically re-index subsequent positions to avoid overlap (e.g., push the latter to Position 3).
* **Edge Case 2 (Deleting the Last Stage):** A pipeline must contain at least one stage. The system must reject deletion calls targeting the final remaining stage in a pipeline with a `400 Bad Request` validation code: "A pipeline must contain at least one active stage".

---

## 6. Dependencies
* **FE-TAS-2 (RBAC):** Restricts pipeline modifications and setup actions to Admins and Managers.

---

## 7. API Requirements

### 7.1 Create Pipeline
* **URL:** `/api/v1/pipelines`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <Token>` (Admin Only)
* **Payload:**
  ```json
  {
    "name": "Enterprise Channel"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "pipeline": {
      "id": "e67d268a-6b45-4b07-a3f2-c7f8a7be8e70",
      "name": "Enterprise Channel"
    }
  }
  ```

### 7.2 Configure / Reorder Stages
* **URL:** `/api/v1/pipelines/:pipeline_id/stages`
* **Method:** `PUT`
* **Headers:** `Authorization: Bearer <Token>` (Admin or Manager Only)
* **Payload:**
  ```json
  {
    "stages": [
      { "id": "87920ab2-fc43-4e4b-9f93-131dbfa2cfd1", "name": "Discovery", "position": 1, "probability": 10 },
      { "id": "99920ab2-fc43-4e4b-9f93-131dbfa2cfd2", "name": "Negotiation", "position": 2, "probability": 80 }
    ]
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "updated_stages_count": 2
  }
  ```

---

## 8. Database Impact
* **Table:** `PIPELINES`
  - Columns: `id` (UUID PK), `name` (VARCHAR), `tenant_id` (UUID FK), `created_at` (TIMESTAMP).
* **Table:** `PIPELINE_STAGES`
  - Columns: `id` (UUID PK), `pipeline_id` (UUID FK to `PIPELINES`), `stage_name` (VARCHAR), `position_order` (INT), `default_probability` (INT), `created_at` (TIMESTAMP).
* **Constraints:** Composite unique index on `(pipeline_id, position_order)` to prevent stage order duplicate entries.

---

## 9. UI Components
* **Pipeline Configuration Panel:** Drag-and-drop vertical list builder where admins can add stage tags, drag rows to change order numbers, and adjust probability sliders.
* **Pipeline Switcher Dropdown:** Fast navigation picker used in the Deal Kanban board to switch dashboard states.

---

## 10. Security Requirements
* Write access restricted to Admin roles.
* Restrict GET operations on pipelines to users within the tenant database scope.

---

## 11. Acceptance Criteria (AC)
* **AC-SPD-003:** Given an Admin attempts to delete a pipeline stage containing 5 active Deals, when they request deletion, the server must reject with error code `400` and return details: "Stage cannot be deleted: 5 deals currently assigned".
* **AC-SPD-004:** Given a stage update contains a probability configuration of `120%`, when submitted, the system must trigger a validation error and refuse the save.

---

## 12. Definition of Done (DoD)
1. Complete unit tests verifying the ordering logic (auto-shifting offsets when inserting a stage mid-list).
2. Database index constraints deployed and checked under SQL validation procedures.
3. Frontend pipeline builders rendering correct input parameters.
