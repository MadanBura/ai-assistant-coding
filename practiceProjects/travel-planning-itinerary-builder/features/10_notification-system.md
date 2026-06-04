# Feature Specification: Notification System
**Feature ID:** FE-502  
**Priority:** 10 (System Notifications & Engagement)

---

## 1. Purpose
Provides real-time notifications to users. System monitors flight status alterations, budget ceiling metrics, and collaborator itinerary edits, sending immediate email notifications or push updates to keep everyone informed.

---

## 2. User Stories
* **US-502.1 (Flight Alerts):** As a traveler, I want to receive push alerts when my flight is delayed, gate changes, or cancellation events occur, so that I can react.
* **US-502.2 (Budget Warning):** As a budget-conscious traveler, I want to get an alert when total actual spending crosses 90% of our planned limit, so that we control our budget.
* **US-502.3 (Collaborator Edits):** As a group planner, I want to get notified when another member modifies our shared itinerary, so that I stay up to date.
* **US-502.4 (Channel Preference):** As a user, I want to toggle my alert settings between email and push, so that I choose how I want to be contacted.

---

## 3. Functional Requirements
* **FR-502.1:** The system shall display a Notification Settings Panel in the user profile interface.
* **FR-502.2:** The system shall trigger email updates (via SendGrid API) for critical events:
  - Flight cancellation or delays > 30 minutes.
  - Expense logs pushing total spending past 90% of the trip limit.
* **FR-502.3:** The system shall broadcast in-app push messages (via Firebase Cloud Messaging) to all active member devices when collaborator edits occur.
* **FR-502.4:** The system shall queue notification records in a database broker (e.g. queue worker or Redis queue) to handle high-volume event spikes gracefully.
* **FR-502.5:** The system shall store a historical list of notifications in the user profile workspace.

---

## 4. Validation Rules
* **VR-502.1 (Unique Alert Triggers):** Budget alerts must fire exactly once when total spending crosses 90% of the limit. No repeated warnings should send unless the budget limit is modified.
* **VR-502.2 (Active Handshake check):** Do not send browser push messages to a user who is currently viewing the active workspace where edits are happening; only update their timeline in real time.

---

## 5. Edge Cases
* **EC-502.1 (User Offline):** If a user is offline when an alert fires, queue the notification on the database. Deliver it instantly when they open the application (in-app toast) or via email fallback.
* **EC-502.2 (Failed Email Gateway):** If the email provider (SendGrid) is offline or throws a `5xx` error, log the failure in the database, wait 5 minutes, and retry sending up to 3 times before setting state to `FAILED`.
* **EC-502.3 (Collaborator Edit Storm):** If co-travelers make 50 rapid updates to the itinerary within 1 minute, consolidate notifications into a single batch email summary: "50 updates made in the last 10 minutes by Jane Doe" to prevent inbox spam.

---

## 6. Dependencies
* **Upstream Dependencies:** FE-102 (Collaboration Workspace), FE-401 (Budget Calculator), FE-501 (Flight Tracker).
* **Downstream Dependencies:** None.

---

## 7. API Requirements
Requires auth headers: `Authorization: Bearer <JWT_TOKEN>`.

### 7.1 GET `/api/notifications`
* **Response (200 OK):**
  ```json
  [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "trip_id": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
      "event_type": "budget_limit",
      "message": "Warning: Trip expenditures have crossed 90% of your budget.",
      "read_state": false,
      "created_at": "2026-06-04T16:24:00Z"
    }
  ]
  ```

### 7.2 PATCH `/api/notifications/:notificationId/read`
* **Response (200 OK):**
  ```json
  {
    "notificationId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "read_state": true
  }
  ```

### 7.3 PUT `/api/notifications/settings`
* **Request Body:**
  ```json
  {
    "email_alerts": true,
    "push_alerts": false,
    "notify_on_edits": true,
    "notify_on_flights": true
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "settings_saved": true
  }
  ```

---

## 8. Database Impact
Updates the `notifications` and `user_settings` tables.

### Schema Requirements
* Column mapping: `id` (UUID), `user_id` (UUID), `trip_id` (UUID), `message` (VARCHAR), `read_state` (BOOLEAN), `created_at` (TIMESTAMP).
* Index on `user_id` and `read_state` to query unread notifications efficiently.

---

## 9. UI Components
* **Notification Dropdown Bell:** Header component displaying a red indicator dot when unread notifications exist.
* **Settings Toggle panel:** Sub-screen under the profile view containing toggle sliders for email and push preferences.
* **Notification History Feed:** Chronological table listing historical messages with "Mark as Read" buttons.

---

## 10. Security Requirements
* **SEC-502.1 (Scope Validation):** Verify that the user reading or updating notifications owns them. Return `403 Forbidden` if they query another user's notifications.
* **SEC-502.2 (API Key Protection):** FCM and SendGrid authorization keys must be kept secure on server env variables.

---

## 11. Acceptance Criteria
* **AC-502.1:** Budget notifications fire exactly once when spending reaches 90% of the trip limit.
* **AC-502.2:** Real-time push notifications are delivered to active devices within 5 seconds of collaborator edits.
* **AC-502.3:** Toggling notification preferences in settings immediately applies to downstream worker tasks.

---

## 12. Definition of Done (DoD)
1. Unit tests verify email and push configuration loaders.
2. In-app WebSocket alerts tested with mock collaborator events to verify proper rendering.
3. Queue worker performance tested, ensuring database load balances during batch event storms.
