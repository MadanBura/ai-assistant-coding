# Feature Specification: Drag-and-Drop Itinerary Builder
**Feature ID:** FE-201  
**Priority:** 3 (Core User Experience)

---

## 1. Purpose
Provides an interactive multi-day planning interface where users can organize their travel days. Collaborators can create, update, and sort daily activities, meals, lodgings, and transit slots, supporting time slots and drag-and-drop scheduling updates.

---

## 2. User Stories
* **US-201.1 (Add Activity):** As an Editor, I want to add an activity card to a specific day and time slot with a title, description, and location, so that we have a schedule.
* **US-201.2 (Drag-and-Drop Reorder):** As an Editor, I want to drag an activity card to a different time slot or another day, so that I can easily reorganize our trip layout.
* **US-201.3 (Categorized Items):** As a Planner, I want to label activities by category (flight, lodging, food, transit, sightseeing), so that the timeline is easy to parse visually.
* **US-201.4 (View Daily Plan):** As a Traveler, I want to view my itinerary sorted chronologically with time indicators, so that I can easily navigate during the trip.

---

## 3. Functional Requirements
* **FR-201.1:** The system shall display a multi-column workspace representing the days of the trip, ordered sequentially from Start Date to End Date.
* **FR-201.2:** The system shall display an "Add Activity Form" modal prompting for:
  - Title (Text)
  - Category (Dropdown: flight, lodging, activity, food, transit)
  - Start Time & End Time (Datetime selectors)
  - Location Address/Name (Text string with geocode metadata placeholder)
  - Description/Notes (Textarea)
* **FR-201.3:** The system shall render activity blocks sorted chronologically by start time on the day's timeline.
* **FR-201.4:** The system shall enable drag-and-drop interactions to change an activity's scheduled date or time slot, triggering an API update and broadcasting changes via WebSockets.
* **FR-201.5:** The system shall display visual duration height sizing on activity blocks relative to their length (e.g. 1-hour event vs. 4-hour tour).

---

## 4. Validation Rules
* **VR-201.1 (Time Alignment):** The event `end_time` must be chronologically after the `start_time` for any activity.
* **VR-201.2 (Date Bound Constraints):** The event date must fall strictly between the trip's `start_date` and `end_date` inclusive.
* **VR-201.3 (Write Privileges):** Users attempting to write, update, or delete cards must hold `owner` or `editor` roles on the target trip.

---

## 5. Edge Cases
* **EC-201.1 (Activity Schedule Overlap):** If an activity overlaps with another, flag both cards on the UI with a warning border and icon "Schedule Conflict: Overlapping Times", but allow the save to complete (e.g. to accommodate booking choices or options).
* **EC-201.2 (Multi-Day Span Events):** For activities spanning midnight (e.g. overnight flights or sleepers), split the visualization across the day columns, showing continuation bars.
* **EC-201.3 (Concurrent Drags):** If user A drags a card to Day 2, and User B simultaneously updates the description of that same card, the UI must resolve using the database state, updating the card's position and details on both clients without throwing JS errors.

---

## 6. Dependencies
* **Upstream Dependencies:** FE-101 (Trip Creator & Planner), FE-102 (Collaborative Workspace).
* **Downstream Dependencies:** FE-202 (Map Integration), FE-302 (Lodging Recommendations), FE-501 (Flights Sync), FE-502 (Notifications).

---

## 7. API Requirements
All calls must include `Authorization: Bearer <JWT_TOKEN>`.

### 7.1 POST `/api/trips/:tripId/itinerary`
* **Request Body:**
  ```json
  {
    "title": "Visit Louvre Museum",
    "description": "Pre-booked entry tickets",
    "start_time": "2026-07-11T13:00:00Z",
    "end_time": "2026-07-11T16:00:00Z",
    "location_name": "Louvre Museum, Paris, France",
    "category": "activity"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "itemId": "4a5c98d3-7ccb-44e2-a1b2-c3d4e5f6a7b9",
    "tripId": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    "created_at": "2026-06-04T16:23:10Z"
  }
  ```

### 7.2 PUT `/api/trips/:tripId/itinerary/:itemId`
* **Request Body (Drag-and-Drop update):**
  ```json
  {
    "start_time": "2026-07-12T09:00:00Z",
    "end_time": "2026-07-12T12:00:00Z"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "itemId": "4a5c98d3-7ccb-44e2-a1b2-c3d4e5f6a7b9",
    "updated": true
  }
  ```

### 7.3 DELETE `/api/trips/:tripId/itinerary/:itemId`
* **Response (200 OK):**
  ```json
  {
    "itemId": "4a5c98d3-7ccb-44e2-a1b2-c3d4e5f6a7b9",
    "deleted": true
  }
  ```

---

## 8. Database Impact
Updates the `itinerary_items` database.

### Schema Changes
* Inserts new rows in `itinerary_items` linked to parent `trips.id`.
* Deleting or updating rows must run indexed queries targeting `itemId` and verify `trip_members` access logic in a single transaction block.

---

## 9. UI Components
* **Daily Planner Board:** Calendar panel rendering dynamic columns per trip day, complete with hourly timeline grids (00:00 to 23:00).
* **Activity Card:** Draggable items styled with custom colors based on category:
  - Flight: Slate Gray
  - Lodging: Blue
  - Sightseeing/Activity: Indigo
  - Food: Emerald Green
  - Transit: Amber
* **Add Activity Button:** FAB placed inside each daily column.

---

## 10. Security Requirements
* **SEC-201.1 (Permission Verification):** Verify that the user triggering changes is a member of the trip workspace (`role` in `trip_members` is `owner` or `editor`). Return `403 Forbidden` if they are a viewer or non-member.
* **SEC-201.2 (CSRF Guard):** All POST/PUT actions must check token headers.
* **SEC-201.3 (Sanitize Description):** Clean incoming text strings of HTML tags using server-side sanitizer before storage.

---

## 11. Acceptance Criteria
* **AC-201.1:** Attempting to save an event with an `end_time` before the `start_time` yields an input error on the UI.
* **AC-201.2:** Dragging an activity card to a new day column instantly saves to the DB and relocates the card on the visual grid of all online users.
* **AC-201.3:** The timeline columns match the length of the trip (e.g. 5 days creates exactly 5 columns).
* **AC-201.4:** Overlapping events render correctly on top of/beside each other without hiding details or breaking columns.

---

## 12. Definition of Done (DoD)
1. Drag-and-drop mechanics verified on mobile devices (touch-drag events) and desktop screens (pointer-drag events).
2. API inputs audited for timezone compatibility (UTC formats verified).
3. Concurrency conflict resolution verified (e.g. overlapping edits do not freeze client browser tab).
