# Feature Specification: Tax Engine Integration

---

## 1. Metadata
* **Feature Name:** Tax Engine Integration
* **Feature ID:** `FEAT-INV-02`
* **Priority:** 04 (Core Infrastructure)
* **Status:** Implementation Ready

---

## 2. Purpose
Compute dynamic, localized consumption tax (VAT, GST, Sales Tax) for checkouts and billing invoices in real-time. AuraBilling interfaces with tax calculation engines (e.g., TaxJar, Stripe Tax, or Avalara) to maintain multi-jurisdictional compliance automatically.

---

## 3. User Stories
* **US-INV-02-01:** As a Subscriber, I want the system to calculate my local VAT rate when checking out, so that I pay the correct legal tax amount.
* **US-INV-02-02:** As a Finance Manager, I want to record VAT numbers for B2B transactions, so that the system applies VAT reverse-charge exemptions automatically.

---

## 4. Functional Requirements
* **FR-INV-02-01:** Determine the customer's tax residency using the multi-factor validation rules outlined in `RULE-002` (BRD):
  1. Validated B2B tax identifier (e.g., VATIN).
  2. Billing Address (Country, State/Province, ZIP/Postal Code).
  3. Payment method issuance country.
  4. Customer IP address location.
* **FR-INV-02-02:** If a business customer provides a valid B2B tax ID, call external databases (e.g., VIES for EU VAT IDs) to check legitimacy. If valid, set tax calculation to reverse-charge mode (0% tax rate).
* **FR-INV-02-03:** Interface with external tax calculation APIs to send subtotals and customer addresses, returning tax rates and amounts.
* **FR-INV-02-04:** Cache computed tax rates for specific ZIP/Region patterns for 24 hours to reduce external API dependency calls.
* **FR-INV-02-05:** Calculate taxes for invoices at finalization state before card charge processes.

---

## 5. Validation Rules
* **VAL-INV-02-01:** Address payloads sent to the calculation engine must contain at least `Country` and `Postal Code` or state-level parameters.
* **VAL-INV-02-02:** Tax calculations must yield a single percentage rate (e.g., 19.00%) and a positive tax amount rounded to 2 decimal points.

---

## 6. Edge Cases
* **Edge Case 1: Tax Engine API Timeout.** If the external tax service times out or returns HTTP 5xx during invoice computation:
  * System must fallback to a pre-defined static tax table mapped by country in the local database.
  * Log a high-severity warning trace: `SYSTEM_ALERT: TAX_ENGINE_FALLBACK_TRIGGERED`.
* **Edge Case 2: Zip code mismatch in US.** If a customer enters a city and state but inputs a ZIP code that does not match:
  * The system must fallback to calculate tax using the provided ZIP code as the primary source of truth.
* **Edge Case 3: Tax Exemption Flags.** Certain organizations (e.g., schools, government agencies) have exempt status. The system must support an `is_tax_exempt` boolean attribute on `CUSTOMER` which overrides all calculation rules and sets tax to $0.00.

---

## 7. Dependencies
* **Upstream:** None.
* **Downstream:** `FEAT-INV-01` (PDF Invoice Generator) and `FEAT-PAY-01` (Vaulting & Checkout) depend on this engine to print line item taxes and process correct charge amounts.

---

## 8. API Requirements

### 8.1 Preview Dynamic Tax
* **Endpoint:** `POST /v1/tax/calculate`
* **Request Body:**
```json
{
  "customer_id": "cust_8f9024j94j",
  "amount_cents": 10000,
  "billing_address": {
    "country": "DE",
    "postal_code": "10115",
    "city": "Berlin"
  }
}
```
* **Response (200 OK):**
```json
{
  "tax_rate": 19.00,
  "tax_amount_cents": 1900,
  "total_amount_cents": 11900,
  "tax_jurisdiction": "DE_VAT",
  "reverse_charge_applied": false
}
```

---

## 9. Database Impact
* **Table:** `CUSTOMER`
  * Add fields: `tax_id` (String), `tax_id_type` (String, e.g. "eu_vat"), `is_tax_exempt` (Boolean).
* **Table:** `INVOICE`
  * Add fields: `tax_rate` (Numeric(5, 2)), `tax_amount` (Numeric(12, 4)), `tax_jurisdiction` (String).
* **Table:** `STATIC_TAX_FALLBACK` (New local database fallback lookup)
  * Fields: `id` (UUID, PK), `country_code` (String, Indexed), `state_code` (String), `fallback_rate` (Numeric(5,2)).

---

## 10. UI Components
* **Checkout Order Summary Card:**
  * Displays "Subtotal: $100.00", "Estimated Tax (19%): $19.00", "Total Due: $119.00".
* **Tax ID Verification field:**
  * Render an input field in Checkout and Portal settings: "Tax ID / VAT Number" which validates dynamically showing a checkmark once approved.

---

## 11. Security Requirements
* **SEC-INV-02-01 (API Key Management):** Credentials for TaxJar/Stripe Tax must be encrypted at rest in environment variables, never hardcoded in source repositories.
* **SEC-INV-02-02 (Data Sanitization):** Scrub user address strings of executable SQL or HTML components before forwarding payloads to external APIs.

---

## 12. Acceptance Criteria
* **AC-INV-02-01:** Verify dynamic tax computes correctly for multiple locations (EU vs US vs Asia).
* **AC-INV-02-02:** Verify B2B valid tax IDs trigger 0% reverse charge calculation.
* **AC-INV-02-03:** Verify fallback local rates are loaded when mock tax service times out.

---

## 13. Definition of Done
* Integration unit tests pass with $\ge 90\%$ test coverage.
* VIES VAT check simulation verified for both valid and fake identifiers.
* Fallback mechanism verified by setting connection timeout to 1ms in staging settings.
