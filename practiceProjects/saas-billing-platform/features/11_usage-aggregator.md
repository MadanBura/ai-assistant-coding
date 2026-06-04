# Feature Specification: Usage Aggregator

---

## 1. Metadata
* **Feature Name:** Usage Aggregator
* **Feature ID:** `FEAT-MTR-02`
* **Priority:** 11 (Core Invoicing Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Query, aggregate, and calculate billing parameters from raw usage log records at the boundary of a subscription's billing cycle. The aggregated counts are fed into the pricing calculation engines to generate invoice totals.

---

## 3. User Stories
* **US-MTR-02-01:** As a Finance Manager, I want the system to calculate usage bills using different mathematical patterns (summing total usage, averaging usage, charging the maximum usage peak, or charging the last reported status) depending on our product definitions, so that we can support diverse monetization models.

---

## 4. Functional Requirements
* **FR-MTR-02-01:** The system must support four aggregation modes configured on the subscription's plan details:
  * **SUM:** Add all quantities recorded during the billing cycle (e.g. total emails sent: $10 + 5 + 3 = 18$).
  * **MAX:** Charge based on the highest single recorded usage peak (e.g. concurrent active devices peak: $\max(50, 120, 80) = 120$).
  * **AVG:** Charge based on the arithmetic average of usage snapshots recorded (e.g. storage utilization: $\text{average}(100\text{ GB}, 150\text{ GB}) = 125\text{ GB}$).
  * **LATEST:** Charge based on the quantity recorded in the latest timestamp before cycle close (e.g. seat count update).
* **FR-MTR-02-02:** When a subscription cycle ends, launch the Aggregator Worker to query `USAGE_LOG` for records matching the specific `subscription_id` where `recorded_at` falls between `current_period_start` and `current_period_end`.
* **FR-MTR-02-03:** Respect the 24-hour reporting grace window defined in `RULE-005` (BRD). Hold invoice finalization for metered subscriptions for 24 hours after the billing cycle ends to allow late-arriving telemetry packages to be parsed.
* **FR-MTR-02-04:** Inject the computed aggregate value into the plan tier calculation modules to generate invoice items.

---

## 5. Validation Rules
* **VAL-MTR-02-01:** If no usage records are found in the database for the billing period, default the quantity to `0`. Do not fail the cycle; generate invoice charging the base flat fee of the plan.

---

## 6. Edge Cases
* **Edge Case 1: Plan configuration updates mid-cycle.** If a merchant edits the aggregation setting (e.g. switching from SUM to MAX) while customer cycles are running:
  * *Resolution:* Lock plan settings. Creating a new pricing tier version is required. Keep current subscribers on the historic version configuration until their current cycle completes, then apply the new model parameters at the next cycle reset.
* **Edge Case 2: Multi-million log record sets.** High frequency API logging can generate millions of rows per customer, leading to execution timeouts.
  * *Resolution:* Run continuous micro-aggregation jobs (every 1 hour). Compute aggregate sub-summaries for active cycles and write them to a cache table `USAGE_ROLLUP`. When the billing cycle closes, query only the `USAGE_ROLLUP` table.
* **Edge Case 3: Usage record arriving AFTER the 24-hour grace window.**
  * *Resolution:* Automatically allocate the late usage count to the *next* active billing cycle log, printing a comment line on the invoice: "Late usage adjustments from cycle [PAST_CYCLE_ID]".

---

## 7. Dependencies
* **Upstream:**
  * `FEAT-SUB-01` (Plan Builder) - aggregation settings configurations.
  * `FEAT-MTR-01` (Usage Ingestion API) - writes usage logs.
* **Downstream:**
  * `FEAT-INV-01` (PDF Invoice Generator) - prints calculated values.

---

## 8. API Requirements
This feature operates as a system service. There are no public client APIs, but it implements administrative routes:

### 8.1 Trigger Manual Usage Aggregation (Admin Override)
* **Endpoint:** `POST /v1/admin/subscriptions/:id/aggregate-usage`
* **Request Body:**
```json
{
  "billing_period_start": 1780598400,
  "billing_period_end": 1783190400
}
```
* **Response (200 OK):**
```json
{
  "subscription_id": "sub_92k02kasj8",
  "aggregation_mode": "SUM",
  "calculated_quantity": 15403.00,
  "status": "compiled"
}
```

---

## 9. Database Impact
* **Table:** `USAGE_ROLLUP` (New performance optimization aggregate cache table)
  * Fields: `id` (UUID, PK), `subscription_id` (UUID, FK, Indexed), `billing_period_start` (Timestamp), `billing_period_end` (Timestamp), `metric_name` (String), `current_aggregate` (Numeric(12,4)), `last_updated_at` (Timestamp).

---

## 10. UI Components
* **Real-time Usage Widget (Admin Dashboard - Subscription detail):**
  * Displays: "Accrued Usage this period: 15,403 API Calls". Shows progress bar against limits if applicable.
* **Usage Telemetry Widget (Customer Portal):**
  * Provides visual charts showing usage graphs (daily spikes) so customers track their current spend.

---

## 11. Security Requirements
* **SEC-MTR-02-01:** Ensure SQL queries computing aggregates use strict parameter bindings to protect against SQL injections when processing metric names.

---

## 12. Acceptance Criteria
* **AC-MTR-02-01:** Verify aggregation math (SUM, AVG, MAX, LATEST) matches test expectations.
* **AC-MTR-02-02:** Verify late usage logs arriving within the 24-hour window are included in the calculations.
* **AC-MTR-02-03:** Verify rollup logic updates every hour without locks or race conditions.

---

## 13. Definition of Done
* Integration tests verify aggregator performance on tables with up to 1,000,000 mockup rows.
* Code reviewed and merged.
