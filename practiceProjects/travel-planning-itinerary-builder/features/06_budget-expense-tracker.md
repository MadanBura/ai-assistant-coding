# Feature Specification: Budget Calculator & Expense Tracker
**Feature ID:** FE-401  
**Priority:** 6 (Financial Operations)

---

## 1. Purpose
Provides travel expense logging and budget checking. Users can assign an overall budget ceiling, track real-time actual spending by category (food, accommodation, transport, sightseeing), support foreign currency transactions converting to base currencies, and split expenses among co-travelers.

---

## 2. User Stories
* **US-401.1 (Set Budget):** As an Owner, I want to assign a total budget ceiling for the trip, so that we can manage our target spending.
* **US-401.2 (Log Transactions):** As a collaborator, I want to add an expense with category, cost, currency, and payer details, so that we keep our financial log current.
* **US-401.3 (Split Expense):** As a group traveler, I want to split a transaction among specific members (equally or custom ratios), so that the system tracks balances.
* **US-401.4 (View Debt Grid):** As a traveler, I want to view a simplified list of who owes whom what, so that we can easily settle balances.

---

## 3. Functional Requirements
* **FR-401.1:** The system shall display total budgeted amount, actual total spent, remaining balance, and visual progress indicators (e.g. status bar).
* **FR-401.2:** The system shall support expense category tagging: food, stay, tickets, transit, shopping, and other.
* **FR-401.3:** The system shall execute currency conversions using daily cached exchange rate tables when transactions are recorded in foreign currencies.
* **FR-401.4:** The system shall divide expenses using:
  - Equal division across all trip members.
  - Custom percentage splits.
  - Custom amount splits.
* **FR-401.5:** The system shall generate a settle-up matrix containing the minimum cash transfers required to resolve balances (Simplified Debt Resolution algorithm).

---

## 4. Validation Rules
* **VR-401.1 (Decimal precision):** All transactions must record cost fields with two decimal places.
* **VR-401.2 (Zero/Negative values):** Block negative expense inputs; values must be strictly greater than $0.00.
* **VR-401.3 (Sum matching):** For custom ratio splits, the sum of split amounts must equal the total expense amount.
* **VR-401.4 (Currency validation):** Accept only ISO 4217 standard currency codes.

---

## 5. Edge Cases
* **EC-401.1 (Odd Cent Division):** When dividing $10.00 among three people, calculate the split as $3.34 for the payer and $3.33 for the other two. The sum of split shares must equal the total transaction ($10.00) without throwing rounding errors.
* **EC-401.2 (Exchange Rate API failure):** If the external rate converter fails, fall back to the last cached exchange rates in the database and append a warning note: "API Offline. Using rate from [date]".
* **EC-401.3 (Collaborator Leave Event):** If a collaborator with outstanding debts leaves or is kicked from the trip, their debt records must be preserved as "Anonymous (Archived Member)" debts so ledger totals remain consistent.

---

## 6. Dependencies
* **Upstream Dependencies:** FE-101 (Trip Planner), FE-102 (Collaborative Workspace).
* **Downstream Dependencies:** FE-502 (Notifications).

---

## 7. API Requirements
All endpoints require authentication: `Authorization: Bearer <JWT_TOKEN>`.

### 7.1 GET `/api/trips/:tripId/budget/summary`
* **Response (200 OK):**
  ```json
  {
    "total_budget": 5000.00,
    "total_spent": 1250.50,
    "currency": "USD",
    "categories": {
      "food": 250.00,
      "stay": 800.00,
      "tickets": 100.50,
      "transit": 100.00,
      "shopping": 0.00,
      "other": 0.00
    }
  }
  ```

### 7.2 POST `/api/trips/:tripId/expenses`
* **Request Body (Custom Split):**
  ```json
  {
    "title": "Group Dinner",
    "amount": 120.00,
    "currency": "EUR",
    "payer_id": "d3b07384-d113-4956-a511-2d480574719d",
    "category": "food",
    "spent_at": "2026-07-12",
    "splits": [
      { "debtor_id": "d3b07384-d113-4956-a511-2d480574719d", "amount": 40.00 },
      { "debtor_id": "8c5a98d3-7ccb-44e2-a1b2-c3d4e5f6a7b8", "amount": 40.00 },
      { "debtor_id": "9d6b98e3-8ccb-44e2-b1a2-d3c4e5f6b7c9", "amount": 40.00 }
    ]
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "expenseId": "9b5c98d3-7ccb-44e2-a1b2-c3d4e5f6a7c8",
    "converted_amount": 130.80,
    "base_currency": "USD"
  }
  ```

### 7.3 POST `/api/trips/:tripId/expenses/settle`
* **Request Body:**
  ```json
  {
    "sender_id": "8c5a98d3-7ccb-44e2-a1b2-c3d4e5f6a7b8",
    "receiver_id": "d3b07384-d113-4956-a511-2d480574719d",
    "amount": 40.00
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "settled": true
  }
  ```

---

## 8. Database Impact
Updates the `expenses` and `expense_splits` tables.

### Schema Changes
* Inserts dynamic rows in `expenses` referencing the trip and payee.
* Inserts row mapping per debtor in `expense_splits`.
* Ledger balances calculated using transactional locks (`SELECT FOR UPDATE`) to prevent double-writes or balance distortions under simultaneous posts.

---

## 9. UI Components
* **Budget Overview Dashboard:** Renders circular progress widgets showing percent of budget utilized.
* **Transaction Feed:** Scrollable ledger showing description, category icons, cost, currency conversions, and payer details.
* **Settle-Up Dialog:** Screen detailing optimal cash payouts with a button "Mark as Settled".

---

## 10. Security Requirements
* **SEC-401.1 (Double-Spend Mitigation):** Enforce unique transactional tokens on the POST body; reject duplicate calls within 5 seconds having identical properties to prevent double expense submissions.
* **SEC-401.2 (Access Authorization):** Validate that the requester has edit rights before writing updates to the expense log.

---

## 11. Acceptance Criteria
* **AC-401.1:** Attempting to submit a negative expense throws an error in the form validation layer.
* **AC-401.2:** Expense sums are converted to base currency instantly on list display.
* **AC-401.3:** Checking off "Mark as Settled" removes the balance from the debt matrix and logs a compensation entry in the ledger.
* **AC-401.4:** Budget bar changes color from Green to Amber at 75% utilization, and Red at 90% utilization.

---

## 12. Definition of Done (DoD)
1. Split-ratio algorithms cover edge cases (odd division and Custom ratio fractions).
2. Transaction ledger tested under API database locking simulations to verify zero record collisions.
3. Currency parser API failure handlers test and confirm fallback to cached rates.
