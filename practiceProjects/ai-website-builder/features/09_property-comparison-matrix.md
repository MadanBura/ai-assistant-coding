# Feature Detail: Property Comparison Matrix

## Feature ID: FEAT-401

---

## 1. Purpose
Enable buyers to select up to four properties and view their specs, prices, and locations side-by-side in a comparative matrix layout, highlighting key differences.

---

## 2. User Stories
* **US-401-1 (Matrix Comparison):** As a Buyer, I want to select up to four properties and compare their details (price, size, amenities, year built) in a clean comparison table to help me choose.
  * *Dependency:* FEAT-301 (Keyword and Filtered Search).
  * *Edge Case:* Buyer attempts to compare a residential studio apartment with a commercial warehouse.
  * *Resolution:* Allow comparison but show a prominent warning banner: "Comparing different property categories (Residential vs. Commercial)."

---

## 3. Functional Requirements
1. **FR-401-1 (Comparison Selection):** User can select a checkbox on property cards to queue them for comparison. A floating footer bar displays selected items.
2. **FR-401-2 (Dynamic Table Layout):** Render a table matching attributes across selected properties. Rows must list: Image, Title, Price, Location, Type, Bedrooms, Bathrooms, Square Footage, and Amenities.
3. **FR-401-3 (Highlight Differences):** Provide a toggle button in the header that highlights table rows where values are different across properties (e.g. highlights price row if prices differ).
4. **FR-401-4 (Sticky Navigation):** Table headers containing property thumbnails, titles, and price must stick to the top of the viewport when scrolling vertically.

---

## 4. Validation Rules
* **Limit Count:** Minimum 2 properties, maximum 4 properties can be compared simultaneously.
* **ID Format:** All selected IDs must be valid UUID formats matching existing database records.

---

## 5. Edge Cases
* **Edge Case 1: Active Listing Deletion/Archive**
  * *Scenario:* One of the 4 queued properties is sold or archived by its owner while the user is actively viewing the comparison screen.
  * *Resolution:* Display a gray overlay mask over the corresponding column indicating: "This listing has been sold/archived." Disable action buttons for that property.
* **Edge Case 2: Incomplete Specifications**
  * *Scenario:* Property A has `bedrooms` field defined, but Property B (Commercial) does not have it.
  * *Resolution:* Render standard empty dash placeholders (`—`) for attributes that do not apply to specific categories.

---

## 6. Dependencies
* FEAT-301 (Search & listing cards) to select properties.

---

## 7. API Requirements

### Fetch Multiple Properties for Comparison
* **Method & Route:** `GET /api/properties/compare`
* **Query Parameters:**
  * `ids`: `prop_102,prop_304,prop_506` (comma-separated UUIDs)
* **Response `200 OK`:**
```json
{
  "status": "success",
  "properties": [
    {
      "id": "prop_102",
      "title": "Modern Downtown Studio",
      "price": 280000.00,
      "category": "residential",
      "type": "sale",
      "bedrooms": 1,
      "bathrooms": 1,
      "squareFootage": 550.00,
      "amenities": ["Gym", "AC"],
      "createdAt": "2026-06-01T10:00:00Z"
    },
    {
      "id": "prop_304",
      "title": "Luxury Penthouse",
      "price": 950000.00,
      "category": "residential",
      "type": "sale",
      "bedrooms": 3,
      "bathrooms": 3.5,
      "squareFootage": 2100.00,
      "amenities": ["Gym", "Pool", "Garage", "AC"],
      "createdAt": "2026-06-03T11:00:00Z"
    }
  ]
}
```

---

## 8. Database Impact
* No new tables are required. Read-only operation querying active rows on the `properties` table.
* **Indexes:**
  * Utilizes primary key indexing for fast fetches.

---

## 9. UI Components
* **Floating Compare Bar:** Affixed to the bottom of the screen. Shows thumbnails of selected properties, a counter (e.g. `2/4 selected`), and a "Compare Now" button.
* **Comparison Matrix Grid:** Large responsive table element with sticky top headers, zebra striping, and difference toggles.

---

## 10. Security Requirements
* Enforce sanitization of the `ids` query parameter list to block SQL Injection or directory traversal patterns.
* Ensure inactive (draft or pending) listings cannot be loaded unless the user is the owner (access checks inside detail fetch).

---

## 11. Acceptance Criteria
* **AC-401-1:**
  * *Given* a buyer has selected 3 properties,
  * *When* they click "Compare Now",
  * *Then* the matrix grid renders showing matching specifications in adjacent columns.
* **AC-401-2:**
  * *Given* a user has 4 properties in the comparison bar,
  * *When* they try to check a 5th property card,
  * *Then* the UI checks block check and show warning text: "You can compare up to 4 properties."

---

## 12. Definition of Done
* Compare UI tested on smaller screen sizes, verifying horizontal scrolling behavior.
* Sticky-header CSS rules validated on evergreen browsers (Chrome, Safari, Firefox).
* API performance verified with batch ID fetching.
