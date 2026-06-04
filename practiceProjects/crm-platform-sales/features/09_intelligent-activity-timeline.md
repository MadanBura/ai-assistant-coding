# Feature Specification: Intelligent Activity Timeline
## Feature ID: FE-LCM-3 (Priority 09)

---

## 1. Purpose
To compile and display a unified, chronological history of all interactions (e.g., manual notes, automatic emails, logged calls, task updates, and deal stage changes) related to a Lead, Contact, or Deal, facilitating team alignment.

---

## 2. User Stories
* **US-LCM-003:** As a Sales Representative, I want to view a chronological feed of all past interactions with a prospect so that I have context before reaching out.
* **US-LCM-007:** As a Sales Representative, I want to add a manual text note to the timeline during a client call so that I can document meeting outcomes.
* **US-LCM-008:** As a Sales Manager, I want to review activity logs of a specific account so that I can audit a representative's pipeline activities.

---

## 3. Functional Requirements
1. **FR-TIME-001:** The system shall aggregate and display events from multiple tables (`ACTIVITIES`, `EMAILS`, `TASKS`, `DEALS`) into a single chronological timeline feed.
2. **FR-TIME-002:** The timeline must sort items in descending order (newest first).
3. **FR-TIME-003:** The feed must support pagination, fetching and rendering a maximum of 50 activities per page load.
4. **FR-TIME-004:** The system shall support posting manual Notes containing formatted text (rich text) and linking them to a Lead, Contact, or Deal.
5. **FR-TIME-005:** The feed must render event types with unique visual icons and metadata summaries:
   - **Email:** Subject, preview text, recipient, and sync timestamp.
   - **Call Log:** Duration, notes, outcome status.
   - **Note:** Author, content, and creation timestamp.
   - **Task Update:** Completion status, due date, assignee.
   - **Stage Transition:** Old stage, new stage, actual value, and actor.

---

## 4. Validation Rules
1. Manual timeline notes must not exceed 5,000 characters.
2. The user ID of the activity author must match the authenticated user token making the API call.

---

## 5. Edge Cases
* **Edge Case 1 (Activity with Hundreds of Emails):** In enterprise accounts with thousands of timeline logs, queries must use efficient indexing and cursor-based pagination (e.g. `WHERE created_at < last_item_timestamp`) instead of offset-based pagination to prevent query times from degrading beyond 200ms.
* **Edge Case 2 (Cross-Entity Logging):** If an activity is logged for a Deal, it must also Bubble Up and render on the timeline of the associated Contact and Account profiles. If logged directly on a Contact, it must not bubble up to unrelated deals.

---

## 6. Dependencies
* **FE-LCM-1 / FE-LCM-2 / FE-SPD-1:** Leads, Contacts, and Deals must exist before interactions can be associated with them.
* **FE-CTA-1 / FE-CTA-2:** Email sync mechanisms and Task triggers must be active to populate automated entries.

---

## 7. API Requirements

### 7.1 Fetch Timeline Activities
* **URL:** `/api/v1/activities`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <Token>`
* **Parameters:**
  - `entity_type` (VARCHAR "lead", "contact", "deal")
  - `entity_id` (UUID)
  - `limit` (INT, default 50)
  - `cursor` (TIMESTAMP/UUID for pagination)
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "cursor": "2026-06-04T12:00:00Z",
    "activities": [
      {
        "id": "a3b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "type": "Note",
        "content": "Client wants to schedule demo next Tuesday.",
        "author_name": "Sarah Jenkins",
        "created_at": "2026-06-04T16:00:00Z"
      },
      {
        "id": "e67d268a-6b45-4b07-a3f2-c7f8a7be8e70",
        "type": "Stage_Change",
        "content": "Stage updated from Discovery to Proposal Sent",
        "author_name": "System Agent",
        "created_at": "2026-06-04T10:48:00Z"
      }
    ]
  }
  ```

### 7.2 Create Manual Note
* **URL:** `/api/v1/activities/notes`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <Token>`
* **Payload:**
  ```json
  {
    "entity_type": "deal",
    "entity_id": "52857e3f-67cf-4545-be02-4c2847a989ef",
    "content": "Follow-up note: client was very receptive to custom pricing options."
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "note_id": "a3b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
  }
  ```

---

## 8. Database Impact
* **Table:** `ACTIVITIES`
  - Columns: `id` (UUID PK), `activity_type` (VARCHAR ENUM "Note", "Call", "Stage_Change"), `content` (TEXT), `created_by` (UUID FK to `USERS`), `lead_id` (UUID FK to `LEADS`, Nullable), `contact_id` (UUID FK to `CONTACTS`, Nullable), `deal_id` (UUID FK to `DEALS`, Nullable), `created_at` (TIMESTAMP).
* **Indexes:** Non-clustered index on `(lead_id, created_at DESC)`, `(contact_id, created_at DESC)`, and `(deal_id, created_at DESC)`.

---

## 9. UI Components
* **Chronological Timeline Stream:** Vertical timeline path containing event nodes with specific visual badges.
* **Rich Text Editor Box:** Input drawer with simple markdown formatting options (bold, italic, lists) and quick-submit button.
* **Activity Filter Panel:** Tag selections allowing users to toggle visible elements (e.g., show only Notes or hide Emails).

---

## 10. Security Requirements
* User permissions checked on the resource ID specified in `entity_id` before querying the database.
* Markdown parser in the UI must sanitize HTML to block XSS injection scripts.

---

## 11. Acceptance Criteria (AC)
* **AC-LCM-003:** Given a user opens a Contact page, when the page loads, then the timeline must retrieve activity entries and display them in descending chronological order.
* **AC-LCM-007:** Given a user adds a manual note, when submitted, the timeline stream must append the new card at the top dynamically without requiring a hard refresh.
* **AC-LCM-008:** Given a note exceeds 5,000 characters, when the user clicks save, the frontend must intercept and block the request, showing a limit warning.

---

## 12. Definition of Done (DoD)
1. Cursor-based pagination logic verified under stress testing with 5,000 timeline rows.
2. XSS payload suite executed against notes inputs to verify complete sanitization.
3. Web client verified to load scroll positions smoothly without resetting.
