# Feature Specification: Advanced Search & Filtering

## 1. Feature Info
* **Feature ID:** `FT-2.2`
* **Priority:** 3 (Core Discovery Engine)
* **Title:** Advanced Search & Filtering

---

## 2. Purpose
Enable buyers to discover residential or commercial listings matching their exact criteria. The search engine processes query inputs including text terms (cities, neighborhoods, ZIP codes), numeric range values (price, square footage, year built, rooms), and tag sets (amenities) using high-performance filtering.

---

## 3. User Stories
* **US-2.3:** As a Buyer, I want to filter listings by property features (e.g., budget range, bedroom count, property type, amenities) so that I only see homes matching my preferences.
* **US-2.4:** As a Buyer, I want to filter listings based on whether they were posted directly by the Owner or by a verified Agent so that I can manage my transaction fees.

---

## 4. Functional Requirements

### FR-202.1: Range-based Query Processing
* **Description:** Filter arrays must evaluate numeric ranges for price and area (sqft) utilizing dynamic min/max limits.
* **Filter Inputs:** `minPrice`, `maxPrice`, `minSqft`, `maxSqft`, `beds`, `baths`.

### FR-202.2: Full-Text Term Search
* **Description:** Search text input must match against property title, description, city, state, zipcode, and neighborhood names.
* **Technology recommendation:** PostgreSQL TSVector full-text search indexing or Elasticsearch mapping.

### FR-202.3: Amenities Multi-Select Filter
* **Description:** Allow filtering by an array of amenity tags. The system must verify that a listing contains *all* selected amenities (AND logic matching).
* **Tags list:** `Pool`, `HVAC`, `Gym`, `Parking`, `Elevator`, `Pet Friendly`, `Furnished`.

---

## 5. Validation Rules
* **VAL-202.1 (Range Boundaries):** Validate that `minPrice <= maxPrice` and `minSqft <= maxSqft` inside query validation middleware. If violated, API must reject request with a validation warning.
* **VAL-202.2 (Sanitized Term Length):** Prevent search term query values exceeding 100 characters to block DDoS memory overflows.

---

## 6. Edge Cases
* **Edge Case 1: Zero Match Fallback:** If search criteria yield zero matches, the system must trigger a search expansion algorithm:
  1. Return matching listing count within a +5-mile geographical radius.
  2. If still zero, suggest removing the most restrictive tag (e.g. drop "Gym" tag).
* **Edge Case 2: Out of Bound Range Inputs:** If a user requests a price range of `$0 - $0`, standard fallback logic must apply to set the default values to `$1 - $100,000,000`.

---

## 7. Dependencies
* **Upstream:** `FT-2.1` (Requires populated property database).
* **Downstream:** `FT-3.1` (Map Integration relies on the same filtered payload), `FT-4.1` (Comparison matrix selects items from search).

---

## 8. API Requirements

### Search Properties
* **Endpoint:** `GET /api/v1/properties`
* **Query Parameters:**
  * `q` (String, search keywords, optional)
  * `minPrice` (Integer, optional)
  * `maxPrice` (Integer, optional)
  * `beds` (Float, optional)
  * `baths` (Float, optional)
  * `propertyType` (Enum, optional)
  * `amenities` (Comma-separated array of strings, optional)
  * `postedBy` (Enum: `Owner` | `Agent`, optional)
  * `page` (Integer, default: 1)
  * `limit` (Integer, default: 20)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalMatches": 142,
    "currentPage": 1,
    "totalPages": 8,
    "listings": [
      {
        "propertyId": "prop_e1029",
        "title": "Suburban Oasis",
        "price": 385000,
        "beds": 3,
        "baths": 2,
        "sqft": 1450,
        "postedBy": "Owner"
      }
    ]
  }
}
```

---

## 9. Database Impact
* **Target Indexes:**
  * Multi-column index on `(status, price)` in the `PROPERTY` table to prevent table scans.
  * Spatial index on location coordinates.
  * Full-text search index (GIN index on text fields).

---

## 10. UI Components
* **Dynamic Range Sliders:** Dual-handle interactive slider handles displaying values instantly.
* **Sticky Filter Bar:** Top-aligned toolbar that remains static as the user scrolls, collapsing into a slide-out overlay drawer on mobile viewports.
* **Active Filter Chips:** Horizontal pill chips displaying active parameters (e.g., `Price: <$400k` or `Beds: 3+`) with a "Close" icon that strips the parameter.

---

## 11. Security Requirements
* **SEC-202.1 (Scope Enforcement):** Public search results must only fetch listings where `status === 'APPROVED'`. Listings marked `DRAFT`, `PENDING_APPROVAL`, `REJECTED`, or `EXPIRED` must be excluded from search queries unless requested by the listing owner.
* **SEC-202.2 (SQL Injection Protection):** Force parameterized querying using an ORM or query builder (e.g. Prisma or Knex), forbidding raw concatenation of search queries.

---

## 12. Acceptance Criteria
* **AC-203:** Confirm combining filters correctly narrows down property results.
* **AC-204:** Verify searching for a term with no results triggers the geographical expansion suggestion.

---

## 13. Definition of Done
* [ ] Search indexing schema implemented in database.
* [ ] Query performance test shows responses load in less than 200ms with a database seeded with 10,000 dummy listings.
* [ ] Search query code covered by integration testing.
