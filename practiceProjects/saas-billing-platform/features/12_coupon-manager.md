# Feature Specification: Coupon Code Manager

---

## 1. Metadata
* **Feature Name:** Coupon Code Manager
* **Feature ID:** `FEAT-COUP-01`
* **Priority:** 12 (Growth & Marketing Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Enable merchants to configure, distribute, and manage promotional codes and discount rules. Discounts can be applied to customer checkouts or active subscriptions, supporting percentage or flat-amount deductions.

---

## 3. User Stories
* **US-COUP-01-01:** As a Growth Marketer, I want to create discount codes (e.g., "LAUNCH50") that offer 50% off subscription prices for the first 3 months, so that I can drive signups.
* **US-COUP-01-02:** As a Subscriber, I want to enter a promo code at checkout, so that I receive my agreed discount automatically.

---

## 4. Functional Requirements
* **FR-COUP-01-01:** The system must support two discount styles:
  * **Percentage-based:** Deducts a percentage off the invoice subtotal (e.g. 20% off).
  * **Flat-amount:** Deducts a fixed currency value (e.g. $15.00 off).
* **FR-COUP-01-02:** The system must support three duration modes:
  * **Once:** Applies to only the first invoice of the subscription.
  * **Repeating:** Applies for a defined number of months (e.g., 6 months).
  * **Forever:** Applies to all recurring invoices of the subscription indefinitely.
* **FR-COUP-01-03:** Enforce usage limits: Allow setting a `max_redemptions` ceiling (e.g., first 100 signups) and `expires_at` calendar date.
* **FR-COUP-01-04:** Compute discount values prior to calculating tax. The order of calculation operations on subtotals must run:
  $$\text{Invoice Total} = (\text{Subtotal} - \text{Discount Amount}) \times (1 + \text{Tax Rate})$$
* **FR-COUP-01-05:** Prevent retroactive application according to `RULE-004` (BRD).

---

## 5. Validation Rules
* **VAL-COUP-01-01:** Coupon codes must consist only of alphanumeric uppercase characters (e.g. "SUMMER50", no spaces or special characters).
* **VAL-COUP-01-02:** For flat-rate discounts, the currency of the coupon must match the currency of the plan checkout. If currency does not match, reject coupon application.
* **VAL-COUP-01-03:** Percentage values must range strictly between `0.01` and `100.00`.

---

## 6. Edge Cases
* **Edge Case 1: Discount exceeds subtotal.** If a customer applies a $50.00 flat discount to a $30.00 plan:
  * The invoice total must be capped at exactly `$0.00`. The system must never write negative invoice values or initiate payouts.
  * The remaining $20.00 coupon value is discarded (it does not roll over as profile credit unless explicitly configured by the merchant).
* **Edge Case 2: Coupon expires mid-cycle.** If a repeating coupon's duration expires:
  * The system worker must strip the coupon reference identifier from the `SUBSCRIPTION` record automatically, restoring full pricing for the subsequent cycle.
* **Edge Case 3: Customer tries to stack coupons.** The system must allow only one active coupon code per subscription. If a new coupon is applied, it replaces the existing coupon.

---

## 7. Dependencies
* **Upstream:**
  * `FEAT-SUB-01` (Plan Builder) - requires plan definitions to apply discounts.
* **Downstream:**
  * `FEAT-PAY-01` (Vaulting & Checkout) - consumes discount rules at checkout.
  * `FEAT-INV-01` (PDF Invoice Generator) - displays discount line items.

---

## 8. API Requirements

### 8.1 Create Coupon
* **Endpoint:** `POST /v1/coupons`
* **Request Body:**
```json
{
  "code": "WINTER30",
  "discount_type": "percentage",
  "discount_value": 30.00,
  "duration": "repeating",
  "duration_in_months": 3,
  "max_redemptions": 500,
  "expires_at": 1798761600
}
```
* **Response (201 Created):**
```json
{
  "id": "coup_92jaks02ja",
  "code": "WINTER30",
  "discount_type": "percentage",
  "discount_value": 30.00,
  "is_active": true,
  "created_at": 1780598400
}
```

### 8.2 Validate Coupon (Public Checkout endpoint)
* **Endpoint:** `GET /v1/coupons/validate?code=WINTER30&currency=USD`
* **Response (200 OK):**
```json
{
  "valid": true,
  "code": "WINTER30",
  "discount_type": "percentage",
  "discount_value": 30.00,
  "duration": "repeating",
  "duration_in_months": 3
}
```

---

## 9. Database Impact
* **Table:** `COUPON`
  * Inserts rows.
  * Fields: `id` (UUID, PK), `merchant_id` (UUID, FK), `code` (String, Indexed), `discount_type` (String: `percentage`/`flat`), `discount_value` (Numeric(12,4)), `duration` (String: `once`/`repeating`/`forever`), `duration_in_months` (Integer, Nullable), `max_redemptions` (Integer, Nullable), `times_redeemed` (Integer, Default: 0), `expires_at` (Timestamp, Nullable), `is_active` (Boolean), `created_at` (Timestamp).
* **Table:** `SUBSCRIPTION`
  * Add field: `coupon_id` (UUID, FK, Nullable).

---

## 10. UI Components
* **Promo Code input component (Checkout Page):**
  * Small input field and a `[Apply]` button. Displays a confirmation or error message ("Promo code is invalid or expired").
* **Coupons Administration Console:**
  * Table listing codes, discount attributes, redemption count indicators (e.g., "45 / 500 used"), status, and `[Create Coupon]` wizard.

---

## 11. Security Requirements
* **SEC-COUP-01-01 (Rate Limiting):** Apply strict rate limits to the coupon validation endpoint (`GET /v1/coupons/validate`): Max 10 requests per minute per IP address, preventing brute-force code guessing scripts.
* **SEC-COUP-01-02:** Coupon creation write permissions are restricted strictly to `Merchant Administrator`.

---

## 12. Acceptance Criteria
* **AC-COUP-01-01:** Verify coupon creation writes correct values to the database.
* **AC-COUP-01-02:** Verify coupon limits (expiry date, max redemptions) block validation requests once limits are exceeded.
* **AC-COUP-01-03:** Verify discount calculations apply accurately to invoice subtotals.

---

## 13. Definition of Done
* Integration unit tests pass with $\ge 90\%$ test coverage.
* Rate limiter setup verified.
* Database triggers tested to ensure incrementing `times_redeemed` is thread-safe using lock mechanisms.
