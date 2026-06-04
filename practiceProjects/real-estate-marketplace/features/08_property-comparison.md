# Feature Specification: Property Comparison Matrix

## 1. Feature Info
* **Feature ID:** `FT-4.1`
* **Priority:** 8 (Decision Support Tool)
* **Title:** Property Comparison Matrix

---

## 2. Purpose
Provides a side-by-side spec comparison table for up to 4 selected properties. The comparison matrix maps physical dimensions, attributes, pricing, amenities, and location scores to help buyers make informed decisions.

---

## 3. User Stories
* **US-4.1:** As a Buyer, I want to add multiple properties to a comparison basket so that I can evaluate their details side-by-side.
* **US-4.2:** As a Buyer, I want to highlight the differences between compared properties so that I can identify unique features or pricing values quickly.

---

## 4. Functional Requirements

### FR-401.1: Comparison Basket Management
* **Description:** The system must manage a client-side comparison basket (stored in HTML5 LocalStorage). Users can add or remove properties from search cards or detail pages.
* **Limit:** Maximum of 4 properties.

### FR-401.2: Dynamic Comparison Table Generator
* **Description:** Given an array of up to 4 property IDs, the system fetches full details and renders a column-based grid aligning specifications horizontally.
* **Grid Row Mappings:** Price, Price per Sqft, Property Type, Beds, Baths, Sqft, Year Built, HOA Fees, Coordinates, Parking, and Amenities.

### FR-401.3: Attribute Differencing Engine
* **Description:** UI features:
  * *Highlight Differences:* Add CSS contrast classes to cells where values vary across the compared items.
  * *Hide Identical:* Collapses rows where all compared listings share the same values (e.g. all are "Residential Condos").

---

## 5. Validation Rules
* **VAL-401.1 (Basket Count Boundary):** Adding a property when the basket contains 4 items must block insertion, generating an error toast.
* **VAL-401.2 (Active State Exclusivity):** Only listings with status `APPROVED` can be compared. If a compared property is sold or removed, clean it from the basket.

---

## 6. Edge Cases
* **Edge Case 1: Incompatible Property Typologies:** Comparing a commercial warehouse with a residential studio. The grid layout must still load:
  * Rows that are incompatible (like bedrooms count) must display "N/A" for the warehouse.
  * Render a warning banner: "You are comparing residential and commercial properties; some attributes may not align."
* **Edge Case 2: Complete Basket Cleansing:** The user clicks "Clear All" or deletes the final listing. The comparison screen must display an empty state prompting: "No properties selected. Return to search to add properties."

---

## 7. Dependencies
* **Upstream:** `FT-2.1` (Requires listing specification structure), `FT-2.2` (Search integration).
* **Downstream:** None.

---

## 8. API Requirements

### Fetch Multi-Property Details for Comparison
* **Endpoint:** `GET /api/v1/properties/compare`
* **Query Parameters:**
  * `ids` (String, comma-separated array of property IDs, required)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "propertyId": "prop_9910a",
      "title": "Uptown Condo",
      "price": 450000,
      "beds": 2,
      "baths": 2,
      "sqft": 1100,
      "hoa": 300,
      "amenities": ["Parking", "Pool"]
    },
    {
      "propertyId": "prop_9910b",
      "title": "Suburban Condo",
      "price": 380000,
      "beds": 2,
      "baths": 1.5,
      "sqft": 1050,
      "hoa": 150,
      "amenities": ["Parking"]
    }
  ]
}
```

---

## 9. Database Impact
* **Target Table:** `PROPERTY`.
* **Query Performance:** Retrieve data using an IN clause targeting primary keys.
```sql
SELECT * FROM properties WHERE id IN ('prop_9910a', 'prop_9910b') AND status = 'APPROVED';
```
* **Indexes:** Primary key index on `id` handles query optimization.

---

## 10. UI Components
* **Floating Comparison Bar:** A sticky bottom-drawer overlay that slides up when properties are in the basket, showing thumbnails of selected properties and a "Compare Now" button.
* **Comparison Table Grid:** Column headers showing listing cards (photo, price, title) with an overlay delete button, followed by comparative attribute rows.
* **Highlight Toggle Switches:** Segments at the top of the grid to toggle "Highlight Differences" or "Hide Identical".

---

## 11. Security Requirements
* **SEC-401.1 (Guest Authorization):** Ensure this feature is accessible to unauthenticated visitors. The comparison basket must run entirely inside local storage without requiring API tokens until the user saves the list to their profile dashboard.

---

## 12. Acceptance Criteria
* **AC-401:** Verify that row attributes align correctly when comparing properties of different types.
* **AC-402:** Confirm adding a 5th property triggers the validation toast alert.

---

## 13. Definition of Done
* [ ] Frontend local storage comparison state manager implemented and covered by unit tests.
* [ ] Multi-property detail fetch API tested.
* [ ] UI responsive grid tested on mobile and tablet viewport widths.
