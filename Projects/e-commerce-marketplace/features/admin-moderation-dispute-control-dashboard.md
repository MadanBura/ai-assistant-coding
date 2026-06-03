# Feature Specification: Admin Moderation & Dispute Control Dashboard

## 1. Overview & Purpose
This feature serves as the central control panel for marketplace operations. It equips administrators with tools to verify onboarding merchants, audit product catalog submissions, configure platform commission percentages, process refunds, and resolve transaction disputes.

---

## 2. Scope & Detailed Requirements

### Vendor Verification Review
* Admin UI listing onboarding stores that are in `submitted_for_review` status.
* Displays registration numbers, address, tax files, and bank records.
* Action buttons to approve, suspend, or request revisions.

### Product Moderation
* Verification queue for new product listings.
* Enforces content guidelines: Admins can approve a listing (status = `active`) or reject it (status = `draft` with moderation notes sent to the seller).

### Commission Settings
* Global admin controls to edit standard commission percentages.
* Overrides panel to configure vendor-specific commission structures.

### Refund Management
* Process refund requests escalated by customers or approved by vendors.
* Triggers payout adjustments in Stripe Connect.

### Dispute Resolution
* Dashboard interface displaying buyer claims (e.g., items not received, defective goods).
* Mediation chat interface for admins to communicate with both customer and vendor to resolve issues.

---

## 3. Technical Workflow & User Flows

```
[Buyer initiates return request on Order Detail Page]
       |
       v
[Seller rejects return request]
       |
       v
[Buyer clicks "Escalate to Admin" -> Status becomes "Disputed"]
       |
       v
[Admin Control Dashboard: Disputes Queue]
       |
       +---> Admin reviews message logs, order details, tracking URL, and photos
       +---> Requests clarification from Seller / Buyer if necessary
       +---> Decides outcome:
                |
                +---> Option A: Deny claim (Close dispute, release funds to Seller)
                +---> Option B: Approve claim (Initiate Refund, Stripe routes funds back to Customer)
```

---

## 4. Proposed API Endpoints

### Administrative Endpoints
* `GET /api/v1/admin/vendors/verification-queue`
* `POST /api/v1/admin/vendors/:id/verify`
  * Body: `{ action: "approve" | "reject", reason: String }`
* `GET /api/v1/admin/products/moderation-queue`
* `POST /api/v1/admin/products/:id/moderate`
  * Body: `{ status: "active" | "suspended", moderation_notes: String }`
* `POST /api/v1/admin/config/commissions`
  * Body: `{ global_commission_percentage, global_flat_fee }`
* `POST /api/v1/admin/disputes/:id/resolve`
  * Body: `{ resolution: "refund_customer" | "release_funds_to_vendor", notes: String }`

---

## 5. Database Schema & Data Model

* **Disputes Entity:**
  * `id`: UUID (Primary Key)
  * `sub_order_id`: UUID (Foreign Key to Sub_Orders)
  * `reason`: Enum (`item_not_received`, `item_defective`, `other`)
  * `description`: Text
  * `status`: Enum (`opened`, `in_review`, `resolved_refunded`, `resolved_closed`)
  * `resolution_notes`: Text (Nullable)
  * `resolved_by`: UUID (Foreign Key to Users - Admin role)
  * `created_at`: Timestamp
  * `updated_at`: Timestamp

---

## 6. Acceptance Criteria
* **AC-10.01:** Only users authenticated with the `Admin` role can access the `/api/v1/admin/*` endpoints. Other users receive an HTTP 403 Forbidden.
* **AC-10.02:** Verification approvals dynamically update store profiles, making their store page and listings live on the storefront immediately.
* **AC-10.03:** Admin refund approvals trigger Stripe Connect API refund calls and mark the sub-order status as `returned` and the master payment transaction as `refunded` or `partially_refunded`.
