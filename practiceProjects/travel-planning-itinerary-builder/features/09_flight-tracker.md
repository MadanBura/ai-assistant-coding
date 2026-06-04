# Feature Specification: Commercial Flight Tracker
**Feature ID:** FE-501  
**Priority:** 9 (Logistics Integration)

---

## 1. Purpose
Tracks commercial flights by flight code. Users register flight codes to receive status metrics (gate assignments, delays, schedule shifts) and automatically add the flights as activity blocks on their itineraries.

---

## 2. User Stories
* **US-501.1 (Register Flight):** As a traveler, I want to input my flight code (e.g. LH430, UA101), so that the system tracks my flight status.
* **US-501.2 (View Status):** As a traveler, I want to view live departure/arrival times, terminal details, and delays, so that I can manage my travel day.
* **US-501.3 (Itinerary Sync):** As a traveler, I want my verified flights to automatically sync and lock on my trip timeline, so that my itinerary is accurate.

---

## 3. Functional Requirements
* **FR-501.1:** The system shall validate user-entered flight codes against official aviation format schemas.
* **FR-501.2:** The system shall query live flight tracking feeds (e.g. AeroDataBox/FlightStats) to retrieve terminal numbers, gate details, scheduled times, and actual estimated times.
* **FR-501.3:** The system shall inject verified flights as locked activity items in the database table (`itinerary_items`) labeled with category `'flight'`.
* **FR-501.4:** The system shall display tracking widgets on flight cards showing:
  - Visual status indicator (Scheduled, Delayed, Active, Landed, Cancelled)
  - Estimated Departure and Arrival times
  - Gate and Terminal alerts
* **FR-501.5:** The system shall trigger updates on the itinerary timeline when flight times shift.

---

## 4. Validation Rules
* **VR-501.1 (Flight Code formats):** Input code strings must match standard IATA (2 letter code + 3-4 digit number, e.g. `LH430`) or ICAO (3 letter code + 3-4 digit number, e.g. `DLH430`) patterns.
* **VR-501.2 (Access Permission):** Only users with role `owner` or `editor` can register flight details to a trip.

---

## 5. Edge Cases
* **EC-501.1 (Far-Future Flight):** If a flight code is valid but scheduled >72 hours away (where live gate data is not yet compiled by airports), assign the flight tracking status to `STANDBY`. Run queries daily until 72 hours out, then switch status to `ACTIVE` and query every 15 minutes.
* **EC-501.2 (Time shift conflicts):** If a flight is delayed and its new time overlaps with manual activities (like sightseeing bookings), update the flight card, display a warning icon on the overlapping activity cards, and alert the user.
* **EC-501.3 (Flight Cancellation):** If a flight is cancelled by the airline, trigger a critical red warning banner on the workspace, change the flight card status to Cancelled, but do not delete the block (preserving history and travel context).

---

## 6. Dependencies
* **Upstream Dependencies:** FE-101 (Trip Planner), FE-201 (Itinerary Builder).
* **Downstream Dependencies:** FE-502 (Notification System).

---

## 7. API Requirements
Requires auth headers: `Authorization: Bearer <JWT_TOKEN>`.

### 7.1 POST `/api/trips/:tripId/flights`
* **Request Body:**
  ```json
  {
    "flight_code": "UA101",
    "departure_date": "2026-07-10"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "itemId": "f4b07384-d113-4956-a511-2d480574719f",
    "airline": "United Airlines",
    "flight_number": "101",
    "departure": {
      "airport": "EWR",
      "terminal": "C",
      "gate": "C120",
      "scheduled_time": "2026-07-10T09:00:00Z"
    },
    "arrival": {
      "airport": "CDG",
      "terminal": "2E",
      "gate": "K43",
      "scheduled_time": "2026-07-10T21:30:00Z"
    },
    "status": "Scheduled"
  }
  ```

### 7.2 GET `/api/trips/:tripId/flights/:itemId/status`
* **Response (200 OK):**
  ```json
  {
    "itemId": "f4b07384-d113-4956-a511-2d480574719f",
    "status": "Delayed",
    "estimated_departure_time": "2026-07-10T09:45:00Z",
    "delay_minutes": 45
  }
  ```

---

## 8. Database Impact
Updates `itinerary_items`.

### Schema Requirements
* Inserts flight cards into `itinerary_items` with specific JSON fields containing: `departure_terminal`, `departure_gate`, `arrival_terminal`, `arrival_gate`, and `flight_status`.
* Creates a background worker job entry in the backend db to query status endpoints regularly.

---

## 9. UI Components
* **Flight Add Input:** Input field with auto-capitalization in the "Add Activity" dialog.
* **Flight Activity Card:** Custom styled card showing airline logo, flight number, airport codes (e.g. EWR -> CDG), delay flags, and terminal details.
* **Alert Badge:** Colored visual indicators: Grey (Scheduled), Green (On Time/Active), Yellow (Delayed), Red (Cancelled).

---

## 10. Security Requirements
* **SEC-501.1 (Masking credentials):** Secure flight tracking provider API credentials behind server configurations.
* **SEC-501.2 (Rate Limits):** Rate limit client checks on status requests to a maximum of 5 manual checks per user per hour to prevent partner API bill spikes.

---

## 11. Acceptance Criteria
* **AC-501.1:** Invalid flight codes (e.g. `ABC1`) fail local regex matches and block submission.
* **AC-501.2:** Valid flight code submissions automatically inject arrival/departure blocks into correct itinerary date columns.
* **AC-501.3:** Delay warnings appear on the UI within 15 minutes of the partner API updating.

---

## 12. Definition of Done (DoD)
1. Regex format validators covered with complete unit test cases.
2. Background worker sync logic simulated and validated using mock airline endpoints.
3. Overlap warning visuals verified under layout stress testing.
