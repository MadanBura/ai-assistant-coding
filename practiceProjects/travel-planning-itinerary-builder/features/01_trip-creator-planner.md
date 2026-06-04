# Feature Specification: Trip Creator & Planner
**Feature ID:** FE-101  
**Priority:** 1 (Core Foundation)

---

## 1. Purpose
Provides the foundational capability for users to register accounts, authenticate, and manage trips (Create, Read, Update, Delete). This feature initializes the central trip data model that all other features depend upon.

---

## 2. User Stories
* **US-101.1 (Register & Login):** As a new user, I want to create an account and log in securely, so that my trips are private and saved.
* **US-101.2 (Create Trip):** As a registered user, I want to create a new trip with a destination, start/end dates, and a title, so that I can begin planning.
* **US-101.3 (Update Trip):** As a trip owner, I want to modify my trip dates, title, or style, so that I can accommodate changing plans.
* **US-101.4 (Delete Trip):** As a trip owner, I want to delete a trip workspace, so that I can clean up my trip board.

---

## 3. Functional Requirements
* **FR-101.1:** The system shall expose secure registration and login endpoints implementing password hashing and JWT issuance.
* **FR-101.2:** The system shall display a Trip Creation Form prompting the user for:
  - Title (Text input, e.g. "Paris Summer Getaway")
  - Destination City/Country (Autocomplete search input)
  - Start Date & End Date (Date pickers)
  - Budget Limit (Numerical input)
  - Trip Style (Select dropdown: Backpacking, Moderate, Luxury)
* **FR-101.3:** The system shall dynamically query an image API (Unsplash/Pexels) based on the destination name to fetch and assign a default high-resolution trip banner.
* **FR-101.4:** The system shall display a dashboard listing active, upcoming, and past trips associated with the logged-in user.
* **FR-101.5:** The system shall allow the creator of a trip to modify its meta information or delete it entirely.

---

## 4. Validation Rules
* **VR-101.1 (Password Strength):** Passwords must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.
* **VR-101.2 (Chronological Dates):** The `start_date` must be equal to or greater than the current date (today), and the `end_date` must be equal to or greater than the `start_date`.
* **VR-101.3 (Trip Duration):** The difference between `end_date` and `start_date` must not exceed 90 days.
* **VR-101.4 (Required Fields):** Title and Destination are required fields on trip creation.

---

## 5. Edge Cases
* **EC-101.1 (API Cover Image Failure):** If the destination photo lookup fails due to network or rate limits, the system must bind a fallback local vector graphic (`/assets/default-cover.svg`) and complete trip creation.
* **EC-101.2 (Past Trip Dates):** If a user attempts to create a trip with a start date in the past, block submission unless the user explicitly checks a toggle "Log Past Trip" (which is useful for record-keeping).
* **EC-101.3 (Concurrently Deleted Trip):** If a user attempts to view a trip that was deleted by the owner in another session, redirect to the dashboard showing error message: "This trip is no longer available."

---

## 6. Dependencies
* **Upstream Dependencies:** None (This is the foundational feature).
* **Downstream Dependencies:** FE-102 (Collaboration), FE-201 (Itinerary), FE-401 (Budget), FE-501 (Flights), FE-502 (Notifications).

---

## 7. API Requirements
All endpoints require JWT authorization in headers: `Authorization: Bearer <JWT_TOKEN>`.

### 7.1 POST `/api/auth/register`
* **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "display_name": "Jane Doe"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "userId": "d3b07384-d113-4956-a511-2d480574719d",
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

### 7.2 POST `/api/trips`
* **Request Body:**
  ```json
  {
    "title": "Paris Summer Getaway",
    "destination": "Paris, France",
    "start_date": "2026-07-10",
    "end_date": "2026-07-20",
    "budget_limit": 5000.00,
    "currency": "USD"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "tripId": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    "cover_url": "https://images.unsplash.com/photo-..."
  }
  ```

### 7.3 GET `/api/trips`
* **Response (200 OK):**
  ```json
  [
    {
      "id": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
      "title": "Paris Summer Getaway",
      "destination": "Paris, France",
      "start_date": "2026-07-10",
      "end_date": "2026-07-20",
      "budget_limit": 5000.00,
      "cover_url": "https://images.unsplash.com/photo-...",
      "role": "owner"
    }
  ]
  ```

---

## 8. Database Impact
Updates the `users` and `trips` databases.

### Schema Changes
* Insertions in `users` upon registration.
* Insertions, Updates, and Deletions in `trips` and automatic registration of the creator in `trip_members` as `role = 'owner'`.
* SQL command on trip deletion must perform a cascade delete on child tables (`itinerary_items`, `expenses`, `notes`, `trip_members`).

---

## 9. UI Components
* **Landing Page:** Presentation screen with "Register" and "Login" options.
* **Auth Forms:** Input screens for email, password, and name.
* **Dashboard Page:** Workspace containing:
  - Header: Logo, Profile navigation, and logout button.
  - Active Grid: Cards representing individual trips with titles, dates, and cover images.
  - Floating Action Button (FAB): "Create New Trip" triggering the creation wizard modal.
* **Wizard Modal:** Multi-step modal for entering trip details.

---

## 10. Security Requirements
* **SEC-101.1:** Passwords must be hashed using `bcrypt` with a minimum cost factor of 12 before database ingestion.
* **SEC-101.2:** Session management via JWT tokens signed with a server-side secret key, set to expire in 15 minutes.
* **SEC-101.3:** Input validation on both client and server side to sanitize strings and guard against Cross-Site Scripting (XSS) and SQL injection.

---

## 11. Acceptance Criteria
* **AC-101.1:** Registration rejects weak passwords and duplicate emails, returning descriptive errors.
* **AC-101.2:** The system blocks trip creation and displays code `ERR_TRIP_DATE_01` if `end_date` is prior to `start_date`.
* **AC-101.3:** Successfully created trips are persisted to the database and correctly display on the dashboard card grid.
* **AC-101.4:** Deleting a trip workspace prompts the owner for confirmation, removes all record data, and redirects to the dashboard.

---

## 12. Definition of Done (DoD)
1. Frontend components pass cross-browser layouts (Chrome, Safari, Firefox).
2. Backend API endpoints validated with unit tests covering dates validation edge cases.
3. Database cascading rules tested, confirming child itineraries and notes are purged upon trip deletion.
4. Security checklist passed (Zero plain-text password logs, parameterized SQL queries).
