# Feature Detail: Listing Status Lifecycle

## Feature ID: FEAT-202

---

## 1. Purpose
Control the lifecycle states of property listings (Draft, Pending, Published, Rejected, Sold, Rented, Archived) via a strict state machine, ensuring listing data is accurate, secure, and properly indexed in the search engine.

---

## 2. User Stories
* **US-202-1 (Listing State Changes):** As an Owner or Agent, I want to archive or mark my property as "Sold" or "Rented" to stop receiving new inquiries.
  * *Dependency:* FEAT-201 (Property Creation Wizard) and FEAT-801 (Admin Moderation).
  * *Edge Case:* An active buyer has an open inquiry thread on a property that is suddenly archived.
  * *Resolution:* The inquiry thread remains active but displays a system notification banner: "This property is no longer active."

---

## 3. Functional Requirements
1. **FR-202-1 (State Machine Engine):** The system must restrict status changes according to the following transitions:
   * `draft` -> `pending` or `archived`
   * `pending` -> `published` (Admin only) or `rejected` (Admin only) or `archived`
   * `published` -> `sold`/`rented` or `archived` or `pending` (if edited by owner)
   * `rejected` -> `pending` (if edited by owner) or `archived`
   * `sold`/`rented` -> `archived` or `published` (relised)
   * `archived` -> `draft`
2. **FR-202-2 (Edit/Re-verification Trigger):** If a published listing undergoes changes to pricing, title, descriptions, address, or photos, its status must automatically revert to `pending` and be removed from public search until re-approved.
3. **FR-202-3 (Search Index Sync):** The search engine index must automatically remove properties that transition to states other than `published`.

---

## 4. Validation Rules
* **Status Enum Constraints:** The target status must belong to: `draft`, `pending`, `published`, `rejected`, `sold`, `rented`, `archived`.
* **Editor Access Validation:** Only the original creator (`owner_id` match) or a system administrator has authorization to trigger lifecycle transitions.

---

## 5. Edge Cases
* **Edge Case 1: Editing Draft or Rejected properties**
  * *Scenario:* User edits a rejected listing.
  * *Resolution:* Clear the historical rejection audit fields and set the listing status to `pending`, sending it back to the moderation queue.
* **Edge Case 2: Multi-Agent Listing Claim**
  * *Scenario:* Two agents attempt to list the exact same address and unit number.
  * *Resolution:* If a matching address is in `published` status, the backend rejects creation and returns code `PROPERTY_ALREADY_LISTED`.

---

## 6. Dependencies
* FEAT-201 (Property Creation) for creating properties.
* FEAT-801 (Moderation Queue) for transitioning to `published` or `rejected`.

---

## 7. API Requirements

### Change Listing Status
* **Method & Route:** `PUT /api/properties/:id/status`
* **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
* **Request Payload:**
```json
{
  "status": "sold"
}
```
* **Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Property status transitioned to sold.",
  "previousStatus": "published",
  "currentStatus": "sold"
}
```
* **Response `422 Unprocessable Entity`:**
```json
{
  "status": "error",
  "code": "INVALID_STATE_TRANSITION",
  "message": "Cannot transition property directly from draft to sold."
}
```

---

## 8. Database Impact
* **Table:** `properties`
  * Updates `status` column.
  * Records transition updates in `updated_at` column.
* **Indexes:**
  * Double composite index on `(owner_id, status)` to optimize search lists in the owner's dashboard.

---

## 9. UI Components
* **Dashboard Property Card:** Displays listing thumbnail with colorful status badge indicators:
  * Gray for `Draft` / `Archived`
  * Orange for `Pending`
  * Green for `Published`
  * Red for `Rejected`
  * Purple for `Sold` / `Rented`
* **Action Menu Dropdown:** Quick selector showing valid options (e.g. "Mark as Sold", "Edit Details", "Archive Listing").

---

## 10. Security Requirements
* The controller must query the property and match `req.user.id === property.owner_id` prior to executing updates. Return `403 Forbidden` on mismatch.
* Prevent batch operations from skipping state validation checks by running the transition logic inside database transaction hooks.

---

## 11. Acceptance Criteria
* **AC-202-1:**
  * *Given* a property owner is on their listings dashboard,
  * *When* they click "Archive" on a `published` listing,
  * *Then* the status changes to `archived` in the DB, and the listing is immediately deleted from the search index.
* **AC-202-2:**
  * *Given* an Owner is editing a `published` listing,
  * *When* they change the price from $500,000 to $480,000 and click save,
  * *Then* the property details update, the status changes to `pending`, and a notification is sent to the admin team.

---

## 12. Definition of Done
* State machine tests cover 100% of valid/invalid state pathways.
* Search engine synchronization verified (listings removed from search index on archive/sold).
* Re-moderation trigger tested with edits to pricing, titles, and media arrays.
