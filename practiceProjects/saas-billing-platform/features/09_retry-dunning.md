# Feature Specification: Retry & Dunning

---

## 1. Metadata
* **Feature Name:** Retry & Dunning
* **Feature ID:** `FEAT-PAY-02`
* **Priority:** 09 (Revenue Optimization Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Minimize customer churn caused by passive payment failures (expired cards, temporary bank holds, processing timeouts). The feature runs retry logic schedules and automates notification emails containing billing update landing links before subscription access is revoked.

---

## 3. User Stories
* **US-PAY-02-01:** As a Merchant Administrator, I want the system to automatically attempt failed payments multiple times over two weeks, so that temporary bank issues are resolved without manual customer support intervention.
* **US-PAY-02-02:** As a Subscriber, I want to receive an email alert with a direct card update link when my invoice payment fails, so that I can prevent service interruption.

---

## 4. Functional Requirements
* **FR-PAY-02-01:** Listen for payment failure events from payment gateways (e.g. webhook callbacks `invoice.payment_failed` or `payment_intent.failed`).
* **FR-PAY-02-02:** Upon detection of the initial failure:
  * Transition the corresponding `SUBSCRIPTION` status to `past_due`.
  * Create a record in `DUNNING_LOG`.
  * Trigger an email notification to the customer containing a secure link to the portal card update screen.
* **FR-PAY-02-03:** Program background queue schedules to retry card processing at these intervals:
  * **Retry 1:** 24 hours after initial failure (Day 1).
  * **Retry 2:** 72 hours after initial failure (Day 3).
  * **Retry 3:** 168 hours after initial failure (Day 7).
  * **Retry 4:** 336 hours after initial failure (Day 14).
* **FR-PAY-02-04:** If any retry attempt succeeds, mark the invoice as `paid`, transition the subscription back to `active`, and terminate the dunning schedule for that cycle.
* **FR-PAY-02-05:** If all retries fail up to Day 14, transition the subscription to `canceled` (or `paused` depending on merchant account specifications) and emit a system alarm.

---

## 5. Validation Rules
* **VAL-PAY-02-01:** Dunning retries can only execute on invoices whose status is `open` or `unpaid`. Fully `void` or `paid` invoices must be rejected from the retry queues.

---

## 6. Edge Cases
* **Edge Case 1: Hard decline vs Soft decline.** Gateway errors like "Insufficient funds" or "Temporary card block" are soft declines (retryable). Errors like "Stolen card", "Restricted card", or "Invalid card number" are hard declines.
  * *Resolution:* If a hard decline error code is received, abort the dunning sequence immediately, transition status to `canceled` on Day 1, and alert support. Do not execute retries.
* **Edge Case 2: Card updated mid-dunning cycle.** If a subscriber updates their card details on Day 5 (between Retry 2 and Retry 3):
  * Trigger an immediate payment retry using the new card token.
  * If successful, close the dunning loop and resume active state. Cancel the remaining scheduled retries on the queue.
* **Edge Case 3: Merchant manually pauses or cancels subscription mid-dunning.** The retry job must inspect the current subscription state immediately before hitting the gateway API. If the status is no longer `past_due`, cancel execution and delete queue tasks.

---

## 7. Dependencies
* **Upstream:**
  * `FEAT-PAY-01` (Vaulting & Checkout) - card charge APIs.
  * `FEAT-SUB-02` (Lifecycle Engine) - updates state.
* **Downstream:**
  * `FEAT-API-01` (Event Stream & Webhooks) - dispatches events like `invoice.payment_failed`.

---

## 8. API Requirements
There are no public REST endpoints for the dunning engine itself; it operates as an asynchronous worker queue listener. However, it integrates with:

### 8.1 Gateway Webhook Web Handler (Internal endpoint)
* **Endpoint:** `POST /v1/webhooks/gateway`
* **Headers:** Signature validations.
* **Request Payload (Stripe Mock):**
```json
{
  "id": "evt_failed_charge_123",
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_invoice_reference_90",
      "customer": "cus_stripe_id_8f",
      "subscription": "sub_internal_id_92",
      "attempt_count": 1
    }
  }
}
```
* **Response (200 OK):**
```json
{
  "status": "dunning_scheduled",
  "next_retry_epoch": 1780684800
}
```

---

## 9. Database Impact
* **Table:** `DUNNING_LOG` (New tracking ledger for recovery actions)
  * Fields: `id` (UUID, PK), `subscription_id` (UUID, FK), `invoice_id` (UUID, FK), `attempt_number` (Integer), `scheduled_time` (Timestamp), `execution_time` (Timestamp, Nullable), `gateway_response_code` (String), `status` (String: `scheduled`/`completed`/`aborted`).
* **Table:** `SUBSCRIPTION`
  * Mutates `status` to `past_due` or `canceled`.

---

## 10. UI Components
* **Dunning History Widget (Admin Dashboard - Customer Detail):**
  * Displays history list of payment retry attempts with code reasons (e.g. "Dec 4, 2026 - Attempt 2: Insufficient Funds").
* **Banner Alert (Customer Portal):**
  * Red alert text displayed if status is `past_due`: "Your payment failed. Please [Update Card] to keep your access."

---

## 11. Security Requirements
* **SEC-PAY-02-01 (Webhook Verification):** The webhook receiver route must strictly validate HMAC signatures sent by the gateway before processing payloads.
* **SEC-PAY-02-02 (Secure Email Link):** Magic links sent in dunning emails must map to unique tokens that authenticate users straight to the payment details page without granting access to other invoice files until confirmation.

---

## 12. Acceptance Criteria
* **AC-PAY-02-01:** Verify dunning schedules correct retry times following a webhook failure notification.
* **AC-PAY-02-02:** Verify hard declines bypass retries and cancel subscription immediately.
* **AC-PAY-02-03:** Verify card updates during dunning trigger immediate payment processing.

---

## 13. Definition of Done
* Integration queue system tests verify execution intervals using fake gateway simulation times.
* Email dispatch verified.
* Zero raw gateway payload hashes printed in log streams.
