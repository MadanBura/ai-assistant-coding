# Feature Detail: Interactive Map Discovery

## Feature ID: FEAT-302

---

## 1. Purpose
Integrate interactive geocoded mapping to let buyers dynamically locate properties within specific geographical boundary boxes, draw custom search shapes, and view cluster pins.

---

## 2. User Stories
* **US-302-1 (Spatial Viewport Fetch):** As a Buyer, I want to view search results plotted as markers on an interactive map and explore properties by zooming, panning, or drawing custom boundaries.
  * *Dependency:* FEAT-301 (Keyword and Filtered Search).
  * *Edge Case:* Highly dense area has 500+ properties, causing map lag.
  * *Resolution:* Implement map marker clustering (Supercluster) at lower zoom levels, showing a single numbered bubble that splits as the user zooms in.

---

## 3. Functional Requirements
1. **FR-302-1 (Geospatial Render):** The system must load a map canvas (Mapbox GL or Leaflet) centered on the user's geolocated position or a defaulted search city.
2. **FR-302-2 (Bounding Box Query):** The map component must track the viewport bounding box (North-East, South-West coordinates) and fetch matching property coordinates from the backend whenever the map pan/zoom completes.
3. **FR-302-3 (Interactive Pin Popups):** Clicking a map pin must open a popup displaying a small thumbnail of the property, its price, address, and a link to the full detail page.
4. **FR-302-4 (Draw Polygon Search):** The interface must provide a "Draw Shape" tool allowing buyers to outline custom polygon boundaries on the map to filter property locations.

---

## 4. Validation Rules
* **Bounding Box Format:** The query parameter must match format `bbox=minLng,minLat,maxLng,maxLat` where all values are decimals.
  * Latitude must range [-90.0, 90.0].
  * Longitude must range [-180.0, 180.0].
* **Polygon Vertices:** Custom polygon drawings must contain a minimum of 3 vertices and a maximum of 20 vertices, forming a closed loop (first and last vertex must be identical).

---

## 5. Edge Cases
* **Edge Case 1: Fetching Massive Pin Quantities**
  * *Scenario:* User zooms out to view an entire continent containing 50,000+ listings.
  * *Resolution:* Force a minimum zoom level limit for API coordinates fetching. If the zoom level is below a threshold (e.g. zoom level 10), disable individual pins and return only aggregate count grids or require the user to narrow search.
* **Edge Case 2: Zero Pin Viewport**
  * *Scenario:* User pans the map into the middle of the ocean or a remote region with zero listings.
  * *Resolution:* Display a floating banner overlay on the map canvas stating: "No listings found in this area. Zoom out or pan back."

---

## 6. Dependencies
* Mapbox GL JS library or Leaflet open-source mapping engine.
* PostGIS extension enabled in PostgreSQL database for geospatial functions.

---

## 7. API Requirements

### Fetch Map Properties
* **Method & Route:** `GET /api/properties/map`
* **Query Parameters:**
  * `bbox`: `-122.3488,47.5951,-122.3082,47.6214` (minLng, minLat, maxLng, maxLat)
  * `polygon`: `-122.34,47.60;-122.33,47.61;-122.32,47.60;-122.34,47.60` (optional semi-colon separated coordinates list)
* **Response `200 OK`:**
```json
{
  "status": "success",
  "points": [
    {
      "id": "prop_8820391",
      "price": 450000.00,
      "latitude": 47.6062,
      "longitude": -122.3321,
      "category": "residential"
    }
  ]
}
```

---

## 8. Database Impact
* **Table:** `properties`
  * Relies on spatial datatypes `geography(Point, 4326)` or `geometry(Point, 4326)` for coordinates instead of standard decimals.
* **Indexes:**
  * Spatial index: `CREATE INDEX idx_properties_coords ON properties USING gist(coordinates);` (vital for fast spatial bounding queries).

---

## 9. UI Components
* **Map Container:** Responsive element styled to occupy 50% screen width on desktop, 100% height on mobile.
* **Floating Draw Actions Panel:** Floating buttons in the upper-right corner of the map canvas for "Draw Circle", "Draw Polygon", "Clear Boundaries".
* **Cluster Marker:** Styled circular element displaying counts of clustered pins with varying sizes and color hues based on count density (e.g., green for <10, orange for 10-100, red for 100+).

---

## 10. Security Requirements
* Restrict API keys to prevent unauthorized domain usage through HTTP referrer restrictions.
* Protect against spatial query overload (DoS) by enforcing maximum polygon area calculations prior to running database operations.

---

## 11. Acceptance Criteria
* **AC-302-1:**
  * *Given* the map displays active properties,
  * *When* the buyer zooms in to a specific neighborhood,
  * *Then* the clustered pins separate into individual property pins.
* **AC-302-2:**
  * *Given* the buyer draws a custom polygon boundary on the map canvas,
  * *When* they complete the drawing,
  * *Then* the listing sidebar immediately reloads to show only properties whose coordinates fall inside that polygon boundary.

---

## 12. Definition of Done
* PostGIS geospatial query integrations verified for accuracy.
* Map loading speeds and zoom clustering behaviors tested under simulated 2G mobile connections.
* Multi-touch gestures (zoom, pan, rotate) working correctly on mobile Safari and Chrome.
