# Feature Specification: Proration Engine

---

## 1. Metadata
* **Feature Name:** Proration Engine
* **Feature ID:** `FEAT-SUB-03`
* **Priority:** 06 (Core Subscription Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Manage financial adjustments and credits when a customer upgrades or downgrades their subscription plan mid-billing cycle. It computes the unused balance of the current plan and applies it towards the new plan, preventing double billing or loss of revenue.

---

## 3. User Stories
* **US-SUB-03-01:** As a Subscriber, I want to preview my prorated balance before upgrading my plan, so that I understand exactly what my credit card will be charged.
* **US-SUB-03-02:** As a Finance Manager, I want downgrade credits to be applied as a balance to the customer's profile instead of issuing cash refunds, so that I can maintain cash flow.

---

## 4. Functional Requirements
* **FR-SUB-03-01:** When a plan modification command is received, compute:
  * **Unused current plan value:**
    $$\text{Credit} = \text{Current Plan Price} \times \left( \frac{\text{Time remaining in cycle}}{\text{Total cycle duration}} \right)$$
  * **Remaining new plan cost:**
    $$\text{Debit} = \text{New Plan Price} \times \left( \frac{\text{Time remaining in cycle}}{\text{Total cycle duration}} \right)$$
  * **Net adjustment:**
    $$\text{Net Due} = \text{Debit} - \text{Credit}$$
* **FR-SUB-03-02:** Time variables in the calculation formulas must use seconds granularity (Unix timestamps) to ensure absolute precision.
* **FR-SUB-03-03:** If Net Due is positive: create an immediate invoice for the prorated amount and charge the card.
* **FR-SUB-03-04:** If Net Due is negative: generate a credit note and add the absolute value of the credit to the customer's balance profile. The credit balance is automatically deducted from future recurring invoices.
* **FR-SUB-03-05:** Immediately update subscription database configuration references to link to the new `plan_id`.

---

## 5. Validation Rules
* **VAL-SUB-03-01:** Plan changes can only occur between plans of the same currency. Multi-currency plan updates are blocked (user must cancel and recreate).
* **VAL-SUB-03-02:** Adjustments must not exceed the price of the more expensive plan.

---

## 6. Edge Cases
* **Edge Case 1: Changes requested very close to cycle boundaries.** If a user changes plans 5 minutes before their monthly cycle renews, the calculation might result in fractional cent values.
  * *Resolution:* If calculated credit is under $0.50, skip proration, finalize the current cycle as-is, and bill the new plan price in full at the next renewal interval.
* **Edge Case 2: Downgrade resulting in credit accumulation.** If customer downgrades multiple times in a month, their profile credit may accumulate. The credit consumption engine must apply these credits to future invoices automatically, up to reducing invoice due amounts to exactly $0.00.
* **Edge Case 3: Leap Year adjustments.** Calculations must determine `total_cycle_duration` dynamically based on the exact start/end dates of the current cycle, ensuring February cycles with 28 vs 29 days are handled correctly.

---

## 7. Dependencies
* **Upstream:**
  * `FEAT-SUB-01` (Plan Builder) - price values.
  * `FEAT-SUB-02` (Lifecycle Engine) - updates active subscription periods.
* **Downstream:**
  * `FEAT-INV-01` (PDF Invoice Generator) - records line item credits.

---

## 8. API Requirements

### 8.1 Preview Plan Change Proration
* **Endpoint:** `POST /v1/subscriptions/:id/preview`
* **Request Body:**
```json
{
  "new_plan_id": "plan_gold_yearly",
  "quantity": 1
}
```
* **Response (200 OK):**
```json
{
  "subscription_id": "sub_92k02kasj8",
  "proration_date": 1780602000,
  "credit_amount": 15.00,
  "debit_amount": 45.00,
  "net_due": 30.00,
  "currency": "USD"
}
```

---

## 9. Database Impact
* **Table:** `CUSTOMER`
  * Add field: `credit_balance` (Numeric(12,4), Default: 0.0000) representing accrued customer credits.
* **Table:** `CUSTOMER_BALANCE_TRANSACTION` (New ledger transaction tracker for credit changes)
  * Fields: `id` (UUID, PK), `customer_id` (UUID, FK), `amount` (Numeric), `type` (String, e.g. `credit_applied`/`invoice_deduction`), `invoice_id` (UUID, FK, Nullable), `description` (String), `created_at` (Timestamp).

---

## 10. UI Components
* **Upgrade/Downgrade Dialog Portal Screen:**
  * Displays comparison of current vs new plan details.
  * Visual Breakdown section:
    * "Credit for unused time on Pro: -$15.00"
    * "Cost of gold for remaining cycle: +$45.00"
    * "Amount due today: $30.00"

---

## 11. Security Requirements
* **SEC-SUB-03-01:** Changes requested via API endpoints must check that subscription states are `active` or `trialing`. Plan changes are blocked on `past_due` or `canceled` accounts.

---

## 12. Acceptance Criteria
* **AC-SUB-03-01:** Verify proration math is precise to 4 decimal places before final rounding.
* **AC-SUB-03-02:** Verify negative balances write successfully to credit balances table and apply on next cycles.
* **AC-SUB-03-03:** Verify user is billed immediately on upgrades.

---

## 13. Definition of Done
* Mathematical models validated by unit tests checking various cycle lengths (28, 30, 31, 365 days).
* Review of SQL transactions to ensure credit balance updates use atomic increments to prevent double-spending anomalies.
