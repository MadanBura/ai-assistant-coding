# Feature Specification: Smart Hotel Recommendations
**Feature ID:** FE-302  
**Priority:** 8 (Contextual Integrations)

---

## 1. Purpose
Provides tailored lodging recommendations to users based on their active trip workspace coordinates. The feature queries hotel provider feeds near planned activities and filters by price, traveler ratings, and budget limits.

---

## 2. User Stories
* **US-302.1 (View Recommendations):** As a planner, I want to see a curated feed of lodging options close to our itinerary stops, so that we can organize our stay.
* **US-302.2 (Filter Hotels):** As a traveler, I want to filter lodging by price tier, review scores, and amenities, so that we find stays matching our style.
* **US-302.3 (Affiliate Booking):** As a user, I want to click a hotel recommendation and get redirected to the booking platform, so that I can secure reservation tickets.

---

## 3. Functional Requirements
* **FR-302.1:** The system shall automatically aggregate geocodes of planned itinerary items to locate the geographical centroid of the trip.
* **FR-302.2:** The system shall fetch real-time lodging lists within a default 5-mile radius of the trip centroid by querying partner API adapters (Amadeus/TripAdvisor/Booking.com).
* **FR-302.3:** The system shall match recommendations to the trip's budget category (e.g. Backpacking = Hostels/Budgets, Luxury = 5-star Hotels).
* **FR-302.4:** The system shall render lodging lists containing title, price per night, rating score, distance to nearest itinerary stop, and referral redirection link.
* **FR-302.5:** The system shall embed the platform's affiliate tracking codes into booking redirect actions.

---

## 4. Validation Rules
* **VR-302.1 (Centroid computation):** Trip coordinate lists must contain at least one valid geocoded activity before calculating recommendation queries. Fall back to destination coordinates if no activities exist.
* **VR-302.2 (Affiliate link checks):** All outbound links must append query arguments validating partner tracking contracts (`?aff=globetrotter&subid=trip_id`).

---

## 5. Edge Cases
* **EC-302.1 (Zero local matches):** If no hotels exist within the default 5-mile boundary (e.g., remote adventure treks), the system must expand query parameters to 15 miles and notify the user: "No hotels found within 5 miles. Showing properties within 15 miles."
* **EC-302.2 (Partner Feed Timeout):** If the external hotel search API does not respond within 3.0 seconds, fall back to displaying curated static sponsor partners or standard search guides rather than crashing the page panels.

---

## 6. Dependencies
* **Upstream Dependencies:** FE-101 (Trip Planner), FE-201 (Itinerary Builder), FE-202 (Map Integration).
* **Downstream Dependencies:** None.

---

## 7. API Requirements
Requires auth headers: `Authorization: Bearer <JWT_TOKEN>`.

### 7.1 GET `/api/trips/:tripId/lodging-recommendations`
* **Query Parameters:**
  - `radius`: `5` (miles)
  - `limit`: `10`
* **Response (200 OK):**
  ```json
  [
    {
      "hotel_name": "Hotel Lutece",
      "address": "65 Rue Saint-Louis en l'Île, 75004 Paris",
      "price_per_night": 145.00,
      "currency": "EUR",
      "star_rating": 4.0,
      "distance_miles": 0.4,
      "booking_url": "https://booking.com/partner-redirect?aff=globetrotter..."
    }
  ]
  ```

---

## 8. Database Impact
No permanent database schema updates are needed for recommendations because data is fetched dynamically.
However:
* Read queries from `itinerary_items` are run to retrieve geo coordinates.
* Affiliate click events can optionally write to a `metrics_clicks` logging table to track monetization performance.

---

## 9. UI Components
* **Lodging Recommendations Feed Panel:** Sub-panel or sidebar layout under the "Itinerary Dashboard" showing hotel listings.
* **Hotel detail card:** Visual card containing pricing chips, star rating elements, and "View Deal" redirect buttons.
* **Location tooltip:** Visual indicators highlighting recommendation pins on the Map interface.

---

## 10. Security Requirements
* **SEC-302.1 (Proxy credentials):** Do not call hotel API keys directly from the client. All provider calls must run through the backend API gateway to prevent credential hijacking.
* **SEC-302.2 (Input parameters):** Sanitize lat/long input float numbers to prevent coordinate distortion attacks or parameter injection.

---

## 11. Acceptance Criteria
* **AC-302.1:** Recommendations list updates matching the travel style selected during trip creation.
* **AC-302.2:** Details specify exact distance in miles from the centroid of planned activities.
* **AC-302.3:** Outbound links open in a new tab/window and correctly carry the required affiliate track IDs.

---

## 12. Definition of Done (DoD)
1. Integrations tested using provider API sandbox environments.
2. Latency metrics checked, ensuring recommendation overlays load without blocking core itinerary interaction elements.
3. Affiliation link formats validated by testing redirects.
