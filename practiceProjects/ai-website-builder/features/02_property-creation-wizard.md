# Feature Detail: Property Creation Wizard

## Feature ID: FEAT-201

---

## 1. Purpose
Provide property owners and real estate agents with a multi-step listing wizard to input property specifications, upload images, geolocate the listing on a map, and submit it for moderation or save it as a draft.

---

## 2. User Stories
* **US-201-1 (Property Entry Wizard):** As an Owner or Agent, I want to create a listing by filling out a form with property type (residential/commercial), transaction type (sale/rent), price, location details, amenities, and photos so that it can be reviewed and published.
  * *Dependency:* FEAT-101 (Registration and Role Selection).
  * *Edge Case:* Owner uploads a photo file larger than 10MB or in an unsupported format.
  * *Resolution:* The UI performs client-side compression and validation, allowing only JPEG/PNG formats under 5MB per image.
* **US-201-2 (Draft Interruption Save):** As an Owner or Agent, I want to save my progress as a "Draft" so that I can finish creating my listing at a later time.
  * *Dependency:* US-201-1.
  * *Edge Case:* Network disconnects during submission.
  * *Resolution:* Auto-save drafts to local storage (browser cache) every 30 seconds to prevent loss of inputs.

---

## 3. Functional Requirements
1. **FR-201-1 (Step 1 - Basic Info):** Input fields for Title (min 15, max 100 chars), Description (min 100, max 2000 chars), Category (enum: residential, commercial), Transaction Type (enum: sale, rent), and Price.
2. **FR-201-2 (Step 2 - Space & Location details):** Input fields for Address, Latitude, Longitude, Bedrooms (optional for commercial), Bathrooms (optional), and Square Footage (decimal). Includes a mini-map pin selector.
3. **FR-201-3 (Step 3 - Media & Amenities):** Supports drag-and-drop file upload for up to 30 photos. Multi-select checkboxes for amenities (e.g. Pool, Gym, Garage, AC, High-speed Internet).
4. **FR-201-4 (Step 4 - Review & Submit):** Displays a summary of the listing. User can select "Save Draft" or "Submit for Moderation".

---

## 4. Validation Rules
* **Price:** Must be a positive decimal greater than 0. Max value $1,000,000,000.
* **Photos:** Minimum 3 photos, maximum 30 photos. Allowed MIME types: `image/jpeg`, `image/png`. Max file size: 5MB per image.
* **Square Footage:** Positive decimal. Minimum 10 sq ft.
* **Coordinates:** Latitude range [-90, 90], Longitude range [-180, 180]. Must be accurate to at least 5 decimal places.

---

## 5. Edge Cases
* **Edge Case 1: Interrupted File Upload**
  * *Scenario:* Internet drops while uploading 15 high-res photos.
  * *Resolution:* Display a progress bar for individual files. Allow the user to "Retry" uploading failed files instead of forcing a complete form resubmission.
* **Edge Case 2: Inconsistent Geocoding**
  * *Scenario:* The geocoder cannot resolve the textual address provided.
  * *Resolution:* Prompt user to manually position a pin on the visual mini-map to generate coordinates if text lookup fails.

---

## 6. Dependencies
* Geocoding API service (e.g. Mapbox Geocoding or Google Maps Geocoding).
* Object storage backend (AWS S3, GCP Cloud Storage) for image hosting.

---

## 7. API Requirements

### Create Property Listing
* **Method & Route:** `POST /api/properties`
* **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: multipart/form-data`
* **Request Form Fields:**
  * `title`: "Modern 2-Bed Condo with City View"
  * `description`: "Fully renovated, spacious condo in the heart of downtown..."
  * `price`: 450000.00
  * `category`: "residential"
  * `transaction`: "sale"
  * `address`: "123 Main St, Seattle, WA 98101"
  * `latitude`: 47.6062
  * `longitude`: -122.3321
  * `bedrooms`: 2
  * `bathrooms`: 2
  * `squareFootage`: 1150.50
  * `amenities`: `["Gym", "Pool", "Garage"]` (JSON String)
  * `images`: Binary file buffers
  * `status`: "pending" (or "draft" if draft toggle was checked)
* **Response `201 Created`:**
```json
{
  "status": "success",
  "propertyId": "prop_8820391",
  "listingStatus": "pending"
}
```
* **Response `401 Unauthorized`:**
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Token expired or missing."
}
```

---

## 8. Database Impact
* **Table:** `properties`
  * Inserts rows containing details mapping to database fields.
* **Constraints:**
  * Check constraint: `price > 0`.
  * Check constraint: `square_footage > 0`.
* **Foreign Key:**
  * `owner_id` references `users.id` with `ON DELETE CASCADE`.

---

## 9. UI Components
* **Wizard Navigation Banner:** Shows active steps: `1. Basics` -> `2. Specs & Map` -> `3. Media` -> `4. Preview`.
* **Drag-and-Drop Image Box:** Displays visual thumbnails of uploaded photos with delete overlay buttons.
* **Mapbox Pin Locator Widget:** Displays a map where users can drag a pin to auto-populate Latitude/Longitude inputs.

---

## 10. Security Requirements
* Backend must validate JWT authentication and verify the user role is `owner` or `agent`.
* Sanitize all text fields using an HTML escaping library to prevent XSS (Cross-Site Scripting).
* Run file signature validation (magic bytes) on uploads to prevent uploading executable files disguised as images.

---

## 11. Acceptance Criteria
* **AC-201-1:**
  * *Given* a user has filled the Property Creation form,
  * *When* they click "Submit for Moderation",
  * *Then* the backend creates a property record with status `pending`, uploads compressed WebP images to S3, and redirects the user to their dashboard.
* **AC-201-2:**
  * *Given* a user chooses "Save Draft",
  * *When* they exit the page and return later,
  * *Then* the wizard repopulates all previously entered fields.

---

## 12. Definition of Done
* Wizard navigation and form validations verified on mobile & desktop.
* Image compression module written, tested, and configured to yield `.webp` formats.
* API endpoints unit-tested (including mocking AWS S3 upload failures).
* Relational database columns match data types and schema maps.
