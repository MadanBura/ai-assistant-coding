# Feature Specification: Shared Travel Notes
**Feature ID:** FE-203  
**Priority:** 4 (Rich Collaboration Workspace Extension)

---

## 1. Purpose
Provides a collaborative workspace notes editor supporting markdown formatting. Trip members can write, format, check off packing lists, and share logistical details (like reservation confirmations, visa guidelines, passport numbers) with immediate synchronization across active sessions.

---

## 2. User Stories
* **US-203.1 (Create & Edit Notes):** As a collaborator, I want to create rich text notes inside the trip board, so that we can organize checklists and voucher information.
* **US-203.2 (Markdown support):** As a user, I want to format my notes with markdown (bold, lists, headings, links), so that they are structured and readable.
* **US-203.3 (Packing Checklists):** As a traveler, I want to create packing lists with clickable checkboxes, so that I can track preparation status.
* **US-203.4 (Real-time updates):** As a collaborator, I want to see typing cursors and edits from other members immediately, so that we do not conflict.

---

## 3. Functional Requirements
* **FR-203.1:** The system shall display a list of custom markdown notes linked to the active trip workspace.
* **FR-203.2:** The system shall render a Markdown editor in the main notes panel supporting headings, list items, bold/italic text, checkable boxes, and URL hyperlinks.
* **FR-203.3:** The system shall save content changes to the database using debounced API triggers (e.g. auto-save every 1 second after typing stops).
* **FR-203.4:** The system shall establish WebSocket sync channels to propagate text inserts/deletes to all active workspace viewers.
* **FR-203.5:** The system shall support a read-only mode for users holding a `viewer` role on the trip.

---

## 4. Validation Rules
* **VR-203.1 (Character Limit):** Single note items must not exceed 50,000 characters.
* **VR-203.2 (Unique Titles):** Notes inside the same trip workspace must feature unique titles to prevent lookup confusion.
* **VR-203.3 (Write Privileges):** Only members with roles of `owner` or `editor` can write or delete notes.

---

## 5. Edge Cases
* **EC-203.1 (Simultaneous Paragraph Edits):** If two users edit the exact same paragraph at the same time:
  - Implement basic Operational Transformation (OT) or Conflict-Free Replicated Data Type (CRDT) to merge text.
  - Fallback logic: If a merge conflict occurs, save User B's version as a separate paragraph below User A's version, highlight it in yellow, and display toast alert: "Concurrent Edit Conflict: Divergent text appended below."
* **EC-203.2 (Offline Writing attempts):** If a user's network cuts out while typing, the editor must enter a read-only state with a message "Connection Lost. Notes locked to prevent data loss." when offline syncing is not supported.
* **EC-203.3 (Unregistered links):** Ensure any hyperlink entered is sanitized and restricted from running javascript (e.g. block scripts like `javascript:alert(1)`).

---

## 6. Dependencies
* **Upstream Dependencies:** FE-101 (Trip Creator & Planner), FE-102 (Collaborative Workspace).
* **Downstream Dependencies:** None.

---

## 7. API Requirements
All calls require `Authorization: Bearer <JWT_TOKEN>`.

### 7.1 GET `/api/trips/:tripId/notes`
* **Response (200 OK):**
  ```json
  [
    {
      "id": "e3a89bcd-bbfd-4b2d-9b5d-ab8dfbbd4be1",
      "title": "Packing List",
      "content": "# Packing List\n- [ ] Passport\n- [ ] Chargers\n- [ ] Jacket",
      "updated_at": "2026-06-04T16:23:16Z"
    }
  ]
  ```

### 7.2 POST `/api/trips/:tripId/notes`
* **Request Body:**
  ```json
  {
    "title": "Packing List",
    "content": "# Packing List"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "noteId": "e3a89bcd-bbfd-4b2d-9b5d-ab8dfbbd4be1"
  }
  ```

### 7.3 PUT `/api/trips/:tripId/notes/:noteId`
* **Request Body:**
  ```json
  {
    "content": "# Packing List\n- [x] Passport\n- [ ] Chargers\n- [ ] Jacket"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "noteId": "e3a89bcd-bbfd-4b2d-9b5d-ab8dfbbd4be1",
    "updated": true
  }
  ```

---

## 8. Database Impact
Updates the `notes` entity database.

### Schema Schema
* Columns: `id` (UUID), `trip_id` (UUID), `title` (VARCHAR), `content` (TEXT), `updated_at` (TIMESTAMP).
* Index on `trip_id` for fast rendering when switching workspaces.

---

## 9. UI Components
* **Notes Sidebar:** Lists available notes in the active trip with a "Create Note" button.
* **Markdown Workspace:** Large text-editing canvas showing markdown source code or toggleable preview modes.
* **Conflict Notice Banner:** Alert box showing options to resolve concurrent text divergency.

---

## 10. Security Requirements
* **SEC-203.1 (XSS Purging):** Before rendering any markdown string to HTML, pass the raw text through a DOMPurify library instance to strip script injection elements.
* **SEC-203.2 (RBAC Validation):** Block note update calls on the backend if the request token fails owner/editor permission mapping checks.

---

## 11. Acceptance Criteria
* **AC-203.1:** Checked list items are updated instantly and do not reset on page refresh.
* **AC-203.2:** Viewers cannot input text or delete notes, and visual UI controls are hidden in their sessions.
* **AC-203.3:** Standard markdown elements (headers, bolding, lists, code snippets) render correctly in HTML view mode.
* **AC-203.4:** Auto-save operates silently in the background, updating the "All changes saved" header label.

---

## 12. Definition of Done (DoD)
1. Markdown parser validated with extreme injection test scripts to verify XSS filters hold.
2. Debounce limits tested, demonstrating API traffic efficiency (no queries on individual character keypresses).
3. Concurrent typing tests passed with multiple concurrent users editing notes.
