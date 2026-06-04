# Feature Specification: Core Financial Analytics Dashboard

---

## 1. Metadata
* **Feature Name:** Core Financial Analytics Dashboard
* **Feature ID:** `FEAT-ADMN-01`
* **Priority:** 15 (Executive Reporting Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Compile and render business intelligence metrics (Monthly Recurring Revenue, Churn, Lifetime Value, and ARR) from raw transactional data. This empowers SaaS merchants to monitor cash flow, evaluate marketing campaigns, and assess pricing plans.

---

## 3. User Stories
* **US-ADMN-01-01:** As a Finance Manager, I want to view my Monthly Recurring Revenue (MRR) dynamically parsed across plans, so that I can see which packages drive company growth.
* **US-ADMN-01-02:** As a Merchant Administrator, I want to export transaction lists to CSV and JSON formats, so that I can upload them to external BI tools.

---

## 4. Functional Requirements
* **FR-ADMN-01-01:** Calculate Monthly Recurring Revenue (MRR) using normalized billing intervals:
  * For Monthly Subscriptions: Include plan base price in full.
  * For Yearly Subscriptions: Divide plan base price by 12.
  * Formula:
    $$\text{MRR} = \sum (\text{Active Monthly Plan Price}) + \sum \left( \frac{\text{Active Yearly Plan Price}}{12} \right)$$
* **FR-ADMN-01-02:** Calculate Churn Rate over a rolling 30-day window:
  $$\text{Churn Rate \%} = \left( \frac{\text{Canceled Subscriptions during 30d}}{\text{Active Subscriptions at start of 30d}} \right) \times 100$$
* **FR-ADMN-01-03:** Calculate Customer Lifetime Value (LTV) using averages:
  $$\text{LTV} = \frac{\text{Average Revenue Per Account (ARPU)}}{\text{User Churn Rate}}$$
* **FR-ADMN-01-04:** Provide filters for metrics based on plan types, customer segment types, and date ranges.
* **FR-ADMN-01-05:** Offer export routes generating structured CSV outputs containing transactions list details: Date, Invoice ID, Net Total, Tax, applied Coupon, Customer Email.

---

## 5. Validation Rules
* **VAL-ADMN-01-01:** All date filters must standardize to Coordinated Universal Time (UTC) to prevent timezone reporting mismatches.
* **VAL-ADMN-01-02:** Metrics must exclude non-recurring charge totals (e.g. one-off administrative fees) from MRR calculations.

---

## 6. Edge Cases
* **Edge Case 1: Past Due Subscriptions.** How do subscriptions in `past_due` status affect MRR?
  * *Resolution:* Subscriptions in `past_due` remain in MRR calculations for the first 14 days of dunning. If payment fails on Day 14 and status becomes `canceled`, subtract the plan amount from MRR immediately, classifying it as "Churned MRR".
* **Edge Case 2: Zero Data Initial State.** New merchants accessing the dashboard for the first time have empty databases.
  * *Resolution:* Do not break layouts or throw database exceptions. UI must render empty-state placeholders (e.g., dotted lines on graphs) and metric values displaying `$0.00` and `0%` churn.
* **Edge Case 3: Performance of complex reporting queries.** Querying billing databases containing tens of millions of rows directly will cause API lockups.
  * *Resolution:* Run analytical queries against a read-replica database node, or schedule hourly incremental updates to a cache table `ANALYTICS_SNAPSHOT`. The Admin Dashboard reads exclusively from this pre-aggregated table.

---

## 7. Dependencies
* **Upstream:**
  * `FEAT-SUB-01` (Plan Builder) - price values.
  * `FEAT-SUB-02` (Lifecycle Engine) - determines subscription statuses.
  * `FEAT-INV-01` (PDF Invoice Generator) - defines invoice totals.
* **Downstream:** None.

---

## 8. API Requirements

### 8.1 Fetch MRR Analytics
* **Endpoint:** `GET /v1/analytics/mrr`
* **Query Parameters:** `start_date=1780598400&end_date=1783190400&plan_id=plan_9a2`
* **Response (200 OK):**
```json
{
  "metric": "mrr",
  "currency": "USD",
  "total_mrr": 142050.00,
  "trend_percentage": +5.4,
  "chart_points": [
    { "date": "2026-06-01", "value": 139000.00 },
    { "date": "2026-06-02", "value": 140500.00 },
    { "date": "2026-06-03", "value": 142050.00 }
  ]
}
```

---

## 9. Database Impact
* **Table:** `ANALYTICS_SNAPSHOT` (New cached metrics rollup table)
  * Fields: `id` (UUID, PK), `merchant_id` (UUID, FK, Indexed), `snapshot_date` (Date, Indexed), `mrr` (Numeric), `arr` (Numeric), `churn_rate` (Numeric), `ltv` (Numeric), `net_revenue` (Numeric), `created_at` (Timestamp).

---

## 10. UI Components
* **Dashboard Overview Page:**
  * Displays four top metric cards: MRR, ARR, Churn, Active customers.
  * Displays dynamic interactive line graph (using charting library like Chart.js or Highcharts) plotting MRR trends.
  * Table displaying Top Selling Plans sorted by subscriber counts.
  * Export button: `[Download CSV]`.

---

## 11. Security Requirements
* **SEC-ADMN-01-01 (Role Access Restrict):** Endpoints under `/v1/analytics/*` must restrict access. Only users authenticated with roles `Merchant Administrator` or `Merchant Analyst` can query metrics. Access is blocked for `Merchant Support Representative` and `End Customer`.

---

## 12. Acceptance Criteria
* **AC-ADMN-01-01:** Verify yearly and monthly calculations normalize to MRR accurately.
* **AC-ADMN-01-02:** Verify CSV export includes matching items with precise numbers.
* **AC-ADMN-01-03:** Verify analytics queries load under 250ms using cached snapshot database structures.

---

## 13. Definition of Done
* Integration testing verifies MRR logic using mockup plan models.
* SQL database indices checked to prevent performance bottlenecks.
* Dashboard UI checked for layout consistency across common resolutions.
