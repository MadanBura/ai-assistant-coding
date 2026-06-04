# Feature Specification: Revenue Forecasting Engine
## Feature ID: FE-RPA-2 (Priority 11)

---

## 1. Purpose
To calculate expected revenue projections for upcoming periods by combining weighted pipeline calculations (Active Deal Values multiplied by Stage Close Probabilities) with historical sales run-rates.

---

## 2. User Stories
* **US-RPA-002:** As a VP of Sales, I want to view a monthly weighted revenue forecast so that I can report expected business performance to executives.
* **US-RPA-006:** As a Sales Manager, I want to compare expected pipeline forecasts against our quota target gaps so that I can direct outbound campaigns to fill shortfalls.
* **US-RPA-007:** As a Sales Representative, I want to see my personal expected commission forecast so that I can see the financial outcomes of closing active deals.

---

## 3. Functional Requirements
1. **FR-FORE-001:** The system shall calculate the Weighted Pipeline Forecast for a designated period using the formula:
   $$\text{Weighted Forecast} = \sum (\text{Active Deal Value} \times \text{Current Stage Default Probability})$$
2. **FR-FORE-002:** The system shall calculate a Historical Run-Rate Forecast based on the previous 3 quarters of closed deals:
   $$\text{Run-Rate} = \frac{\text{Closed-Won Deals in past 3 Quarters}}{\text{Total Days in past 3 Quarters}} \times \text{Days in Target Period}$$
3. **FR-FORE-003:** The system must allow Admins and Managers to configure custom Stage Probability weights that override default values.
4. **FR-FORE-004:** The system shall display forecasts categorized as "Commit" (Negotiation/Contract stage deals), "Best Case" (Discovery/Proposal stage deals), and "Pipeline" (overall sum).
5. **FR-FORE-005:** The forecast engine must generate output tables detailing: Total Pipeline Target, Expected Forecast, Gap-to-Quota, and Historical Accuracy Indexes.

---

## 4. Validation Rules
1. Default and custom stage probability values must be integers between `0` and `100` inclusive.
2. The forecast range targets must map to standard calendar limits: Current Month, Next Month, Current Quarter, Next Quarter.

---

## 5. Edge Cases
* **Edge Case 1 (Cold Start - No History):** If the CRM has zero historical closed deals (new installation), the run-rate forecast engine must return "Insufficient Data" and fallback to display the weighted pipeline calculation using default Admin weights (e.g. Discovery = 10%, Proposal = 50%, Negotiation = 80%).
* **Edge Case 2 (Outlier Deals):** A single deal of extremely large value (e.g. 10x the average deal size) can skew expected values. The engine must flag "Outlier Deals" (deals exceeding 3 standard deviations from average deal value) and provide a toggle button to "Exclude Outliers" from the forecast summary.

---

## 6. Dependencies
* **FE-SPD-1:** Kanban Deal Board (requires deal values and stages to compute formulas).
* **FE-SPD-2:** Multiple Sales Pipelines (requires default stage win probability percentages).
* **FE-TAS-1:** Team Directory & Quotas (requires target quotas to compute forecast-to-quota gaps).

---

## 7. API Requirements

### 7.1 Fetch Weighted Forecast
* **URL:** `/api/v1/forecast/weighted`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <Token>`
* **Parameters:** `pipeline_id` (UUID), `period` (VARCHAR "2026-Q2")
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "forecast": {
      "period": "2026-Q2",
      "quota_target": 500000.00,
      "weighted_value": 420000.00,
      "gap_to_quota": 80000.00,
      "categories": {
        "commit": 300000.00,
        "best_case": 120000.00
      }
    }
  }
  ```

### 7.2 Save Forecast Overrides
* **URL:** `/api/v1/forecast/overrides`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <Token>` (Admin Only)
* **Payload:**
  ```json
  {
    "stage_id": "87920ab2-fc43-4e4b-9f93-131dbfa2cfd1",
    "override_probability": 25
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "stage_id": "87920ab2-fc43-4e4b-9f93-131dbfa2cfd1",
    "new_probability": 25
  }
  ```

---

## 8. Database Impact
* **Table access:** Read access on `DEALS`, `PIPELINE_STAGES`, and `QUOTAS`.
* **Table:** `FORECAST_OVERRIDES`
  - Columns: `id` (UUID PK), `stage_id` (UUID FK to `PIPELINE_STAGES`), `override_probability` (INT), `created_by` (UUID FK to `USERS`), `updated_at` (TIMESTAMP).

---

## 9. UI Components
* **Forecast Workspace Dashboard:** Splitted display. Left: Table breakdown of target, forecast, and gaps. Right: Bullet gauge and trend charts.
* **Stage Override Settings:** Forms mapping sliders to pipelines, allowing admins to tweak win probabilities.
* **Outlier Warning Banner:** Top panel appearing when anomalous high-value deal cards are found in the calculation set.

---

## 10. Security Requirements
* Write actions on forecast overrides endpoint restricted to Admin roles.
* Sales Representatives are restricted from loading Team forecast tables; they can only load personal forecast summaries.

---

## 11. Acceptance Criteria (AC)
* **AC-RPA-002:** Given a set of active deals, when the forecasting page requests expected values, the system must calculate expected revenue by summing each deal's value multiplied by its stage probability.
* **AC-RPA-006:** Given no historical closed-won data exists, when the run-rate calculator runs, then the system must fallback to weighted pipeline numbers without crashing.
* **AC-RPA-007:** Given a user overrides a stage probability value, subsequent forecast queries must calculate estimates using the updated probability weight.

---

## 12. Definition of Done (DoD)
1. Forecasting mathematical computation unit tests cover rounding errors, large numbers, and boundary states.
2. API queries verified to complete in under 200ms with mock datasets containing 10,000 deal rows.
3. User authorization checks for manager and rep data boundaries validated via E2E testing tools.
