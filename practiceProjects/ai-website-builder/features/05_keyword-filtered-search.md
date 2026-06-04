# Feature Detail: Keyword and Filtered Search

## Feature ID: FEAT-301

---

## 1. Purpose
Allow buyers and renters to discover properties through a high-performance search engine supporting full-text keyword queries, detailed attribute filtering, pagination, and saved search alerts.

---

## 2. User Stories
* **US-301-1 (Discovery Filtering):** As a Buyer, I want to filter properties by city, zip code, price range, bedrooms, bathrooms, and commercial/residential types so that I only see properties relevant to my criteria.
  * *Dependency:* FEAT-201 (Property Creation) and FEAT-202 (Lifecycle).
  * *Edge Case:* A search yields zero results.
  * *Resolution:* The UI displays a search fallback page suggesting neighboring locations and renders a prominent "Save Search & Notify Me" button.
* **US-301-2 (Saved Search Subscriptions):** As a Buyer, I want to save my search configurations and subscribe to email alerts for new matching listings.
  * *Dependency:* US-301-1.
  * *Edge Case:* Email automation triggers too frequently, causing users to mark them as spam.
  * *Resolution:* The saved search dialog defaults to a "Daily Digest" email update rather than real-time notifications.

---

## 3. Functional Requirements
1. **FR-301-1 (Keyword Search Engine):** The system must search titles, descriptions, cities, and zip codes using full-text search index queries.
2. **FR-301-2 (Dynamic Filter Processing):** The backend must construct dynamic database queries filtering on:
   * Price (min/max range)
   * Bedrooms & Bathrooms (exact or minimum values)
   * Square Footage (min/max range)
   * Amenities (AND/OR array matching)
   * Category (residential/commercial)
   * Transaction Type (sale/rent)
3. **FR-301-3 (Saved Search Retention):** The system must store serialized search parameters linked to user profiles and run daily comparison cron jobs to email users when new properties match their saved criteria.

---

## 4. Validation Rules
* **Price Range:** Min price >= 0, Max price >= Min price.
* **Pagination Parameters:** `page` integer >= 1 (defaults to 1), `limit` integer between 10 and 50 (defaults to 20).
* **Text Input:** Sanitize keywords to contain alphanumeric characters, spaces, and standard hyphens only. Limit length to 100 characters.

---

## 5. Edge Cases
* **Edge Case 1: Special Characters in Query**
  * *Scenario:* User enters punctuation or regex meta-characters (e.g. `*`, `?`, `[]`, `&`) in the text search.
  * *Resolution:* Escape the query input before passing it to PostgreSQL `to_tsquery` to prevent database syntax errors.
* **Edge Case 2: Multi-Amenity Match Logic**
  * *Scenario:* User filters by 5 amenities (e.g. Pool, Gym, Garage, AC, Balcony).
  * *Resolution:* Apply SQL `JSONB` array inclusion operators (`@>`) to ensure the property contains *all* selected amenities (AND operation).

---

## 6. Dependencies
* Relational database with full-text search capability (e.g., PostgreSQL tsvector) or an external indexing engine (Elasticsearch).
* Cron scheduling engine for saved search check runs.

---

## 7. API Requirements

### Query Listings
* **Method & Route:** `GET /api/properties`
* **Query Parameters:**
  * `query`: "condo city view"
  * `minPrice`: 300000
  * `maxPrice`: 600000
  * `type`: "residential"
  * `bedrooms`: 2
  * `amenities`: "Pool,Gym"
  * `page`: 1
  * `limit`: 10
* **Response `200 OK`:**
```json
{
  "status": "success",
  "meta": {
    "totalCount": 142,
    "totalPages": 15,
    "currentPage": 1,
    "limit": 10
  },
  "results": [
    {
      "id": "prop_8820391",
      "title": "Modern 2-Bed Condo with City View",
      "price": 450000.00,
      "address": "123 Main St, Seattle, WA 98101",
      "bedrooms": 2,
      "bathrooms": 2,
      "squareFootage": 1150.50,
      "images": ["https://cdn.platform.com/image1.webp"]
    }
  ]
}
```

### Save Search Configuration
* **Method & Route:** `POST /api/properties/saved-searches`
* **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
* **Request Payload:**
```json
{
  "searchName": "Seattle Residential Condos under 600k",
  "filters": {
    "query": "condo",
    "maxPrice": 600000,
    "type": "residential",
    "city": "Seattle"
  },
  "notificationFrequency": "daily"
}
```
* **Response `201 Created`:**
```json
{
  "status": "success",
  "savedSearchId": "search_99810"
}
```

---

## 8. Database Impact
* **Tables:** `properties`, `saved_searches` (New table).
* **New Table Scheme:** `saved_searches`
  * `id` (uuid, primary key)
  * `user_id` (uuid, foreign key referencing `users.id`)
  * `search_name` (varchar)
  * `filters` (jsonb)
  * `frequency` (enum: immediate, daily, weekly)
  * `created_at` (timestamp)
* **Indexes:**
  * Full-text search index: `CREATE INDEX idx_properties_fts ON properties USING gin(to_tsvector('english', title || ' ' || description));`.
  * Index on `properties.price` and `properties.category`.

---

## 9. UI Components
* **Search Filters Bar:** Collapsible side/top panel containing sliders for price/size, numerical drop-downs for beds/baths, checkbox grid for amenities, and a search text bar.
* **Results Panel:** Grid of responsive property cards displaying primary photo, price, basic specs, address, heart icon (favorite), and compare checkbox.

---

## 10. Security Requirements
* Enforce parameterized queries to eliminate SQL injection attacks from filter inputs.
* Rate limit public search queries to a maximum of 300 calls per 5 minutes per IP to mitigate data scraping bots.

---

## 11. Acceptance Criteria
* **AC-301-1:**
  * *Given* the database contains active listings,
  * *When* a buyer inputs a keyword query and filters by price,
  * *Then* the results count and displayed cards match the database records exactly.
* **AC-301-2:**
  * *Given* a logged-in buyer,
  * *When* they click "Save Search",
  * *Then* the filters are persisted to the database and linked to their profile.

---

## 12. Definition of Done
* Full-text search and dynamic filters unit-tested with seed data.
* Performance tests verify index usage (queries resolve in <150ms on a 50k listing database).
* Responsive layout displays and navigates properly on iOS, Android, and Desktop.
