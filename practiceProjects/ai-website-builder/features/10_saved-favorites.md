# Feature Detail: Saved Favorites

## Feature ID: FEAT-402

---

## 1. Purpose
Allow buyers and renters to save property listings to a personal favorites list, toggle saves via heart icons on listing cards, and manage these selections on their dashboard.

---

## 2. User Stories
* **US-402-1 (Favorites Management):** As a Buyer, I want to save individual listings to my favorites list by clicking a heart icon so that I can review them later.
  * *Dependency:* FEAT-101 (Registration) and FEAT-201 (Property Creation).
  * *Edge Case:* Property is deleted or archived by the owner while it is in the buyer's favorites list.
  * *Resolution:* The listing is marked as "Unavailable" in the favorites folder instead of silently disappearing, allowing the user to clean it up manually.

---

## 3. Functional Requirements
1. **FR-402-1 (Heart Icon Toggle):** Add a persistent interactive heart button overlay to every property listing card (on search, map, detail pages).
2. **FR-402-2 (Favorites Collection View):** A dedicated screen under the user profile showing a responsive grid of all saved properties.
3. **FR-402-3 (Analytics Hook):** Toggling a favorite must queue a job to update total save counts in analytics dashboards.

---

## 4. Validation Rules
* **User Authentication:** Enforce valid logged-in session prior to resolving database additions or deletions.
* **Target ID:** The property ID being toggled must exist in the database and be active.

---

## 5. Edge Cases
* **Edge Case 1: Session Expiration on Click**
  * *Scenario:* User clicks the heart icon on a property card, but their session has expired.
  * *Resolution:* Catch the 401 error, present a login modal that saves the state, and auto-favorite the property once the user logs in.
* **Edge Case 2: Double-Click Rapid Toggle**
  * *Scenario:* User clicks the heart icon twice within 500ms.
  * *Resolution:* Implement client-side click debouncing (300ms) to prevent duplicate API requests and DB duplicate key errors.

---

## 6. Dependencies
* FEAT-101 (User authentication).
* FEAT-201 (Property listings schema).

---

## 7. API Requirements

### Add/Remove Favorite
* **Method & Route:** `POST /api/favorites`
* **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
* **Request Payload:**
```json
{
  "propertyId": "prop_8820391"
}
```
* **Response `200 OK` (Toggled Off):**
```json
{
  "status": "success",
  "favorited": false,
  "message": "Property removed from favorites."
}
```
* **Response `201 Created` (Toggled On):**
```json
{
  "status": "success",
  "favorited": true,
  "message": "Property added to favorites."
}
```

### Fetch Favorites List
* **Method & Route:** `GET /api/favorites`
* **Headers:** `Authorization: Bearer <JWT>`
* **Response `200 OK`:**
```json
{
  "status": "success",
  "favorites": [
    {
      "id": "fav_01293",
      "createdAt": "2026-06-04T13:00:00Z",
      "property": {
        "id": "prop_8820391",
        "title": "Modern 2-Bed Condo with City View",
        "price": 450000.00,
        "status": "published"
      }
    }
  ]
}
```

---

## 8. Database Impact
* **Table:** `favorites` (New table).
  * Fields: `id` (uuid, primary key), `user_id` (uuid, FK), `property_id` (uuid, FK), `created_at` (timestamp).
* **Constraints:**
  * Unique composite constraint on `(user_id, property_id)`.
  * Foreign keys referencing `users.id` and `properties.id` with cascades.

---

## 9. UI Components
* **Heart Icon Overlay:** Positioned top-right of property image. Outline icon for unsaved properties; Solid color-filled icon for saved properties.
* **Favorites Profile View:** Grid display within user dashboard showing all saved cards, featuring a "Delete All" button and search query filtering specifically for saved items.

---

## 10. Security Requirements
* Backend must enforce database locks or constraints to guarantee one user cannot favorite the same property multiple times.
* Prevent ID scraping: limit GET calls of `/api/favorites` to return only records belonging to the authenticated request user.

---

## 11. Acceptance Criteria
* **AC-402-1:**
  * *Given* a logged-in Buyer,
  * *When* they click an un-favorited property's heart icon,
  * *Then* the heart turns red, and the database stores the link.
* **AC-402-2:**
  * *Given* a logged-in Buyer is viewing their Saved Favorites tab,
  * *When* they click the heart on a property card,
  * *Then* the card is immediately removed from the grid with a fade-out animation.

---

## 12. Definition of Done
* Client-side debouncer written and validated.
* API methods unit-tested with authenticated and unauthenticated contexts.
* Database migration creating the `favorites` table with relational keys run and verified.
