# Feature Specification: Subscription Lifecycle Engine

---

## 1. Metadata
* **Feature Name:** Subscription Lifecycle Engine
* **Feature ID:** `FEAT-SUB-02`
* **Priority:** 03 (Critical Core Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Manage the transition of customer subscription states (Trialing, Active, Past Due, Paused, Canceled) throughout their lifecycle, responding to checkout actions, clock cycles, failed payments, and administrative overrides.

---

## 3. User Stories
* **US-SUB-02-01:** As a Subscriber, I want my subscription to transition to "Active" automatically when my 14-day trial period finishes and my card is successfully charged, so that my service access remains uninterrupted.
* **US-SUB-02-02:** As a Merchant Administrator, I want to pause a customer's subscription indefinitely, so that I can accommodate billing disputes or custom customer requests.

---

## 4. Functional Requirements
* **FR-SUB-02-01:** Implement a subscription state machine with strict transition paths as illustrated in the PRD (State diagram). Valid states: `trialing`, `active`, `past_due`, `paused`, `pending_cancellation`, `canceled`.
* **FR-SUB-02-02:** A subscription created with `trial_days > 0` must initialize with the status `trialing`.
* **FR-SUB-02-03:** Execute a daily background batch job (Lifecycle Worker) to scan for subscriptions whose trials or billing periods expire on the current date, triggering invoice finalization and card processing.
* **FR-SUB-02-04:** Support scheduled cancellations (cancellation at period end) where the subscription state changes to `pending_cancellation` and remains active until the last day of the billing cycle.
* **FR-SUB-02-05:** Implement a pause action that freezes the billing cycle, optionally suppressing payments, and resumes at the exact billing position when active status is restored.

---

## 5. Validation Rules
* **VAL-SUB-02-01:** The system must reject invalid state machine transitions. Examples of invalid actions:
  * Transition from `canceled` to `active` directly. (A new subscription must be created).
  * Transition from `trialing` to `paused` directly.
* **VAL-SUB-02-02:** Subscription renewal dates must align precisely with billing intervals. If subscription starts on the 31st, next monthly cycles must fall on the 30th (or 28th/29th of February).

---

## 6. Edge Cases
* **Edge Case 1: Trial Ends with No Card on File.** If `trial_days` expires and the customer has not added a credit card, the state must transition directly to `canceled`.
* **Edge Case 2: Multi-day Billing Processing Downtime.** If the system's daily renewal cron crashes and misses processing for a specific day, when restarted it must execute catching up sequentially for *all* missed days to ensure no billing cycles are skipped.
* **Edge Case 3: Customer cancels 1 second before cycle end.** If the API receives a cancellation command when the cycle scheduler has already queued the payment intent, the cancellation should succeed, but the system must handle gateway callbacks gracefully, auto-refunding if double charge occurs.

---

## 7. Dependencies
* **Upstream:**
  * `FEAT-SUB-01` (Plan Builder) - defines subscription interval lengths.
  * `FEAT-PAY-01` (Vaulting & Checkout) - provides customer tokens.
* **Downstream:**
  * `FEAT-INV-01` (PDF Invoice Generator) - triggered when a cycle ends.
  * `FEAT-PAY-02` (Retry & Dunning) - triggered when state becomes `past_due`.

---

## 8. API Requirements

### 8.1 Cancel Subscription
* **Endpoint:** `POST /v1/subscriptions/:id/cancel`
* **Request Body:**
```json
{
  "cancel_at_period_end": true
}
```
* **Response (200 OK):**
```json
{
  "id": "sub_92k02kasj8",
  "status": "pending_cancellation",
  "cancel_at": 1783190400,
  "updated_at": 1780602000
}
```

### 8.2 Pause Subscription
* **Endpoint:** `POST /v1/subscriptions/:id/pause`
* **Request Body:**
```json
{
  "behavior": "void"
}
```
* **Response (200 OK):**
```json
{
  "id": "sub_92k02kasj8",
  "status": "paused",
  "paused_at": 1780602000
}
```

---

## 9. Database Impact
* **Table:** `SUBSCRIPTION`
  * Mutates fields: `status` (Enum/String), `current_period_start` (Timestamp), `current_period_end` (Timestamp), `trial_start` (Timestamp), `trial_end` (Timestamp).
  * Inserts transitions to a history audit table `SUBSCRIPTION_STATUS_LOG` containing: `id` (UUID), `subscription_id` (UUID), `old_status` (String), `new_status` (String), `changed_by` (String), `created_at` (Timestamp).

---

## 10. UI Components (Admin Dashboard)
* **Status Badge Component:** Displays color-coded pills reflecting subscription states (Green for `active`, Yellow for `trialing` / `past_due`, Blue for `paused`, Grey for `canceled`).
* **Subscription Action Toolbar:** Reveals context-dependent buttons: [Pause], [Resume], [Cancel Plan], [Renew Plan].

---

## 11. Security Requirements
* **SEC-SUB-02-01 (Access Isolation):** Users logging into the Customer Portal can only cancel their own subscriptions. Access must validate checking JWT subject fields matches owner IDs.
* **SEC-SUB-02-02 (Worker Authorization):** Background worker scripts running daily crons must authenticate securely using private VPC access controls and secret keys, rejecting standard HTTP requests.

---

## 12. Acceptance Criteria
* **AC-SUB-02-01:** Verify correct state transitions across all standard paths using mock unit tests.
* **AC-SUB-02-02:** Verify daily worker correctly identifies and transitions trialing subscriptions whose trial period has elapsed.
* **AC-SUB-02-03:** Verify scheduled cancellations continue service access until billing period close.

---

## 13. Definition of Done
* State transition rules checked with test suite achieving $\ge 95\%$ test coverage.
* Lock safety implemented for daily crons to prevent multiple worker nodes running processing redundantly.
* Sandbox tests completed.
