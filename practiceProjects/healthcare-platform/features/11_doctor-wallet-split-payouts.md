# Feature Specification: Doctor Wallet & Split Payouts

## Feature ID
`FEAT-502` (Epic: `EPC-005`)

## Purpose
Manage doctor revenue streams, maintain virtual balance accounts, support custom onboarding to Stripe Connect accounts, and process bi-weekly automated payouts based on completed consultations.

## User Stories
* **US-502.1:** As a doctor, I want to link my bank account to the platform, so that my consultation payouts are sent to me automatically.
* **US-502.2:** As a doctor, I want to track my earnings, pending payouts, and platform commission deductions, so that I can audit my clinical income.

## Functional Requirements
1. **Stripe Connect Custom Account Onboarding:** Provide an endpoint generating OAuth onboarding URLs directing doctors to Stripe's secure dashboard to configure bank accounts and complete Tax (W-9) declarations.
2. **Virtual Balance Wallet:** Display active balances:
   * **Pending Balance:** Funds currently held in escrow.
   * **Available Balance:** Escrow-released funds ready for payouts.
3. **Bi-weekly Payouts Scheduler:** A cron job running on the 1st and 15th of each month compiles doctors' `available_balance` and dispatches Stripe Payout requests.
4. **Platform Fee Deductions Ledger:** Create transaction log listings detailing doctor share (`0.85`), platform commission (`0.15`), and transfer references.

## Validation Rules
* **Minimum Balance Restriction:** The automated payout task skips wallets with balances below $50.00 USD, deferring the payout to the next scheduled interval.
* **Verified Status Requirement:** Payouts are blocked if a doctor's profile status is changed to `suspended` or `pending_verification`.
* **Bank Routing Validation:** Routing and bank account numbers submitted through Stripe Connect must satisfy local banking requirements (e.g. routing format checks in the US).

## Edge Cases
* **Doctor payout fails on Stripe side due to blocked bank account:** **Rule:** The platform catches the transfer failure webhook, flags the doctor's wallet status as `payout_failed`, halts subsequent payouts, and dispatches a dashboard notification requesting the doctor to update their billing details.
* **Doctor profile is suspended mid-escrow cycle:** **Rule:** Future payouts from `available_balance` are suspended. Funds held in `pending` remain locked until administration compliance officers complete investigations.
* **Exchange rate differences during international payout transfers:** **Rule:** Currency values are locked to USD at transaction finalization, with conversion costs handled entirely by Stripe Connect.

## Dependencies
* **Payment Engine:** Stripe Connect API.
* **Automated Runner:** Celery / BullMQ or Google Cloud Scheduler (for payout intervals).

## API Requirements

### `POST /api/v1/doctors/:id/wallet/onboard`
* **Security:** Authenticated (JWT) - Doctor Owner Only
* **Response (200 OK):**
```json
{
  "stripe_account_id": "acct_1N2938JFDSO",
  "onboarding_url": "https://connect.stripe.com/setup/s/acct_1N2938JFDSO/..."
}
```

### `GET /api/v1/doctors/:id/wallet/balance`
* **Security:** Authenticated (JWT) - Doctor Owner Only
* **Response (200 OK):**
```json
{
  "doctor_id": "doc-robert-chen-77",
  "available_balance_usd": 1275.00,
  "pending_balance_usd": 300.00,
  "payout_status": "active",
  "bank_linked": true,
  "last_payout_date": "2026-06-01T04:00:00Z"
}
```

### `GET /api/v1/doctors/:id/wallet/transactions`
* **Security:** Authenticated (JWT) - Doctor Owner Only
* **Query Parameters:** `page` (int), `limit` (int)
* **Response (200 OK):**
```json
{
  "total_records": 12,
  "data": [
    {
      "transaction_id": "tx_stripe_8819238",
      "appointment_id": "appt-449102",
      "consultation_date": "2026-06-04T16:12:00Z",
      "patient_name": "Sarah Connor",
      "gross_amount_usd": 150.00,
      "commission_deducted_usd": 22.50,
      "net_payout_usd": 127.50,
      "status": "available"
    }
  ]
}
```

## Database Impact
* **`doctor_wallets` Table (New):**
  * `id` (VARCHAR(64), PK)
  * `doctor_id` (VARCHAR(64), FK to `doctors.id`, Unique)
  * `stripe_connect_account_id` (VARCHAR(255), Indexed)
  * `available_balance` (DECIMAL(10,2), Default: 0.00)
  * `pending_balance` (DECIMAL(10,2), Default: 0.00)
  * `payout_status` (ENUM('active', 'frozen', 'payout_failed'))
  * `created_at` (TIMESTAMP)
* **`payout_history` Table (New):**
  * `id` (VARCHAR(64), PK)
  * `wallet_id` (VARCHAR(64), FK to `doctor_wallets.id`)
  * `stripe_payout_id` (VARCHAR(255))
  * `amount_payout` (DECIMAL(10,2))
  * `status` (ENUM('pending', 'succeeded', 'failed'))
  * `created_at` (TIMESTAMP)

## UI Components
* **Doctor Wallet Dashboard View (`SCR-103B`):**
  * Balance Cards widget showing Available vs. Pending.
  * Stripe Connection Banner ("Link bank account" or "View Stripe Portal").
  * Transaction history details table with CSV invoice downloader options.

## Security Requirements
* **Immutable Wallet Balances:** Ensure database updates targeting wallet balances use secure increment/decrement query patterns (`available_balance = available_balance + :val`) to block concurrency race conditions.
* **IP Restrictions:** Limit Stripe custom payouts execution commands to authorized server containers.

## Acceptance Criteria
* **AC-502.1.1:** Verify that successful Stripe Connect onboarding updates the `stripe_connect_account_id` field in the database.
* **AC-502.1.2:** Validate that the system rejects onboarding requests from doctors who are not verified.
* **AC-502.2.1:** Verify that bi-weekly transfer runs calculate transaction payouts correctly, applying the 15% platform commission logic.

## Definition of Done
* Stripe Connect account generator modules completed.
* Wallet state structures and DB transaction listeners written.
* Bi-weekly scheduler scheduler script verified in sandbox.
* Balance update concurrency tests successfully complete.
* QA checks on financial balances verified.
