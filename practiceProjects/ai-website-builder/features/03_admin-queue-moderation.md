# Feature Detail: Admin Queue & Moderation

## Feature ID: FEAT-801

---

## 1. Purpose
Provide system administrators with a secure portal to review pending property listings, approve or reject listings with reasons, and keep audit trails of all moderator activities to ensure platform listing quality and security.

---

## 2. User Stories
* **US-801-1 (Moderation Queue Dashboard):** As an Admin, I want to view all newly submitted property listings in a pending queue to review their content and approve or reject them with feedback.
  * *Dependency:* FEAT-201 (Property Creation Wizard).
  * *Edge Case:* Massive spike in submissions causes backlog.
  * *Resolution:* Implement automatic AI preprocessing flags that mark listings containing blacklisted words or stock photos as "High Risk" for immediate human rejection.

---

## 3. Functional Requirements
1. **FR-801-1 (Pending List Fetching):** The system must fetch all listings with status `pending`, displaying details (title, submitter, submission date) in a tabular format sorted by oldest first.
2. **FR-801-2 (Approval Execution):** Clicking "Approve" must update the listing status to `published` and dispatch a notification email to the owner.
3. **FR-801-3 (Rejection Execution):** Clicking "Reject" must open a modal prompting for a feedback reason. Once submitted, status must update to `rejected`, and feedback must be emailed to the owner.
4. **FR-801-4 (Audit Log Creation):** Every moderation action must write an entry to `admin_audit_logs` tracking moderator ID, property ID, action type, reason, and timestamp.

---

## 4. Validation Rules
* **Rejection Reason:** Mandatory. Must be a minimum of 15 characters, maximum of 500 characters.
* **Property Status Constraints:** A moderator can only transition status:
  * From `pending` -> `published` or `rejected`.
  * Status changes out of other states (e.g. `archived`) are unauthorized via this portal.

---

## 5. Edge Cases
* **Edge Case 1: Double Moderation Collision**
  * *Scenario:* Two administrators open the same pending listing details page simultaneously and attempt to act.
  * *Resolution:* Implement optimistic locking on the property record. When Admin A submits, they succeed. When Admin B submits, they receive a `409 Conflict` error stating: "This listing has already been moderated by Admin A."
* **Edge Case 2: Listing Edited Mid-Review**
  * *Scenario:* The owner updates listing contents while an admin is actively viewing it in the moderation dashboard.
  * *Resolution:* Check the `updated_at` timestamp. If it is newer than the timestamp fetched by the admin browser, reject the approval/rejection action and force a reload of the review screen.

---

## 6. Dependencies
* FEAT-201 (Property Creation Wizard) for generating pending listings.
* FEAT-101 (Role setup) for ensuring the user has the `admin` role flag.

---

## 7. API Requirements

### Fetch Moderation Queue
* **Method & Route:** `GET /api/admin/properties/pending`
* **Headers:** `Authorization: Bearer <Admin-JWT>`
* **Response `200 OK`:**
```json
{
  "status": "success",
  "count": 1,
  "queue": [
    {
      "id": "prop_8820391",
      "title": "Modern 2-Bed Condo with City View",
      "price": 450000.00,
      "submitter": {
        "fullName": "Sarah Jenkins",
        "email": "sarah.j@example.com"
      },
      "createdAt": "2026-06-04T12:00:00Z"
    }
  ]
}
```

### Action Listing
* **Method & Route:** `POST /api/admin/properties/:id/moderate`
* **Headers:** `Authorization: Bearer <Admin-JWT>`, `Content-Type: application/json`
* **Request Payload:**
```json
{
  "action": "reject",
  "reason": "Listing details contain stock photos. Please upload genuine pictures of the interior."
}
```
* **Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Listing successfully moderated.",
  "auditLogId": "audit_827391"
}
```

---

## 8. Database Impact
* **Tables modified:** `properties`, `admin_audit_logs`.
* **New Table Scheme:** `admin_audit_logs`
  * `id` (uuid, primary key)
  * `moderator_id` (uuid, foreign key referencing `users.id`)
  * `property_id` (uuid, foreign key referencing `properties.id`)
  * `action` (enum: approve, reject)
  * `reason` (text, nullable)
  * `created_at` (timestamp)
* **Indexes:**
  * Index on `properties.status` (for speed fetching `pending` queues).

---

## 9. UI Components
* **Moderator Dashboard Panel:** Sidebar containing counters of pending listings, a primary table listing items, and action trigger buttons.
* **Detailed Review Screen:** A split screen showing all details, photos, coordinates validation, and a persistent right-aligned floating box containing "Approve" (green) and "Reject" (red) buttons.

---

## 10. Security Requirements
* The API middleware must validate role claims: `req.user.role === 'admin'`. Return `403 Forbidden` for all others.
* Sanitize all inputs in the rejection reason text to prevent HTML injection in emails sent to users.

---

## 11. Acceptance Criteria
* **AC-801-1:**
  * *Given* a logged-in Administrator on the Moderation Queue page,
  * *When* they click "Approve" on listing `prop_8820391`,
  * *Then* the status updates to `published` in the database, the property appears in the public search index, and an approval email is dispatched.
* **AC-801-2:**
  * *Given* a moderator is reviewing a property,
  * *When* they click "Reject" but submit an empty rejection reason,
  * *Then* the form block blocks execution, showing a red label: "Rejection reason is required."

---

## 12. Definition of Done
* Sub-dashboard interface for admins integrated.
* Audit log database table created and migration executed.
* Collision handling validated via parallel integration tests.
* OpenAPI routing documentation updated to lock `/api/admin/*` paths.
