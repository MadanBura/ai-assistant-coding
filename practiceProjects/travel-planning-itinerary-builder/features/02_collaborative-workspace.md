# Feature Specification: Collaborative Workspace (Shared Trips)
**Feature ID:** FE-102  
**Priority:** 2 (Workspace Sync & Concurrency Layer)

---

## 1. Purpose
Enables multiple registered users to collaborate on a single trip. The feature allows owners to generate invitation links, assign roles (Viewer/Editor), and implements WebSocket support to broadcast updates concurrently across active user sessions.

---

## 2. User Stories
* **US-102.1 (Generate Invite):** As a trip Owner, I want to generate a secure, copyable share link, so that I can invite my friends to join my trip.
* **US-102.2 (Join Trip):** As a co-traveler, I want to click an invite link and join a trip, so that I can contribute to the planning session.
* **US-102.3 (Real-time Viewers):** As a collaborator, I want to see avatars of who is online in the workspace, so that we don't overwrite each other's changes.
* **US-102.4 (Manage Permissions):** As a trip Owner, I want to change collaborators between `Read-Write` (Editor) and `Read-Only` (Viewer) or kick them from the trip, so that I retain administrative control.

---

## 3. Functional Requirements
* **FR-102.1:** The system shall generate tokenized invitation URLs that embed a short-lived cryptographic token mapping to a specific trip ID.
* **FR-102.2:** The system shall authenticate and add users visiting a valid invite link to the `trip_members` database map.
* **FR-102.3:** The system shall set up a WebSocket connection upon workspace load to sync planning changes (itinerary updates, note edits, expenses) in real time.
* **FR-102.4:** The system shall render an online presence indicator showing active user avatars in the top-right corner of the workspace screen.
* **FR-102.5:** The system shall allow the Owner to toggle roles (`owner`, `editor`, `viewer`) for all co-travelers from the "Collaborators Panel".

---

## 4. Validation Rules
* **VR-102.1 (Link Expiry):** Invitation tokens must expire exactly 7 days after creation.
* **VR-102.2 (Role Privileges):** 
  - `owner`: Full access (can delete trip, change roles, modify content).
  - `editor`: Write access (can modify itinerary, notes, expenses).
  - `viewer`: Read access (can view itinerary, notes, expenses; cannot edit or add new items).
* **VR-102.3 (Duplicate Membership):** If a user clicks an invite link for a trip they are already a member of, redirect them straight to the workspace without duplicating records in the DB.

---

## 5. Edge Cases
* **EC-102.1 (Revoked Write Permissions Mid-Session):** If an Owner changes a user's role from `editor` to `viewer` while they are typing in the workspace, the system must immediately close their WebSocket write channel, display a toast notification: "Your access has been changed to Read-Only", and disable input forms without requiring a page refresh.
* **EC-102.2 (Invalid Token Link):** If the invite link is malformed or expired, redirect the user to a custom 404 page: "Invitation Expired or Invalid. Request a new link from the trip owner."
* **EC-102.3 (Owner Self-Demotion):** Block the owner from demoting themselves or leaving the trip unless they first transfer ownership to another member.

---

## 6. Dependencies
* **Upstream Dependencies:** FE-101 (Trip Creator & Planner).
* **Downstream Dependencies:** FE-201 (Itinerary Builder), FE-203 (Shared Notes), FE-401 (Expense Tracker), FE-502 (Notification System).

---

## 7. API Requirements
All endpoints require authentication: `Authorization: Bearer <JWT_TOKEN>`.

### 7.1 POST `/api/trips/:tripId/invite`
* **Response (200 OK):**
  ```json
  {
    "invite_url": "https://globetrotter.travel/trips/join/abc123xyz_token",
    "expires_at": "2026-06-11T21:45:53Z"
  }
  ```

### 7.2 POST `/api/trips/join/:token`
* **Response (200 OK):**
  ```json
  {
    "tripId": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    "role": "editor",
    "message": "Successfully joined Paris Summer Getaway"
  }
  ```

### 7.3 PATCH `/api/trips/:tripId/members/:memberId`
* **Request Body:**
  ```json
  {
    "role": "viewer"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "memberId": "8c5a98d3-7ccb-44e2-a1b2-c3d4e5f6a7b8",
    "new_role": "viewer"
  }
  ```

---

## 8. Database Impact
Updates the `trip_members` join table.

### Schema Changes
* Inserts dynamic mappings of `user_id` and `trip_id` with associated roles (`owner`, `editor`, `viewer`).
* Indices on `(trip_id, user_id)` combination for rapid permission checks during API requests.

---

## 9. UI Components
* **Share Modal:** Triggered by "Share Link" button, displaying the copyable link and active collaborator lists.
* **Collaborators Panel:** Admin panel for Owners listing all members with roles, dropdown menus to change permissions, and a "Kick" button.
* **Presence Header bar:** Rows of round user avatar icons with green "Online" dots representing concurrent active WebSocket connections.

---

## 10. Security Requirements
* **SEC-102.1:** WebSocket authorization handshake must validate the JWT token in headers or initial protocol payloads. Discard connections instantly if authentication fails.
* **SEC-102.2:** Verify that the user executing any write operations (e.g. POST, PUT, DELETE) on a trip matches a record in `trip_members` having a role of `owner` or `editor`.
* **SEC-102.3:** Limit invite generation rates (rate-limit: maximum 5 invite tokens generated per hour per trip) to prevent URL spamming.

---

## 11. Acceptance Criteria
* **AC-102.1:** Invitation link contains a secure cryptographic hash that cannot be guessed or brute-forced.
* **AC-102.2:** Clicking an expired link displays an clean expired error state instead of database/server query crashes.
* **AC-102.3:** Multiple browser tabs open on the same trip workspace immediately render online avatars in the header upon connection.
* **AC-102.4:** A demoted user is blocked from editing details on the UI and database levels immediately.

---

## 12. Definition of Done (DoD)
1. WebSocket synchronization protocol tested under mock network latency (200ms delay) to confirm updates broadcast to all clients.
2. API authorization middleware is fully tested, blocking non-members from reading or writing to trip endpoints.
3. Unit tests cover link generation token expiry calculations.
4. Security checklist passed (handshake auth validation active, CORS rules restricted to client domains).
