# Feature Specification: Operations Console

---

## 1. Metadata
* **Feature Name:** Operations Console
* **Feature ID:** `FEAT-ADMN-02`
* **Priority:** 16 (Operational Support Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Equip customer support agents and platform administrators with administrative tools to resolve disputes, process refunds, apply discounts manually, and pause/resume customer subscriptions. All operations console actions are logged in an immutable audit ledger for transparency.

---

## 3. User Stories
* **US-ADMN-02-01:** As a Merchant Support Representative, I want to refund a customer's payment (either in full or partially) directly from the billing portal, so that I can resolve service quality complaints.
* **US-ADMN-02-02:** As a Merchant Support Representative, I want to apply a custom coupon code directly to a subscriber's profile, so that I can compensate them for service downtime.

---

## 4. Functional Requirements
* **FR-ADMN-02-01:** Support full and partial refund operations. When a refund is initiated:
  * Validate refund bounds (refund amount must not exceed original charge value).
  * Call the gateway's refund endpoint (Stripe Refund API).
  * Upon confirmation, update the corresponding `INVOICE` status to `refunded` (or `partially_refunded`).
  * Generate a Credit Note PDF reflecting the refunded value.
* **FR-ADMN-02-02:** Support manual subscription toggling: pausing, resuming, and changing plans on behalf of customers. Mid-cycle changes trigger proration calculations (`FEAT-SUB-03`).
* **FR-ADMN-02-03:** Support manual coupon application. The discount will apply to the upcoming invoice.
* **FR-ADMN-02-04:** Record every manual action in the database table `AUDIT_LOG` containing: ID of the administrator, Customer ID, action type, old state, new state, reason comment, and timestamp.

---

## 5. Validation Rules
* **VAL-ADMN-02-01:** Refunds can only execute on invoices whose status is `paid` or `partially_refunded`. Draft or unpaid invoices are blocked.
* **VAL-ADMN-02-02:** Support Representatives are capped at a maximum manual refund limit of $250.00 per transaction. Refunds above $250.00 require approval from a `Merchant Administrator`.

---

## 6. Edge Cases
* **Edge Case 1: Double refund attempts.** A support agent clicks the `[Refund]` button multiple times quickly due to network latency.
  * *Resolution:* Lock invoice records during refund execution. Implement idempotency validation on refund requests using the invoice ID as the idempotency token.
* **Edge Case 2: Gateway refund failures.** A refund is approved locally but the payment gateway rejects it (e.g. card account is closed).
  * *Resolution:* Revert invoice status to `paid`, log the failure exception in the `AUDIT_LOG`, and display the gateway error code in the dashboard warning panel.
* **Edge Case 3: Refunding an invoice containing a consumed coupon.**
  * *Resolution:* Refund calculations must process the actual cash amount paid, not the subtotal value. The maximum refund limit is computed as:
    $$\text{Max Refund} = \text{Total Cash Charged} - \text{Previously Refunded Amount}$$

---

## 7. Dependencies
* **Upstream:**
  * `FEAT-PAY-01` (Vaulting & Checkout) - Stripe gateway integration.
  * `FEAT-INV-01` (PDF Invoice Generator) - invoice statuses.
  * `FEAT-SUB-02` (Lifecycle Engine) - for manual pause/resume commands.
* **Downstream:** None.

---

## 8. API Requirements

### 8.1 Process Refund
* **Endpoint:** `POST /v1/admin/refunds`
* **Request Body:**
```json
{
  "invoice_id": "inv_93802ka9123",
  "amount_cents": 5000,
  "reason": "duplicate_charge",
  "comment": "Customer double billed due to network delay."
}
```
* **Response (201 Created):**
```json
{
  "refund_id": "re_1J2k3o4j5l",
  "invoice_id": "inv_93802ka9123",
  "amount_refunded_cents": 5000,
  "status": "succeeded",
  "created_at": 1780598400
}
```

---

## 9. Database Impact
* **Table:** `AUDIT_LOG` (Immutable audit trails for administrative overrides)
  * Fields: `id` (UUID, PK), `actor_id` (UUID, FK representing user role ID), `customer_id` (UUID, FK, Indexed), `action_name` (String, e.g. `refund_processed`/`subscription_paused`), `previous_state` (JSONB), `new_state` (JSONB), `reason` (Text), `created_at` (Timestamp).

---

## 10. UI Components (Admin Dashboard)
* **Customer Actions Sidebar Menu:**
  * Reveals action widgets: `[Refund Invoice]`, `[Pause Subscription]`, `[Apply Promo Code]`, `[Change Plan]`.
* **Refund Dialog Modal:**
  * Input field: "Refund Amount". Displays maximum refund limit label. Text area: "Reason for Refund". Buttons: `[Cancel]`, `[Submit Refund]`.

---

## 11. Security Requirements
* **SEC-ADMN-02-01 (Auditing Integrity):** The `AUDIT_LOG` database table must allow `INSERT` queries only. Updates and deletions on audit records are blocked in database access policies.
* **SEC-ADMN-02-02 (RBAC Validation):** Verify that Support Rep roles cannot process refunds exceeding the $250.00 threshold limit, throwing a 403 error if triggered.

---

## 12. Acceptance Criteria
* **AC-ADMN-02-01:** Verify manual refunds trigger Stripe API calls and generate PDF credit notes.
* **AC-ADMN-02-02:** Verify support role limit caps are enforced at API level.
* **AC-ADMN-02-03:** Verify database writes audit records for every manual action.

---

## 13. Definition of Done
* Integration testing verifies correct API responses.
* DB policy review checks that write-only attributes on the `AUDIT_LOG` are correctly configured.
* Dashboard UI checked on standard resolutions.
