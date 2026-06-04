# Feature Specification: PDF Invoice Generator

---

## 1. Metadata
* **Feature Name:** PDF Invoice Generator
* **Feature ID:** `FEAT-INV-01`
* **Priority:** 05 (Core Infrastructure)
* **Status:** Implementation Ready

---

## 2. Purpose
Generate structured, legally compliant PDF invoice documents automatically whenever a subscription cycle completes, a checkout is finalized, or a manual adjustment occurs. Generated documents are stored in secure object storage and linked to customer/merchant records.

---

## 3. User Stories
* **US-INV-01-01:** As a Finance Manager, I want the system to generate a PDF invoice for every subscription payment containing detailed line items, discounts, and tax values, so that I can keep my accounting clean.
* **US-INV-01-02:** As a Subscriber, I want to download historical invoices from the portal, so that I can submit expenses to my finance department.

---

## 4. Functional Requirements
* **FR-INV-01-01:** The system must generate unique invoice numbers following a sequential merchant-specific format (e.g., `INV-[YEAR]-[7-DIGIT-SEQUENCE]`).
* **FR-INV-01-02:** PDF templates must display:
  * Merchant branding header (Logo, Name, Business Address, Tax ID, Support Email).
  * Customer details (Name, Billing Address, Tax ID).
  * Line items with quantity, description, unit price, and total.
  * Calculation block (Subtotal, applied coupon discounts, tax rate/amount, net total).
  * Metadata (Billing period start/end, issue date, due date, status badge [Paid, Unpaid, Void, Refunded]).
* **FR-INV-01-03:** Store generated PDFs in an S3-compatible object storage bucket under private permissions access paths.
* **FR-INV-01-04:** Provide temporary, pre-signed download redirect URLs (valid for 15 minutes) for security.
* **FR-INV-01-05:** Calculate and reconcile sums to verify that:
  $$\text{Invoice Total} = \sum \text{Line Items} - \text{Discount Amount} + \text{Tax Amount}$$
  The calculation must match the payment gateway transaction amount to the exact cent.

---

## 5. Validation Rules
* **VAL-INV-01-01:** If the calculation validation rule fails by even $0.01, block the payment request, transition invoice state to `draft_error`, and alert the operations team.
* **VAL-INV-01-02:** A finalized invoice cannot have its content (items, taxes, discounts) modified. Adjustments must be executed via credit notes or refunds.

---

## 6. Edge Cases
* **Edge Case 1: PDF Generation Bottlenecks.** Under peak load (e.g., first day of the month with millions of renewals), synchronous PDF generation would choke the API.
  * *Resolution:* Decouple PDF generation. Save invoice database record immediately, place PDF generation task in a background queue worker. Render "Invoices are generating" placeholder in UI if download is requested prior to completion.
* **Edge Case 2: Multi-Currency Support.** The PDF template must render currency symbols accurately ($, €, £, ¥) using proper formatting rules based on the billing country locale (e.g., `1.200,50 €` vs `$1,200.50`).
* **Edge Case 3: Fully Refunded Invoice status.** If an admin triggers a refund for a transaction, the system must not modify the original PDF. It must generate a new supplementary PDF document labeled "Credit Note" with matching unique number referencing the parent invoice ID.

---

## 7. Dependencies
* **Upstream:**
  * `FEAT-SUB-01` (Plan Builder) - pricing details.
  * `FEAT-PAY-01` (Vaulting & Checkout) - transaction reference identifiers.
  * `FEAT-INV-02` (Tax Engine Integration) - tax amounts.
* **Downstream:**
  * `FEAT-PORT-02` (Card & Plan Management) - allows portal downloads.

---

## 8. API Requirements

### 8.1 Fetch Invoice
* **Endpoint:** `GET /v1/invoices/:id`
* **Response (200 OK):**
```json
{
  "id": "inv_93802ka9123",
  "invoice_number": "INV-2026-0000104",
  "customer_id": "cust_8f9024j94j",
  "subtotal": 100.00,
  "tax_amount": 19.00,
  "discount_amount": 10.00,
  "total": 109.00,
  "status": "paid",
  "pdf_download_url": "https://s3.aurabilling.com/invoices/cust_8f/inv_938.pdf?AWSAccessKeyId=AKIAIOSFODNN7EXAMPLE&Signature=vjfbhdej%3D&Expires=1780602900",
  "created_at": 1780598400
}
```

---

## 9. Database Impact
* **Table:** `INVOICE`
  * Updates `invoice_number` (String, Indexed), `pdf_url` (String/Text), `status` (String, e.g. `draft`/`unpaid`/`paid`/`void`/`refunded`), `subtotal` (Numeric), `tax_amount` (Numeric), `total` (Numeric).
* **Table:** `INVOICE_ITEM` (New invoice line item breakdown mapping)
  * Fields: `id` (UUID, PK), `invoice_id` (UUID, FK), `description` (String), `quantity` (Integer), `unit_price` (Numeric(12,4)), `total_price` (Numeric(12,4)), `created_at` (Timestamp).

---

## 10. UI Components
* **Invoice Table Row Widget:**
  * Contains download icon button linking to pre-signed URL endpoint.
* **Status Badges:**
  * Rendered as: Green (Paid), Red (Unpaid), Grey (Void/Draft), Purple (Refunded).

---

## 11. Security Requirements
* **SEC-INV-01-01 (Bucket Access Isolation):** Object storage buckets must not be public. Access is restricted using IAM policies. Downloads must route through backend controller endpoints which authenticate requests before issuing pre-signed redirects.
* **SEC-INV-01-02 (Signed URL Expiration):** Pre-signed download URLs must expire in exactly 15 minutes.

---

## 12. Acceptance Criteria
* **AC-INV-01-01:** Verify invoice totals strictly match sum formula components.
* **AC-INV-01-02:** Verify PDF files upload successfully to target S3 path.
* **AC-INV-01-03:** Verify PDF layouts display accurate regional formatting symbols.

---

## 13. Definition of Done
* PDF layout designs match style guides.
* Queue worker implementation test checks handling of 500 parallel generation tasks without timing out.
* Security configurations reviewed.
