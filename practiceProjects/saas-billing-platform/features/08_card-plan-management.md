# Feature Specification: Card & Plan Management (Customer Portal)

---

## 1. Metadata
* **Feature Name:** Card & Plan Management
* **Feature ID:** `FEAT-PORT-02`
* **Priority:** 08 (User Experience Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Enable self-service billing management for subscribers in the Customer Portal. Users can view their subscription status, update saved credit cards, download historical PDF invoices, and cancel their subscription, directly reducing support ticket volume.

---

## 3. User Stories
* **US-PORT-02-01:** As a Subscriber, I want to update my credit card details in the billing portal, so that my subscription does not get canceled due to card expiry.
* **US-PORT-02-02:** As a Subscriber, I want to download copies of my past invoices, so that my business accounting department can process them.
* **US-PORT-02-03:** As a Subscriber, I want to cancel my subscription self-serve, so that I am not charged at the next billing cycle.

---

## 4. Functional Requirements
* **FR-PORT-02-01:** Authenticate all incoming requests using the secure JWT session cookie issued during magic-link validation (`FEAT-PORT-01`).
* **FR-PORT-02-02:** Display current subscription information: Plan Name, status badge, renewal date, and total current metered usage units for the active cycle.
* **FR-PORT-02-03:** Provide a payment method update form using embedded gateway scripts (Stripe Elements). On save, update `PAYMENT_METHOD` records and instruct the gateway to set the new card as the default payment source.
* **FR-PORT-02-04:** Render a billing history list containing past invoices. Clicking a row triggers the invoice download API (`FEAT-INV-01`), redirecting to a secure pre-signed download path.
* **FR-PORT-02-05:** Provide a "Cancel Subscription" flow. Clicking cancel gives the subscriber the choice to cancel immediately or cancel at the end of the current billing cycle.

---

## 5. Validation Rules
* **VAL-PORT-02-01:** Card update scripts must return a success payload from Stripe before sending update requests to AuraBilling APIs.
* **VAL-PORT-02-02:** Access limits: Users must be blocked from requesting invoice PDFs belonging to other customers. Ensure checking that `invoice.customer_id` strictly matches the `customer_id` encoded in the JWT token.

---

## 6. Edge Cases
* **Edge Case 1: Card Update Fails.** If the user submits a new card that declines during verification:
  * Retain the existing credit card token as default. Do not overwrite or delete the original payment method details.
  * Show a card decline banner explaining the failure.
* **Edge Case 2: Cancellation with unpaid invoices.** If a customer requests cancellation while their subscription status is `past_due` with outstanding invoices:
  * Allow cancellation, but mark the subscription as canceled immediately, and keep the invoice status as unpaid (do not automatically void unpaid debt).
* **Edge Case 3: Customer clicks cancel button multiple times.** Debounce submit buttons on forms to prevent duplicate API executions.

---

## 7. Dependencies
* **Upstream:**
  * `FEAT-SUB-02` (Lifecycle Engine) - for execution of cancels/pauses.
  * `FEAT-PAY-01` (Vaulting & Checkout) - for Stripe Elements scripts.
  * `FEAT-PORT-01` (Magic Link Access) - provides portal session authentication context.
* **Downstream:** None.

---

## 8. API Requirements

### 8.1 Fetch Customer Dashboard Data
* **Endpoint:** `GET /v1/portal/me`
* **Response (200 OK):**
```json
{
  "customer": {
    "name": "Acme Corp",
    "email": "customer@company.com"
  },
  "subscription": {
    "id": "sub_92k02kasj8",
    "plan_name": "Pro Gold Plan",
    "status": "active",
    "renewal_date": 1783190400,
    "usage_to_date": 412
  },
  "default_card": {
    "brand": "visa",
    "last4": "4242",
    "exp_month": 12,
    "exp_year": 2028
  }
}
```

### 8.2 Update Card Token
* **Endpoint:** `PUT /v1/portal/payment-method`
* **Request Body:**
```json
{
  "payment_method_id": "pm_new_token_993k"
}
```
* **Response (200 OK):**
```json
{
  "status": "updated",
  "default_card": {
    "brand": "visa",
    "last4": "1111",
    "exp_month": 10,
    "exp_year": 2030
  }
}
```

---

## 9. Database Impact
* **Table:** `PAYMENT_METHOD`
  * Inserts new row with details.
  * Updates previous default card's `is_default` flag to `false` and sets the new card row's `is_default` to `true` in a single SQL transaction.

---

## 10. UI Components
* **Credit Card Panel:** Shows card provider icon, masked numbers `•••• •••• •••• 4242`, exp date, and `[Edit Card]` trigger button.
* **Billing History Table:** Interactive columns: Date, Amount, Status Badge, Invoice Number, Action.
* **Cancel Subscription Modal Dialog:** A warning window: "Your subscription benefits will stop on [RENEWAL_DATE]. Are you sure you want to cancel?" Buttons: `[Keep Subscription]`, `[Cancel Subscription]`.

---

## 11. Security Requirements
* **SEC-PORT-02-01 (Session Validation):** All API calls must route through JWT validation middlewares. Check `sub` claim match logic.
* **SEC-PORT-02-02 (IP Lockout):** If card token updates are requested repeatedly (more than 5 card updates within 1 hour), block the IP and alert operations to prevent card-testing attacks.

---

## 12. Acceptance Criteria
* **AC-PORT-02-01:** Verify default card updates successfully without dropping previous cards if transaction checks fail.
* **AC-PORT-02-02:** Verify invoice list displays only records belonging to the authenticated customer.
* **AC-PORT-02-03:** Verify cancellation workflow applies status changes appropriately.

---

## 13. Definition of Done
* Integration testing covering multi-user workspace boundaries.
* Security review of JWT session verification checks completed.
* Viewport testing on mobile devices checks visual integrity.
