# Feature Specification: Interactive Map Interface

## 1. Feature Info
* **Feature ID:** `FT-3.1`
* **Priority:** 4 (Core UX Element)
* **Title:** Interactive Map Interface

---

## 2. Purpose
Provides a split-screen mapping interface that renders property search results geographically. Moving the map triggers search queries based on the viewport, clustering dense listings and offering area drawing tools to target specific locations.

---

## 3. User Stories
* **US-3.1:** As a Buyer, I want to view listings on an interactive map so that I can see the visual distribution of properties across different areas.
* **US-3.2:** As a Buyer, I want to draw custom boundaries (polygons) on the map so that I can restrict my property search to a specific set of streets.

---

## 4. Functional Requirements

### FR-301.1: Bounding Box Queries
* **Description:** The frontend map component must listen for map drag and zoom events (`moveend`, `zoomend`), extract the coordinate envelope corners, and query the backend listing endpoint.
* **Payload Variables:** `latMin` (Float), `latMax` (Float), `lngMin` (Float), `lngMax` (Float).

### FR-301.2: Marker Clustering
* **Description:** Dense groupings of property markers must group into clusters using standard algorithms (e.g., Supercluster). Clicking a cluster must zoom the map to fit the clustered listings' bounds.

### FR-301.3: Drawing Tool Overlay
* **Description:** Integrates a polygon draw interface. When active, it intercepts click-and-drag behaviors to record an array of coordinate vertices.
* **Input:** Array of coordinates representing the polygon bounds.
* **Output:** Backend queries filtered by the polygon bounding shape.

---

## 5. Validation Rules
* **VAL-301.1 (Valid Coordinates):** Bounding coordinates must comply with GPS restrictions: Latitudes must remain between `-90.0` and `90.0`; Longitudes must remain between `-180.0` and `180.0`.
* **VAL-301.2 (Polygon Closure):** Custom polygon coordinates must form a closed loop (first coordinate must match last coordinate).

---

## 6. Edge Cases
* **Edge Case 1: Global View Zoom Out:** If the user zooms out to view the entire country or globe, queries could fetch hundreds of thousands of listings, overwhelming browser rendering.
  * *Resolution:* If zoom level falls below threshold (e.g., zoom < 10), disable individual pin rendering and enforce city/state aggregate circles, or require the user to zoom in to view listings.
* **Edge Case 2: Zero Location Result:** If geocoding fails to resolve an address input, center the map on the country/city default fallback center coordinates with an error toast ("Address not found on map").

---

## 7. Dependencies
* **Upstream:** `FT-2.1` (Properties data coordinate fields), `FT-2.2` (API structure compatibility).
* **Downstream:** `FT-3.2` (Overlays mapping layer), `FT-4.1` (Comparison selections).

---

## 8. API Requirements

### Bounding Box Search
* **Endpoint:** `GET /api/v1/properties`
* **Query Parameters:**
  * `latMin` (Float, required if map active)
  * `latMax` (Float, required if map active)
  * `lngMin` (Float, required if map active)
  * `lngMax` (Float, required if map active)
  * `polygon` (String, comma-separated list of coordinates, optional)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 2,
    "properties": [
      {
        "propertyId": "prop_9910a",
        "price": 620000,
        "coordinates": { "lat": 37.7749, "lng": -122.4194 }
      }
    ]
  }
}
```

---

## 9. Database Impact
* **Target Table:** `PROPERTY`.
* **Spatial Query Logic:**
```sql
SELECT id, title, price FROM properties
WHERE ST_Within(location_point, ST_MakeEnvelope(lngMin, latMin, lngMax, latMax, 4326));
```
* **Index:** PostGIS Spatial Index on the property's location column (`GIST(location_point)`).

---

## 10. UI Components
* **Map Canvas:** 50% split width on desktop, 100% full screen with toggle drawer switch on mobile devices.
* **Polygon Drawing Controls:** Segmented float menu buttons for "Draw Shape", "Clear Shape", and "Locate Me".
* **Mini Detail Carousel popup:** Hovering over a pin renders a card displaying listing thumbnail image, price tag, beds, baths, and direct contact buttons.

---

## 11. Security Requirements
* **SEC-301.1 (Coordinate Obfuscation):** If a user is not authenticated or the listing's owner/agent chooses to restrict the precise address, the API must return coordinates randomized slightly (within a 200-meter radius offset). The front-end map must draw a circular coverage radius instead of a precise pin.

---

## 12. Acceptance Criteria
* **AC-301:** Dragging the map viewport updates the sidebar listing cards.
* **AC-302:** Dense marker clusters merge/expand correctly upon map zoom adjustment.

---

## 13. Definition of Done
* [ ] Third-party Map SDK client key configured.
* [ ] Database PostGIS spatial envelope query tested.
* [ ] Map component tested on mobile safari and chrome browsers.
