# Feature Specification: Patient Payment Escrow

## Feature ID
`FEAT-501` (Epic: `EPC-005`)

## Purpose
Process patient booking payments securely, place funds in a platform escrow sub-account using Stripe, and hold captured charges until the consultation is marked as completed by the doctor, protecting both parties against transaction fraud.

## User Stories
* **US-501.1:** As a patient, I want to submit my card payment during appointment booking, knowing that funds are held securely and only transferred to the doctor after the consultation occurs.
* **US-501.2:** As a patient, I want to receive an automated refund if the doctor cancels or fails to join our scheduled video meeting.

## Functional Requirements
1. **Stripe Payment Intent Processor:** Create a Stripe PaymentIntent with `capture_method: manual` during booking. This reserves (pre-authorizes) the consultation fee on the patient's card.
2. **Escrow Hold State:** Authorized payments remain in "held in escrow" status. Payment authorizations are valid for up to 7 days on standard credit cards.
3. **Completion Release Trigger:** A platform listener executes a background task when an appointment transitions to `completed`. The PaymentIntent is captured, transferring 85% of funds to the doctor's custom Stripe connected account and 15% commission to the platform.
4. **Automated Refund Handler:** If an appointment is canceled by the doctor or marked as a doctor no-show, the system calls Stripe's refund/void API to release the pre-authorization hold immediately.
5. **Fee Breakdown Calculator:** Compute and log values:
   * `total_billed = doctor_fee`
   * `platform_commission = total_billed * 0.15`
   * `doctor_share = total_billed * 0.85`

## Validation Rules
* **Escrow Expiry Bounds:** If a consultation is not marked as `completed` within 48 hours *after* its scheduled time (and no dispute is logged), a system cron job auto-captures the payment to prevent authorization expiration.
* **Minimum Charge Limit:** The minimum transaction charge permitted on the platform is $5.00 USD.
* **Stripe Webhook Signature:** All payment callbacks must verify Stripe signatures (`stripe-signature` header) before executing database state transitions.

## Edge Cases
* **Card authorization expires before consultation occurs:** (Occurs if appointment is scheduled > 7 days in the future). **Rule:** For slots scheduled > 6 days in advance, the system performs an immediate `capture` upon booking, holding the cash in the platform's primary escrow account, instead of relying on credit card pre-authorization hold limits.
* **Patient disputes call quality during the 15-minute post-session window:** **Rule:** DB state changes to `disputed_escrow`. The capture release task is suspended, locking the funds in place until an administrator reviews Agora interaction logs and manually resolves the dispute.
* **Stripe webhook fails to reach the platform server:** **Rule:** The frontend client polls the payment status endpoint using an exponential backoff query. Additionally, a nightly sync job checks Stripe logs against Postgres to reconcile status discrepancies.

## Dependencies
* **Payment Processor SDK:** Stripe Node.js SDK / Stripe Connect API.
* **Secure Key Vault:** AWS Secrets Manager or HashiCorp Vault to store Stripe API private keys.

## API Requirements

### `POST /api/v1/payments/create-intent`
* **Security:** Authenticated (JWT) - Patient Only
* **Payload:**
```json
{
  "appointment_id": "appt-449102",
  "currency": "usd"
}
```
* **Response (200 OK):**
```json
{
  "client_secret": "pi_1G238HFDSH_secret_H8732...",
  "payment_intent_id": "pi_1G238HFDSH",
  "amount": 15000,
  "currency": "usd"
}
```

### `POST /api/v1/payments/stripe-webhook`
* **Security:** Public (IP-whitelisted to Stripe endpoints only)
* **Headers:** `stripe-signature: t=1780651800,v1=sha256-df30ba2491fae29c8821...`
* **Payload:** Standard Stripe Webhook JSON structure (`payment_intent.succeeded` or `payment_intent.payment_failed`).
* **Response (200 OK):**
```json
{
  "received": true
}
```

## Database Impact
* **`transactions` Table (New):**
  * `id` (VARCHAR(64), PK)
  * `appointment_id` (VARCHAR(64), FK to `appointments.id`, Unique)
  * `patient_id` (VARCHAR(64), FK to `users.id`)
  * `doctor_id` (VARCHAR(64), FK to `users.id`)
  * `stripe_intent_id` (VARCHAR(255), Indexed)
  * `amount_total` (DECIMAL(10,2))
  * `commission_amount` (DECIMAL(10,2))
  * `doctor_amount` (DECIMAL(10,2))
  * `status` (ENUM('authorized', 'captured', 'refunded', 'disputed'))
  * `created_at` (TIMESTAMP)

## UI Components
* **Stripe Card Checkout Form (`SCR-102B`):**
  * Stripe CardElement or PaymentElement container.
  * Form inputs for billing zip and cardholder name.
  * Pay button displaying amount (e.g., "Pay $150.00").
  * Visual badge stating: "Your payment is secured and held in escrow until consultation completion."

## Security Requirements
* **PCI-DSS Compliance:** Card credentials must never touch the platform server database or logs. Tokenization is handled completely by Stripe client libraries.
* **Webhook Verification Check:** Webhook endpoints must throw HTTP 400 Bad Request if webhook signature verification fails.

## Acceptance Criteria
* **AC-501.1.1:** Verify that creating a payment intent triggers Stripe with `capture_method: manual` for appointments scheduled within 6 days.
* **AC-501.1.2:** Validate that Stripe Connect split payouts are calculated correctly, storing 85% in doctor share and 15% in platform commission.
* **AC-501.2.1:** Verify that triggered cancellations execute a full void request on Stripe and update the database transaction status to `refunded`.

## Definition of Done
* Stripe API backend connector is implemented.
* Webhook handler code verified, including signature verification checks.
* Database ledger mappings are written and audited.
* Escalation logic for disputes is implemented.
* Formal QA approval of card checkout flows on sandbox environment.
