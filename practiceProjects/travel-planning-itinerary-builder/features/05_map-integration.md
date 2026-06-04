# Feature Specification: Interactive Map Integration
**Feature ID:** FE-202  
**Priority:** 5 (Geography & Visual Enhancements)

---

## 1. Purpose
Integrates map visualizations into the trip itinerary. The map plots the coordinates of planned stops (sightseeing, food, hotels, transit terminals), renders optimized navigation routes for sequential daily items, and provides driving/walking distance estimates.

---

## 2. User Stories
* **US-202.1 (Plot Activities):** As a traveler, I want to see my daily itinerary items plotted on a map, so that I can visualize the trip geography.
* **US-202.2 (Find Nearby Places):** As a planner, I want to search and geocode addresses for activities, so that they have accurate map markers.
* **US-202.3 (Route Calculation):** As a traveler, I want to see optimized routes between sequential stops on my daily plan, so that I can figure out the best travel order.
* **US-202.4 (Distance & Time Estimates):** As a traveler, I want to see how long it takes to walk/drive from one activity to the next, so that I don't run late.

---

## 3. Functional Requirements
* **FR-202.1:** The system shall render an interactive map interface (Google Maps/Mapbox API) alongside the daily itinerary checklist.
* **FR-202.2:** The system shall automatically query location geocodes (lat/long) for any itinerary items that have a street address or location name.
* **FR-202.3:** The system shall place numbered markers on the map corresponding to the day's chronological activities.
* **FR-202.4:** The system shall draw optimized routes connecting stops, matching travel order.
* **FR-202.5:** The system shall query Google Distance Matrix API (or similar) to display walking/driving times and distances between consecutive markers on the UI.

---

## 4. Validation Rules
* **VR-202.1 (Valid Coordinates):** Map markers must check that coordinates fall within standard latitude limits (-90 to +90) and longitude limits (-180 to +180).
* **VR-202.2 (Sequence Sorting):** Travel routes must only connect active itinerary markers chronologically.

---

## 5. Edge Cases
* **EC-202.1 (Geocode Lookup Failure):** If an address fails geocoding (no match found), render the activity card with a caution icon "Unresolved Location Address" and place no marker on the map. The map must center on the city center of the main destination instead of crashing.
* **EC-202.2 (Cross-Water routing):** If sequential points are separated by water bodies without bridges (e.g. crossing from mainland London to Dublin), suppress route-line rendering, set distance/time labels to "Flight or Ferry required", and place a straight dashed line connecting them.
* **EC-202.3 (API Rate Limiting):** If Google Maps API limits are exceeded, display a clean placeholder banner: "Map viewing is temporarily degraded. Standard street addresses are still available in the text list."

---

## 6. Dependencies
* **Upstream Dependencies:** FE-101 (Trip Planner), FE-201 (Itinerary Builder).
* **Downstream Dependencies:** FE-302 (Hotel Recommendations).

---

## 7. API Requirements
All geocoding and routing checks proxy through the backend trip server to manage developer credentials securely.

### 7.1 GET `/api/trips/:tripId/itinerary/map-points`
* **Response (200 OK):**
  ```json
  [
    {
      "itemId": "4a5c98d3-7ccb-44e2-a1b2-c3d4e5f6a7b9",
      "title": "Hotel Lutece",
      "category": "lodging",
      "latitude": 48.8529,
      "longitude": 2.3551,
      "sequence": 1
    },
    {
      "itemId": "5b5c98d3-7ccb-44e2-a1b2-c3d4e5f6a7c0",
      "title": "Louvre Museum",
      "category": "activity",
      "latitude": 48.8606,
      "longitude": 2.3376,
      "sequence": 2
    }
  ]
  ```

### 7.2 GET `/api/trips/:tripId/itinerary/routes?day=2026-07-11&mode=walking`
* **Response (200 OK):**
  ```json
  {
    "route_legs": [
      {
        "from_itemId": "4a5c98d3-7ccb-44e2-a1b2-c3d4e5f6a7b9",
        "to_itemId": "5b5c98d3-7ccb-44e2-a1b2-c3d4e5f6a7c0",
        "distance_meters": 1600,
        "duration_seconds": 1200,
        "polyline_points": "a~l~FjkjM..."
      }
    ]
  }
  ```

---

## 8. Database Impact
Retrieves data from `itinerary_items`.

### Schema Checks
* Must write `latitude` (DECIMAL(10, 8)) and `longitude` (DECIMAL(11, 8)) fields to `itinerary_items` table upon geocoding success.
* DB queries must avoid recalculating geocodes on every list view; cache coordinates permanently on item save/edit.

---

## 9. UI Components
* **Map Panel:** Toggleable panel on the right side of the workspace rendering the visual map layer.
* **Navigation Stats Box:** Small summary cards inserted between activity slots on the itinerary timeline showing e.g., "15 min walk (1.2 miles) via Rue de Rivoli".
* **Transit Mode Toggle:** Buttons to switch routing computations between walking, driving, and public transit.

---

## 10. Security Requirements
* **SEC-202.1 (Key Hiding):** Developer API keys for Google Maps/Mapbox must never be exposed on the frontend in cleartext configs. Proxies or signed requests must mask tokens.
* **SEC-202.2 (Access Restrictions):** Map data queries must enforce JWT authentication, matching the user's role on the target trip.

---

## 11. Acceptance Criteria
* **AC-202.1:** Custom map markers display correct labels matching activity titles.
* **AC-202.2:** Switching travel dates on the planner re-centers the map and updates markers and routes to display only the new date's events.
* **AC-202.3:** Route calculations adapt instantly when activities are reordered via drag-and-drop.
* **AC-202.4:** Clicking a map marker opens a popup panel with details (title, category, address).

---

## 12. Definition of Done (DoD)
1. Browser layout tested, verifying map canvas renders responsively without breaking side panels or timeline columns.
2. Geocoding cache logic checked (repeated location lookups must hit local cache, minimizing external API costs).
3. Mobile gestures (pinch zoom, drag panning) verified to operate smoothly on Safari Mobile.
