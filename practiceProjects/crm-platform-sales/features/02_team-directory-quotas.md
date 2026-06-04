# Feature Specification: Team Directory & Quotas
## Feature ID: FE-TAS-1 (Priority 02)

---

## 1. Purpose
To enable administrators and sales managers to configure sales teams, assign sales representatives, and establish periodic financial quotas (revenue targets) to track performance.

---

## 2. User Stories
* **US-TAS-004:** As an Admin, I want to create teams and assign managers so that I can mirror our corporate organization structure.
* **US-TAS-005:** As a Sales Manager, I want to set and modify individual revenue quotas for my team members so that we have clear quarterly/monthly benchmarks.
* **US-RPA-001:** As a Sales Manager, I want to view team and individual quota progress against sales actuals so that I can monitor team efficiency.

---

## 3. Functional Requirements
1. **FR-TEAM-001:** System shall allow creation, updating, and deletion of Teams (e.g. "Enterprise Sales Group", "SMB Team").
2. **FR-TEAM-002:** The system must allow assigning a Sales Manager as the "Team Leader" and multiple Sales Representatives as "Team Members".
3. **FR-TEAM-003:** System shall support setting revenue Quotas associated with a specific User or Team for a designated time-box (monthly, quarterly, yearly).
4. **FR-TEAM-004:** Quotas must store Currency values (USD default) and associate with a target date range.
5. **FR-TEAM-005:** Team quotas must dynamically calculate as the sum of its individual members' quotas unless overridden by a Sales Manager.

---

## 4. Validation Rules
1. Quota values must be a decimal greater than or equal to `0.00`. Negative limits are rejected.
2. The date range for a Quota must not overlap with an existing quota period for the same user (e.g., User cannot have two "Q2 2026" quotas).
3. A user can only belong to one Team at a given time.

---

## 5. Edge Cases
* **Edge Case 1 (Rep Moves Mid-Period):** If a Sales Representative changes teams in the middle of a quota period, the system must trigger a dialog prompting options:
  - *Option A:* Keep all quota targets and historical deal closed-value credits with the original team.
  - *Option B:* Split quota and historical value proportionally based on the transfer date.
  - *Option C:* Relocate all quota and historical targets to the new team.
* **Edge Case 2 (Team with No Manager):** If a Team Manager is deactivated or removed, the team remains active, and dashboard quota metrics fallback to calculation modes under Admin oversight.

---

## 6. Dependencies
* **FE-TAS-2:** Role-Based Access Control (RBAC is required to enforce who can configure teams and view targets).

---

## 7. API Requirements

### 7.1 Create Team
* **URL:** `/api/v1/teams`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <Token>` (Admin Only)
* **Payload:**
  ```json
  {
    "team_name": "SMB West Coast",
    "manager_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "status": "success",
    "team": {
      "id": "778d2b6b-43d9-482a-a299-88bf8aee20ee",
      "team_name": "SMB West Coast",
      "manager_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "created_at": "2026-06-04T16:24:00Z"
    }
  }
  ```

### 7.2 Configure User Quota
* **URL:** `/api/v1/users/:user_id/quotas`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <Token>` (Admin or Manager Only)
* **Payload:**
  ```json
  {
    "amount": 120000.00,
    "currency": "USD",
    "period_type": "Quarterly",
    "start_date": "2026-07-01",
    "end_date": "2026-09-30"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "status": "success",
    "quota_id": "b3c9d74a-251f-44de-9e2d-e7dcf5a415ff",
    "amount": 120000.00,
    "period": "2026-Q3"
  }
  ```

---

## 8. Database Impact
* **Table:** `TEAMS`
  - Columns: `id` (UUID PK), `team_name` (VARCHAR), `manager_id` (UUID FK to `USERS`), `created_at` (TIMESTAMP).
* **Table:** `USERS` (Modification)
  - Add Column: `team_id` (UUID FK to `TEAMS`).
* **Table:** `QUOTAS`
  - Columns: `id` (UUID PK), `user_id` (UUID FK to `USERS`, Nullable), `team_id` (UUID FK to `TEAMS`, Nullable), `amount` (NUMERIC(15,2)), `currency` (VARCHAR), `start_date` (DATE), `end_date` (DATE), `created_at` (TIMESTAMP).

---

## 9. UI Components
* **Team Dashboard Screen:** Visual directories displaying listing of Teams, managers, and member cards.
* **Quota Configuration Form:** Input parameters for target amounts, period selection dropdown, date range selectors, and check-boxes for override calculations.
* **Quota Metric Progress Bar:** Colored visual indicators (Green: >100% achieved, Blue: 50%-99%, Orange: <50%).

---

## 10. Security Requirements
* Write access (`POST`, `PUT`, `DELETE`) on teams and quotas endpoints restricted to `Admin` and `Manager` roles.
* Sales Representatives are blocked from viewing team members' individual quotas. They can only view their own quotas.

---

## 11. Acceptance Criteria (AC)
* **AC-TAS-002:** Given an Admin enters team name and manager ID, when they save, then the database must insert the record and default the team membership arrays.
* **AC-TAS-003:** Given a Sales Manager enters a target quota of `-50000.00`, when submitted, then the system must reject the payload returning `400 Bad Request` indicating validation bounds error.
* **AC-TAS-004:** Given a Sales Rep requests quota targets for another Sales Rep, when parsed by security checks, then the server returns `403 Forbidden`.

---

## 12. Definition of Done (DoD)
1. DB schema changes executed and migrations script verified.
2. API routers unit tested with mock payload responses.
3. Front-end components rendering quota progression matching design metrics.
4. Input components tested against injection validations.
