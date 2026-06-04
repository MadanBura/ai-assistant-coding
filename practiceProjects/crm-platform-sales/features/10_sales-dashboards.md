# Feature Specification: Sales Dashboards
## Feature ID: FE-RPA-1 (Priority 10)

---

## 1. Purpose
To render real-time, interactive reporting dashboards that track core metrics such as pipeline value, sales velocity, conversion ratios, and representative quota attainment, enabling data-driven decision making.

---

## 2. User Stories
* **US-RPA-001:** As a Sales Manager, I want to view individual and team quota progression bars so that I know who is on track to hit targets.
* **US-RPA-004:** As a VP of Sales, I want to review lead-to-deal conversion funnel percentages so that I can evaluate marketing quality and lead velocity.
* **US-RPA-005:** As a Sales Representative, I want to view a personal activity leaderboard so that I can see how my output stacks up against goals.

---

## 3. Functional Requirements
1. **FR-DASH-001:** The system shall display aggregated metrics: Total Pipeline Value, Win Rate (%), Average Sales Cycle Length (Velocity), and Closed-Won Revenue.
2. **FR-DASH-002:** The system must render visual reports:
   - **Conversion Funnel:** Conversion rates from Lead -> Contact -> Opportunity -> Closed-Won.
   - **Pipeline Value Chart:** Value of active deals by stage.
   - **Quota Progress Gauge:** Comparison of closed revenue against target team/user quotas.
   - **Activity Charts:** Line chart comparing representative output (emails sent, calls logged).
3. **FR-DASH-003:** The dashboard must support date filters: Today, Last 7 Days, Month to Date, Quarter to Date, Year to Date, and Custom.
4. **FR-DASH-004:** The system shall implement read-caching (Redis) for analytics queries, refreshing data every 10 minutes to reduce database overhead.
5. **FR-DASH-005:** Users must be able to export raw data tables as `.csv` files.

---

## 4. Validation Rules
1. All conversion rate calculations must handle division by zero (e.g., if total leads is 0, win rate displays as `0.00%`).
2. Calculations for Average Sales Cycle Length must only include Closed-Won deals within the selected date range:
   $$\text{Velocity} = \frac{\sum (\text{Close Date} - \text{Creation Date})}{\text{Total Closed-Won Deals}}$$

---

## 5. Edge Cases
* **Edge Case 1 (No Historical Records):** When the database is newly deployed and contains zero closed-won deals, velocity widgets must render "N/A" and chart metrics must display mock empty guidelines rather than breaking frontend page scripts.
* **Edge Case 2 (Deactivated Rep Data):** In historical team quota calculations, the quotas and closed deals of deactivated representatives must remain visible in reporting periods during which they were active.

---

## 6. Dependencies
* **FE-LCM-1 / FE-LCM-2 / FE-SPD-1:** Leads, Contacts, and Deals must populate database parameters to draw metrics.
* **FE-TAS-1:** Team Quotas configurations must exist to feed target progress bars.
* **FE-TAS-2 (RBAC):** To filter reporting boundaries based on user roles.

---

## 7. API Requirements

### 7.1 Fetch Dashboard Overview Metrics
* **URL:** `/api/v1/analytics/metrics`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <Token>`
* **Parameters:** `team_id` (UUID, Nullable), `start_date` (DATE), `end_date` (DATE)
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "metrics": {
      "total_pipeline_value": 750000.00,
      "win_rate_percentage": 24.50,
      "sales_velocity_days": 18,
      "closed_won_revenue": 180000.00
    }
  }
  ```

### 7.2 Fetch Stage Progression Funnel
* **URL:** `/api/v1/analytics/funnel`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <Token>`
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "funnel": [
      { "stage": "Leads", "count": 100, "conversion_to_next": 40.0 },
      { "stage": "Opportunities", "count": 40, "conversion_to_next": 50.0 },
      { "stage": "Closed-Won", "count": 20, "conversion_to_next": 0.0 }
    ]
  }
  ```

---

## 8. Database Impact
* **Table access:** Heavy read queries against `DEALS`, `LEADS`, `ACTIVITIES`, and `QUOTAS`.
* **Database Views:** Implement a database view `V_DASHBOARD_METRICS` to pre-aggregate daily sales numbers, preventing complex query overhead during high-concurrency client operations.

---

## 9. UI Components
* **Analytics Dashboard Panel:** Responsive grid system container.
* **Chart Library Components:** Bar charts, line graphs, and donut gauges integrated via Chart.js or Recharts.
* **Export Button Widget:** Trigger converting table records into download buffers.

---

## 10. Security Requirements
* Managers are blocked from viewing dashboards of teams they do not manage.
* Sales Representatives can only query their own dashboard parameters (`GET` requests block `team_id` overrides).

---

## 11. Acceptance Criteria (AC)
* **AC-RPA-001:** Given a Sales Manager filters by team, when the dashboard renders, it must verify that team target progress dials compute members' metrics correctly.
* **AC-RPA-004:** Given a reporting period has zero deals, when the dashboard loads, the charts must transition to empty-state designs with zero exceptions thrown.
* **AC-RPA-005:** Given a user clicks the export button, when processed, then the system must prompt download of a structured CSV file matching the current filter state.

---

## 12. Definition of Done (DoD)
1. Index query paths evaluated using PostgreSQL `EXPLAIN ANALYZE` to ensure query executions execute in < 150ms.
2. Redis query cache TTL mechanisms and invalidation rules unit tested.
3. Mobile layout responsive tests pass down to 768px viewports.
