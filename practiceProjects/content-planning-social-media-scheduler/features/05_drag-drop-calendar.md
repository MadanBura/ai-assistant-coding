# Feature Specification: Interactive Drag-and-Drop Calendar Grid
## Feature ID: FEAT-201

---

## 1. Purpose
Provide a highly visual, responsive calendar workspace allowing creators and social media managers to inspect content layouts across multiple months, weeks, and days. Enable quick reschedule adjustments through drag-and-drop gestures, automatically sync date updates to the database backend, and display platform indicators along with workflow states.

---

## 2. User Stories
* **US-201:** As a SMM, I want to view scheduled, draft, and approved posts in monthly, weekly, and daily calendar grids so that I can audit our content pacing.
* **US-202:** As a SMM, I want to reschedule a post by dragging it to a different calendar date/time slot so that I can adapt to changes quickly.

---

## 3. Functional Requirements
1. **FR-201-1:** The calendar view MUST support three layout options: Month View, Week View, and Day View.
2. **FR-201-2:** The calendar MUST display post cards on their corresponding scheduled dates and times.
3. **FR-201-3:** Each post card in the grid MUST render:
   * Connected platform icons (LinkedIn, Twitter/X, Instagram, Facebook).
   * Thumbnail of first attached media asset (if present).
   * Workflow state badge color: Grey (`DRAFT`), Yellow (`PENDING_REVIEW`), Green (`APPROVED`), Blue (`PUBLISHED`), Red (`FAILED`).
   * First 40 characters of post caption text.
4. **FR-201-4:** The calendar MUST support interactive drag-and-drop gestures using HTML5 drag events or a React component framework (e.g. `@hello-pangea/dnd` or `react-dnd`).
5. **FR-201-5:** Dragging and dropping a post card to another grid date/time slot MUST instantly calculate the new date time representation and trigger a `PUT /api/v1/posts/:id` API call.
6. **FR-201-6:** If the API update request fails, the calendar MUST roll back the visual UI state of the dragged card to its original position and display an error banner.
7. **FR-201-7:** The calendar MUST filter card displays by:
   * Post status group.
   * Target platform.
   * Creator/Author.

---

## 4. Validation Rules
* **Interactive Drag Bounds:** Users cannot drag cards into historical days or time blocks (prior to current date/time).
* **Schedule Time Constraints:** When dropping a post card onto a slot, the new schedule target must be at least 15 minutes in the future.
* **Drag Authorization Lock:** Only users possessing `ADMIN` or `EDITOR` roles in the workspace can perform drag updates. If a `VIEW_CLIENT` or `APPROVER` role attempts a drag gesture, block the card action immediately and show a permission alert.

---

## 5. Edge Cases
* **Dragging to exact same slot:** If a card is picked up and dropped back onto the same day and hour block, suppress the API trigger to avoid unnecessary server traffic.
* **Rescheduling lock-out window:** If a user tries to drag and drop a post scheduled to publish in less than 5 minutes, block the gesture and display the error message: *"Cannot reschedule posts scheduled within 5 minutes of publication."*
* **Multi-day/Multi-Platform post layout:** If a post is scheduled across multiple platforms, it is rendered as a single card on the calendar grid. Moving this card updates the scheduled publication time for all target platforms simultaneously.

---

## 6. Dependencies
* **Calendar Engine Library:** Grid calculation utility (e.g. `date-fns` or `moment` for client side offset calculations).
* **Core Post Edit Endpoint:** Relies on the standard update handler `PUT /api/v1/posts/:id` being implemented.

---

## 7. API Requirements

### 7.1 Fetch Scheduled Calendar Range
* **GET `/api/v1/posts/calendar`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Query Parameters:** `start_date=2026-06-01T00:00:00Z`, `end_date=2026-07-01T00:00:00Z`
* **Response `200 OK`:**
  ```json
  {
    "posts": [
      {
        "post_id": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
        "caption": "Acme Summer Launch Preview",
        "platforms": ["linkedin", "instagram"],
        "status": "APPROVED",
        "scheduled_time": "2026-06-15T10:00:00.000Z",
        "thumbnail_url": "https://d123.cloudfront.net/workspace_id/assets/thumb_image.png"
      }
    ]
  }
  ```

### 7.2 Update Rescheduled Post Time (Quick Reschedule API)
* **PATCH `/api/v1/posts/:post_id/reschedule`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Request Body:**
  ```json
  {
    "scheduled_time": "2026-06-18T15:30:00.000Z"
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "post_id": "a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d",
    "status": "APPROVED",
    "scheduled_time": "2026-06-18T15:30:00.000Z",
    "updated_at": "2026-06-04T16:30:00Z"
  }
  ```

---

## 8. Database Impact
Updates the `scheduled_time` value for the post in the `POST` table. No schema additions required. Indexing optimization on `scheduled_time` is utilized:

```sql
-- Execution update query representation:
UPDATE post
SET scheduled_time = '2026-06-18T15:30:00.000Z', updated_at = CURRENT_TIMESTAMP
WHERE id = 'a9b8c7d6-e5f4-3a2b-1c0d-9e8f7a6b5c4d'
  AND workspace_id = 'workspace_uuid'
  -- Ensures we don't accidentally update a locked post close to release time:
  AND scheduled_time > CURRENT_TIMESTAMP + INTERVAL '10 minutes'
  AND status NOT IN ('PUBLISHED');
```

---

## 9. UI Components
* **Calendar Header Controls:** Layout selector buttons (Month, Week, Day), navigation arrows (`<`, `Today`, `>`), and filters bar (Filter by platform, Author, Status).
* **Calendar Grid Container:** Scrollable responsive CSS grid container mapping rows and columns.
* **Calendar Post Card:** Drag-enabled div element featuring platform icons, text snippet, workflow state colored vertical accent, and hover card tooltip details.

---

## 10. Security Requirements
1. **Workspace Scope Lock:** Ensure calendar queries check `workspace_id = X-Workspace-ID` to prevent leakage of posts between workspaces.
2. **Access Role Check:** Enforce endpoint role verification. `PATCH` calls must return `403 Forbidden` if executed by user mapping to `VIEW_CLIENT`.

---

## 11. Acceptance Criteria
* **AC-201-1:** Client calendar properly renders Month, Week, and Day views with correct grid day boundaries.
* **AC-201-2:** Drag-and-drop gesture updates database record and returns a success response.
* **AC-201-3:** Dropping a card on an expired date/time or role validation mismatch blocks change and resets card visually.
* **AC-201-4:** If network goes offline mid-drag, calendar card snaps back to source date block and alerts user.

---

## 12. Definition of Done (DoD)
1. **Interactive Tests:** Manual testing validates smooth drag operations on mobile browsers and touch devices.
2. **Visual States Audit:** Layout verified under varying viewport dimensions (desktop down to minimum tablet widths).
3. **API Performance:** Date fetch queries process in <100ms under simulated testing.
