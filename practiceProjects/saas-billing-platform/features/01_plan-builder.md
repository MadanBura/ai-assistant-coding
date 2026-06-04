# Feature Specification: Plan Builder

---

## 1. Metadata
* **Feature Name:** Plan Builder
* **Feature ID:** `FEAT-SUB-01`
* **Priority:** 01 (Critical Core Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Enable merchants to configure subscription plans and pricing rules. This serves as the foundation for the entire subscription billing platform, defining what products are available for customers to subscribe to and how their costs are calculated.

---

## 3. User Stories
* **US-SUB-01-01:** As a Merchant Administrator, I want to create and publish subscription plans with flexible billing intervals (monthly, yearly) so that I can offer standard SaaS subscription packages.
* **US-SUB-01-02:** As a Merchant Administrator, I want to define tiered pricing models (volume or graduated) for plans, so that I can reward high-volume customers with cheaper unit pricing.

---

## 4. Functional Requirements
* **FR-SUB-01-01:** The system must support flat-rate plans (e.g., $29/month flat fee).
* **FR-SUB-01-02:** The system must support per-unit plans (e.g., $10/user/month) where quantity is defined at checkout or updated mid-cycle.
* **FR-SUB-01-03:** The system must support tiered pricing with two calculation styles:
  * **Volume-based:** The customer pays the price of the tier they fall into for *all* units (e.g., if 11 units are purchased at Tier 2 [$8], they pay $8 * 11 = $88).
  * **Graduated-based:** Units are priced across the tiers they cross (e.g., first 10 at $10, next 1 at $8, total = $108).
* **FR-SUB-01-04:** The system must support trial configurations (0 to 365 days).
* **FR-SUB-01-05:** Merchants must be able to soft-delete (archive) plans to prevent new checkouts while keeping existing subscribers on the plan active.

---

## 5. Validation Rules
* **VAL-SUB-01-01:** Plan name must not be empty and must be capped at 100 characters.
* **VAL-SUB-01-02:** Currency must be a valid ISO 4217 code (e.g., USD, EUR, GBP).
* **VAL-SUB-01-03:** Price fields (base_price, tier prices) must be non-negative.
* **VAL-SUB-01-04:** For tiered pricing, tier boundaries must be contiguous. The first tier must start at unit `1`. Subsequent tiers must begin at `last_tier.end + 1`. The final tier must have an upper limit of infinity (represented as null or -1).

---

## 6. Edge Cases
* **Edge Case 1:** Zero-dollar plans (free plans). The system must skip gateway charge intents for invoices with a subtotal of $0.00.
* **Edge Case 2:** Plan deletion when subscribers are active. The system must block hard-deletion of plans. It must only allow updating `is_active` to false, which prevents new checkouts but keeps old subscriptions running.
* **Edge Case 3:** Decimal pricing inputs (e.g., $0.007 per API log). All currency-related calculation engines must handle up to 4 decimal places in database columns and round to 2 decimal places only at checkout checkout finalization.

---

## 7. Dependencies
* **Upstream:** None. This is a foundational system component.
* **Downstream:** `FEAT-PAY-01` (Vaulting & Checkout) relies on plans to compute charge subtotals.

---

## 8. API Requirements

### 8.1 Create Plan
* **Endpoint:** `POST /v1/plans`
* **Request Body:**
```json
{
  "name": "Pro Developer",
  "description": "Access to pro developer API endpoints",
  "currency": "USD",
  "interval": "month",
  "pricing_type": "tiered",
  "base_price": 0.00,
  "trial_days": 14,
  "pricing_tiers": [
    { "up_to": 100, "unit_amount": 0.10 },
    { "up_to": 1000, "unit_amount": 0.08 },
    { "up_to": -1, "unit_amount": 0.05 }
  ],
  "tier_mode": "graduated"
}
```
* **Response (201 Created):**
```json
{
  "id": "plan_9aj98f82ja",
  "name": "Pro Developer",
  "currency": "USD",
  "interval": "month",
  "pricing_type": "tiered",
  "is_active": true,
  "created_at": 1780598400
}
```

---

## 9. Database Impact
* **Table:** `PLAN`
  * Add rows containing pricing settings.
  * Fields: `id` (UUID, PK), `merchant_id` (UUID, FK), `name` (String), `description` (Text), `interval` (String: `month`/`year`), `base_price` (Numeric(12, 4)), `pricing_type` (String: `flat`/`per_unit`/`tiered`), `pricing_tiers` (JSONB), `tier_mode` (String: `volume`/`graduated`), `trial_days` (Integer), `is_active` (Boolean), `created_at` (Timestamp).

---

## 10. UI Components (Admin Dashboard)
* **Plan Creation Wizard:**
  * Inputs: Plan Name, Description, Currency Select, Interval Select (Monthly/Yearly/Custom), Base Price.
  * Dynamic pricing type dropdown. If `tiered` is chosen, render a dynamic array input row where user adds rows representing: "Units up to" and "Unit Cost".
  * [Archive Plan] button on active plans list.

---

## 11. Security Requirements
* **SEC-SUB-01-01:** RBAC check: Write endpoints (`POST`, `PUT`, `DELETE`) require `Merchant Administrator` role. Read endpoints (`GET`) are open to all Merchant roles.
* **SEC-SUB-01-02:** Multi-tenant scoping: All queries must filter by `merchant_id` retrieved from the JWT/API key session to prevent cross-merchant resource leakage.

---

## 12. Acceptance Criteria
* **AC-SUB-01-01:** Verify flat plans calculate subscription price accurately.
* **AC-SUB-01-02:** Verify tiered plans calculate tier breakdowns according to volume vs graduated settings.
* **AC-SUB-01-03:** Verify archiving a plan prevents new customer associations but does not impact existing active subscriptions.

---

## 13. Definition of Done
* Unit tests pass with $\ge 90\%$ coverage for pricing tier calculations.
* Code reviewed and merged into developer branch.
* OpenAPI specifications updated for plan management.
