# Feature Specification: Vaulting & Checkout

---

## 1. Metadata
* **Feature Name:** Vaulting & Checkout
* **Feature ID:** `FEAT-PAY-01`
* **Priority:** 02 (Critical Core Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Enable secure customer credit card collection, tokenization, and processing of initial checkout transactions. The feature relies on payment gateway components (e.g., Stripe Elements) to avoid handling raw cardholder data (PAN, CVV) directly on AuraBilling servers, satisfying PCI-DSS requirements.

---

## 3. User Stories
* **US-PAY-01-01:** As a Subscriber checking out, I want to securely input my credit card details using Stripe Elements on the merchant checkout page, so that I know my details are safe.
* **US-PAY-01-02:** As a Subscriber, I want the system to handle 3D Secure (SCA) authentication prompts during checkout, so that my bank validates my transaction correctly.

---

## 4. Functional Requirements
* **FR-PAY-01-01:** The system must interface with Stripe/Adyen SDKs to create a gateway Customer record when a customer is created in AuraBilling.
* **FR-PAY-01-02:** The system must accept `payment_method_id` tokens sent from front-end elements.
* **FR-PAY-01-03:** The system must store the token details in the database, mapping token IDs to the specific Customer records (retaining brand, last 4 digits, expiration month, and expiration year).
* **FR-PAY-01-04:** The checkout flow must support Strong Customer Authentication (SCA) protocol, dynamically responding with a checkout redirect URL if 3D Secure challenges are initiated by the customer's bank.
* **FR-PAY-01-05:** Upon successful checkout charge authorization, the system must set the customer subscription status to `active`.

---

## 5. Validation Rules
* **VAL-PAY-01-01:** Frontend must validate card fields (Luhn algorithm check, expiry format validation) before making API calls.
* **VAL-PAY-01-02:** Backend must verify that `customer_id` exists in the local database and has a valid mapping to a gateway customer token before initiating payment intents.

---

## 6. Edge Cases
* **Edge Case 1: Insufficient Funds at Checkout.** If the initial subscription payment fails, the subscription state must remain `trialing` or `canceled`, and the customer must see an error message detailing why the card failed (e.g., "Insufficient funds").
* **Edge Case 2: 3D Secure Window Closed.** If a customer initiates checkout, triggers 3D Secure redirection, and then closes their browser tab before resolving it, the backend session must expire the invoice and release any pre-auth reserves after 60 minutes.
* **Edge Case 3: Customer Updates Card to Expired Card.** If a customer attempts to update their default payment method in the portal with a card whose expiry date is in the past, the system must reject it with error code `PAYMENT_METHOD_EXPIRED`.

---

## 7. Dependencies
* **Upstream:** `FEAT-SUB-01` (Plan Builder) - requires plan definitions to establish checkouts.
* **Downstream:** `FEAT-SUB-02` (Lifecycle Engine) - requires checkout success to transition subscriptions.

---

## 8. API Requirements

### 8.1 Initialize Checkout Session
* **Endpoint:** `POST /v1/checkout/sessions`
* **Request Body:**
```json
{
  "customer_id": "cust_8f9024j94j",
  "plan_id": "plan_9aj98f82ja",
  "success_url": "https://merchant.com/success",
  "cancel_url": "https://merchant.com/cancel"
}
```
* **Response (200 OK):**
```json
{
  "session_id": "cs_test_a1b2c3d4",
  "client_secret": "pi_1H2i3o4k5j_secret_xyz",
  "publishable_key": "pk_test_merchant_key",
  "checkout_url": "https://checkout.aurabilling.com/pay/cs_test_a1b2c3d4"
}
```

---

## 9. Database Impact
* **Table:** `CUSTOMER`
  * Updates `stripe_customer_token` (String) when gateway customer mapping completes.
* **Table:** `PAYMENT_METHOD` (New lookup mapping table)
  * Fields: `id` (UUID, PK), `customer_id` (UUID, FK), `gateway_token` (String, Indexed), `brand` (String, e.g., "visa"), `last4` (String), `exp_month` (Integer), `exp_year` (Integer), `is_default` (Boolean), `created_at` (Timestamp).

---

## 10. UI Components
* **Checkout Card Form:**
  * Displays plan billing summaries (Total due, trial duration, billing frequency).
  * Hosted Stripe Elements container frame.
  * Pay button displaying loading indicator spinner state during API interactions.
* **SCA Verification Overlay:**
  * Modal frame supporting Bank 3D Secure redirect logic.

---

## 11. Security Requirements
* **SEC-PAY-01-01 (Strict PCI Scope):** Raw card strings (PAN) and PINs must never transit backend servers.
* **SEC-PAY-01-02 (Content Security Policy):** The frontend application headers must include CSP rules permitting connection only to Stripe domains:
  `script-src 'self' https://js.stripe.com; frame-src 'self' https://js.stripe.com;`

---

## 12. Acceptance Criteria
* **AC-PAY-01-01:** Verify checkout triggers token mapping and creates customer in Stripe.
* **AC-PAY-01-02:** Verify SCA challenge executes correctly for high-risk mock test cards.
* **AC-PAY-01-03:** Verify database stores payment method attributes (last4, brand, expiry) with zero raw card numbers.

---

## 13. Definition of Done
* Sandbox verification with payment gateway simulators (Stripe mock tokens like `tok_visa`) succeeds.
* Frontend/Backend unit tests pass with $\ge 90\%$ test coverage.
* Security lead reviews database log formats to confirm zero leakage of sensitive values.
