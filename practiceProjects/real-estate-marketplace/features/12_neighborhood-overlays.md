# Feature Specification: Neighborhood Data Overlays

## 1. Feature Info
* **Feature ID:** `FT-3.2`
* **Priority:** 12 (Advanced Mapping Layer)
* **Title:** Neighborhood Data Overlays

---

## 2. Purpose
Enhances the interactive map by overlays containing public transport lines, local school districts, park boundaries, and walk scores. This data maps directly onto the search canvas to help buyers evaluate neighborhood quality.

---

## 3. User Stories
* **US-3.3:** As a Buyer, I want to toggle neighborhood overlay layers on the map so that I can see the proximity of school districts, parks, and public transit options to listings.
* **US-3.4:** As a Buyer, I want to view localized rankings (e.g. school grades) so that I can evaluate the family-friendliness of an area.

---

## 4. Functional Requirements

### FR-302.1: GeoJSON Layer Parser
* **Description:** The system must request geo-spatial boundaries (GeoJSON) from the backend based on map coordinate envelopes and parse polygons representing school districts and park limits.

### FR-302.2: Overlay Selector Control
* **Description:** Add a floating overlay control panel to toggle map layers on/off.
  * *School Layer:* Renders school pins with academic grading badges (A, B, C).
  * *Transit Layer:* Renders subway lines and train icons.
  * *Park Layer:* Shallows green polygons over local park boundaries.

### FR-302.3: Point-in-Polygon Metric Resolver
* **Description:** Calculate distance metrics from any selected property pin to the nearest school or transit node.
* **Calculation output:** Distance in miles, walk time estimation.

---

## 5. Validation Rules
* **VAL-302.1 (Viewport Alignment):** Prevent overlay queries if the map viewport width is greater than 50 miles, as large queries can cause browser rendering lags. Disable layer controls and display: "Zoom in to view overlay details."

---

## 6. Edge Cases
* **Edge Case 1: Dataset Offline Outage:** The third-party school or transit database API suffers an outage.
  * *Resolution:* Catch the connection exception, show a toast ("School overlay data temporarily offline"), and gray out the respective layer toggle button.
* **Edge Case 2: Multi-District Boundary Overlaps:** A property falls on a boundary line between two school zones.
  * *Resolution:* The system must return both school zone mappings in the property details sidebar, detailing exact distances to both school addresses.

---

## 7. Dependencies
* **Upstream:** `FT-3.1` (Requires base map canvas setup).
* **Downstream:** None.

---

## 8. API Requirements

### Fetch Viewport GeoJSON Overlays
* **Endpoint:** `GET /api/v1/neighborhoods/overlays`
* **Query Parameters:** `latMin`, `latMax`, `lngMin`, `lngMax`, `layerType` (`Schools` | `Transit` | `Parks`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "name": "Lincoln Elementary School",
          "rating": "A",
          "type": "School"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-122.4201, 37.7738]
        }
      }
    ]
  }
}
```

---

## 9. Database Impact
* **Target Tables:** `SCHOOL_NODE`, `TRANSIT_NODE` (Static reference tables with geographical coordinates).
* **Spatial query logic:**
```sql
SELECT name, rating, coordinates FROM school_nodes
WHERE ST_DWithin(coordinates, ST_SetSRID(ST_Point(lng, lat), 4326), 0.05);
```
* **Indexes:** Spatial GIST indexes on coordinate columns in reference tables.

---

## 10. UI Components
* **Floating Layer Panel:** Floating control panel in the top-right corner of the map with checkboxes for Schools, Transit, and Parks.
* **Badged Map Pins:** Small, color-coded map markers:
  * Blue markers with book icons for schools (with letter grade badges).
  * Red markers with train icons for transit.
  * Translucent green fills for park polygons.

---

## 11. Security Requirements
* **SEC-302.1 (Rate Limiting Overlays):** Dynamic GeoJSON queries require high server throughput. Enforce rate-limits on `/api/v1/neighborhoods/overlays` to 10 queries per minute per active session to prevent automated scraping.

---

## 12. Acceptance Criteria
* **AC-303:** Map overlays toggle on/off without reloading the main search pins.
* **AC-304:** School pins display correct ratings on map popups.

---

## 13. Definition of Done
* [ ] Reference databases loaded with local school and transit datasets.
* [ ] GeoJSON queries optimized to load under 250ms on maps zooming level 12 to 15.
* [ ] Layer toggle controls verified for responsive usability.
