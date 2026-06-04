# Feature Specification: Admin Moderation Console

## 1. Feature Info
* **Feature ID:** `FT-6.1`
* **Priority:** 7 (Platform Governance & Control)
* **Title:** Admin Moderation Console

---

## 2. Purpose
Provides administrators with an internal console to audit agent verification requests, review property listings, investigate user reports, and manage marketplace safety.

---

## 3. User Stories
* **US-6.1:** As an Admin, I want to review pending property listings along with their uploaded deeds so that I can approve only genuine listings.
* **US-6.2:** As an Admin, I want to review pending agent verification applications so that I can confirm brokerage status before activating agent accounts.
* **US-6.3:** As an Admin, I want to review flagged items (listings, reviews) and take resolution actions (remove, dismiss flags) to maintain platform safety.

---

## 4. Functional Requirements

### FR-601.1: Moderation Queue Tabs
* **Description:** Separate queues:
  * *Listings Queue:* Shows listings in `PENDING_APPROVAL` status with quick access to PDF deeds.
  * *Agents Queue:* Shows agents in `PENDING_VERIFICATION` status with license numbers and PDFs.
  * *Reports Queue:* Shows listings or reviews flagged by users.

### FR-601.2: Decision Resolution Interface
* **Description:** Admins can click "Approve" or "Reject" on queued items.
  * *Approve Listing:* Transitions listing status to `APPROVED`.
  * *Reject Listing:* Prompts input for rejection reason, transitions status to `REJECTED`, and notifies the owner.
  * *Approve Agent:* Transitions agent status to `VERIFIED` and sets `is_verified` to true.
  * *Reject Agent:* Transitions agent status to `REJECTED` and requires inputting rejection notes.

### FR-601.3: Moderation Audit Log
* **Description:** Every approval, rejection, or ban action must write a persistent audit record detailing the acting Admin, target ID, action type, timestamps, and justification.

---

## 5. Validation Rules
* **VAL-601.1 (Mandatory Rejection Notes):** Rejections must contain a notes string between `10` and `1000` characters. Leaving the justification blank prevents submission of the rejection.
* **VAL-601.2 (Access Limitation):** Only users with role `Admin` are permitted to execute GET or POST actions against the moderation API paths.

---

## 6. Edge Cases
* **Edge Case 1: Concurrent Admin Review Conflict:** Two administrators review the same agent verification application at the same time. Admin A clicks "Approve" while Admin B clicks "Reject".
  * *Resolution:* The database transaction must employ optimistic locking via a `version` or `updated_at` check. The second action must fail, prompting a notice: "This record has already been modified by another administrator."
* **Edge Case 2: Listing Deleted Mid-Review:** A property owner deletes their listing while it sits in the admin's open preview tab.
  * *Resolution:* Clicking approve must return `404 Not Found` with a notice explaining the listing was removed by the owner.

---

## 7. Dependencies
* **Upstream:** `FT-1.1` (Auth), `FT-2.1` (Properties data), `FT-1.2` (Agent verification data).
* **Downstream:** Public search indexes (rely on state updates from this module).

---

## 8. API Requirements

### Fetch Moderation Listings
* **Endpoint:** `GET /api/v1/admin/moderation/listings`
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "propertyId": "prop_a298109bf",
      "title": "Suburban Oasis",
      "ownerName": "Sarah Jenkins",
      "deedUrl": "https://cdn.propconnect.com/deeds/deed_prop_a298109bf.pdf?expiry=...",
      "submittedAt": "2026-06-04T18:29:05Z"
    }
  ]
}
```

### Resolve Listing Moderation
* **Endpoint:** `POST /api/v1/admin/moderation/listings/{id}/resolve`
* **Headers:** `Authorization: Bearer <token>`
* **Request Schema:**
```json
{
  "action": "REJECT",
  "reason": "Deed document is illegible. Please upload a high-resolution scan."
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Listing resolution applied successfully."
}
```

---

## 9. Database Impact
* **Target Tables:** `PROPERTY` (Updates status fields), `USER` (Updates status fields), `MODERATION_LOG` (Inserts audit trail).
* **Schema: `MODERATION_LOG` Table:**
```sql
CREATE TABLE moderation_logs (
    id SERIAL PRIMARY KEY,
    admin_id VARCHAR REFERENCES users(id),
    target_type VARCHAR NOT NULL, -- 'PROPERTY' | 'USER' | 'REVIEW'
    target_id VARCHAR NOT NULL,
    action VARCHAR NOT NULL, -- 'APPROVE' | 'REJECT' | 'BAN'
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 10. UI Components
* **Split Portal Layout:** Side menu navigation displaying metrics (e.g., "Pending Listings: 14", "Pending Agents: 5").
* **Deed Doc Preview Pane:** Iframe or PDF reader component showing deeds side-by-side with listing specification fields.
* **Inline Reject Dialogue Box:** Centered modal panel focusing focus onto the justification text box with validation warnings.

---

## 11. Security Requirements
* **SEC-601.1 (Role Lock):** Enforce strict backend route checks:
```typescript
if (req.user.role !== 'Admin') {
  return res.status(403).json({ error: "Access Denied: Administrative permissions required." });
}
```
* **SEC-601.2 (Audit Integrity):** Audit records in `MODERATION_LOG` cannot be edited or deleted by any user role (including Admins) via API to ensure log immutability.

---

## 12. Acceptance Criteria
* **AC-601:** Rejecting a listing with blank notes returns a 400 validation error.
* **AC-602:** Approving an agent successfully updates their verification status to `VERIFIED` and exposes their listings to public search.

---

## 13. Definition of Done
* [ ] Database migration for moderation logs executed.
* [ ] Role authorization middleware verified under integration testing suites.
* [ ] Admin panel interface optimized for desktop use.
