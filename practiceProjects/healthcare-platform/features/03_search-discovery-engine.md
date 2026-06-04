# Feature Specification: Search & Discovery Engine

## Feature ID
`FEAT-102` (Epic: `EPC-001`)

## Purpose
Allow patients and guests to query, filter, and discover verified medical professionals on the platform. The engine must support multi-attribute filtering, fuzzy matches, and geo-proximity search to connect patients with local doctors.

## User Stories
* **US-102.1:** As a patient/guest, I want to search for doctors by typing a specialty (e.g., cardiologist) or doctor's name, so that I can find matching profiles.
* **US-102.2:** As a patient, I want to filter search results by pricing range, rating star thresholds, language spoken, and appointment type (online/in-person), so that I can narrow down my selection.

## Functional Requirements
1. **Search Index Synchronization:** A system listener must sync updates in the database `doctors` table (such as name changes, status updates, fee edits) into the Elasticsearch index.
2. **Text-based Search:** Query matching covering specialty, sub-specialty, doctor first name, doctor last name, and biography keywords.
3. **Filter Support:**
   * **Specialty:** exact terms or fuzzy matched terms (e.g., pediatric).
   * **Consultation Fee Range:** Numeric range filter (min/max).
   * **Ratings:** Aggregate rating filter (e.g., stars >= 4.0).
   * **Languages:** Array of language strings (e.g., English, Spanish).
   * **Online Availability:** Toggle filter to show doctors with slots available within the next 24 hours.
4. **Geo-Location Sorting:** Sort results based on distance from patient-supplied ZIP code or coordinates.
5. **Paging:** Load results in chunks of 10 or 20 records to optimize speed.

## Validation Rules
* **Query Length:** Search input queries must be sanitized and truncated to a maximum of 100 characters.
* **Latitude/Longitude Boundaries:** If geo-location parameters are supplied, values must satisfy standard boundaries (Latitude: -90 to +90, Longitude: -180 to +180).
* **Verify Exclusions:** Profiles with status `pending_verification`, `rejected`, or `suspended` must be completely omitted from search query outputs.

## Edge Cases
* **No Results Found:** When search parameters yield zero hits, the system must trigger a query widening fallback (e.g., increasing distance radius from 10 miles to 50 miles, or removing language restrictions) and return a message: "We found no direct matches, but here are doctors near you."
* **High-volume queries for generic terms:** The system must utilize Redis caches for common search requests (e.g., "General Practitioner" + location) with a 5-minute time-to-live (TTL).
* **Fuzzy typo matching:** Typing "cardology" instead of "cardiology" must return Cardiology results using Lucene's Levenshtein distance configuration (fuzziness level set to 2).

## Dependencies
* **Search Infrastructure:** Elasticsearch (or PostgreSQL `pg_trgm` extension if Postgres is used for initial MVP text search).
* **Geocoding API:** Google Maps API or OpenStreetMap API (to resolve ZIP codes to coordinates).

## API Requirements

### `GET /api/v1/search/doctors`
* **Security:** Public (Guests & Patients)
* **Query Parameters:**
  * `query` (string, optional) - text query
  * `specialty` (string, optional) - filter term
  * `min_fee` (decimal, optional) - filter boundary
  * `max_fee` (decimal, optional) - filter boundary
  * `min_rating` (float, optional) - filter boundary (1-5)
  * `languages` (string, comma-separated, optional) - e.g., "english,spanish"
  * `zip_code` (string, optional) - geo-pivot
  * `page` (int, default: 1)
  * `limit` (int, default: 10)
* **Response (200 OK):**
```json
{
  "total_hits": 28,
  "current_page": 1,
  "total_pages": 3,
  "data": [
    {
      "doctor_id": "doc-robert-chen-77",
      "first_name": "Robert",
      "last_name": "Chen",
      "specialty": "Cardiology",
      "consultation_fee": 150.00,
      "rating_average": 4.8,
      "review_count": 120,
      "languages": ["English", "Mandarin"],
      "clinic_address": {
        "city": "Boston",
        "state": "MA",
        "zip": "02115"
      },
      "next_available_slot": "2026-06-05T09:30:00Z"
    }
  ]
}
```

## Database Impact
* **Read Queries:** Optimization of DB index access when search triggers lookup queries.
* **Indexes Needed on `doctors`:**
  * Index on `specialty` column.
  * Index on `verification_status` column.
  * Composite index on `(verification_status, consultation_fee)`.

## UI Components
* **Search Directory Page (`SCR-101`):**
  * Search control bar with input field and location selector.
  * Advanced filter modal / sidebar toggle.
  * Results grid showing cards with doctor avatars, specialty tags, rating badges, prices, and booking action triggers.
  * Pagination navigation control bar at page footer.

## Security Requirements
* **Prevent SQL/Query Injection:** Sanitize raw text queries to eliminate injection vulnerabilities.
* **Access Control:** Guest users can view profile summaries, but personal addresses or contact numbers are masked unless the patient has an active booking.

## Acceptance Criteria
* **AC-102.1.1:** Verify that search queries containing typographical errors (e.g. "pediatricen") successfully return doctors under the "Pediatrics" specialty.
* **AC-102.1.2:** Validate that search queries completely exclude doctors who do not have the status `verified` in the database.
* **AC-102.1.3:** Verify that searching with a valid ZIP code successfully returns list sorted by proximity.

## Definition of Done
* Search API endpoint created and tested under simulated load.
* Elasticsearch synchronization pipeline operates on database triggers.
* Search responsive interface conforms to design mockups.
* API response performance falls within 250ms under concurrent loads.
* Verification tests pass in CI environment.
