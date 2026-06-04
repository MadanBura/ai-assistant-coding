# Feature Specification: Rich Listing Builder

## 1. Feature Info
* **Feature ID:** `FT-2.1`
* **Priority:** 2 (Core Marketplace Content Engine)
* **Title:** Rich Property Listing Builder

---

## 2. Purpose
Provide Property Owners and Agents with a step-by-step submission interface to list residential or commercial properties. The wizard handles physical specifications, address coordinate inputs, price values, photo uploads, and title deed documents, ensuring listings are structured correctly for the search and map engines.

---

## 3. User Stories
* **US-2.1:** As an Owner or Agent, I want to create a listing using a clear step-by-step wizard so that my listing captures physical dimensions, pricing, location data, and high-resolution images.
* **US-2.2:** As an Owner, I want to submit a PDF copy of my property title deed so that platform administrators can verify ownership and mark my listing as "Verified".

---

## 4. Functional Requirements

### FR-201.1: Multi-Step Listing wizard
* **Description:** Form split into three stages:
  1. *Basic Details:* Property Type, Price, Title, Description, Status.
  2. *Specifications:* Beds, Baths, Sqft, Year Built, Amenities list, and HOA fees.
  3. *Media & Location:* Image uploads, Deed PDF, and address geolocation.
* **Status Initial State:** Set to `PENDING_APPROVAL`.

### FR-201.2: Image Resizing & Storage Upload
* **Description:** Images must be compressed and resized backend-side to a maximum width of 1920px (preserving aspect ratio) before being uploaded to S3 storage. Generate a thumbnail (400x300px) automatically.
* **Supported Formats:** JPG, JPEG, PNG, WEBP.

### FR-201.3: Geolocation Coordinate Capture
* **Description:** The system must accept street address strings, utilize a geolocation API (e.g., Mapbox Geocoding) to fetch Latitude and Longitude coordinates, and store them.
* **Database Target Columns:** `latitude`, `longitude` (Type: Float / PostGIS Point).

---

## 5. Validation Rules
* **VAL-201.1 (Price Range):** Price must be a positive integer greater than or equal to $1.00.
* **VAL-201.2 (Spatial Dimensions):** Square footage (`sqft`) must be greater than 10.
* **VAL-201.3 (Owner Cap Restriction):** If the logged-in user is an individual Owner (not Agent), the system must query database active listings. If the count equals or exceeds 2, reject the submission.

---

## 6. Edge Cases
* **Edge Case 1: Upload Failure Recovery:** If the network connection drops during media upload, the UI must store the form fields in HTML5 LocalStorage, allowing the user to resume upload where they left off upon reconnect.
* **Edge Case 2: Post-Approval Edit:** If a user edits a listing that has already been verified and published (e.g., updates pricing by >20% or modifies the property address), the system must revert the listing status back to `PENDING_APPROVAL` and hide it from search until re-verified.

---

## 7. Dependencies
* **Upstream:** `FT-1.1` (Requires user token and role resolution).
* **Downstream:** `FT-2.2` (Search Index), `FT-3.1` (Map Pins), `FT-4.1` (Property Matrix).

---

## 8. API Requirements

### Create Property Listing
* **Endpoint:** `POST /api/v1/properties`
* **Headers:** `Authorization: Bearer <token>`
* **Request Format:** Multipart Form Data (fields + files)
* **API Fields:** `title`, `description`, `price`, `propertyType`, `beds`, `baths`, `sqft`, `streetAddress`, `city`, `state`, `zipcode`, `deedFile` (file).
* **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "propertyId": "prop_a298109bf",
    "status": "PENDING_APPROVAL",
    "title": "Stunning Uptown Condo"
  }
}
```

### Upload Property Media
* **Endpoint:** `POST /api/v1/properties/{id}/media`
* **Request Format:** Multipart Form Data (field: `images[]`)
* **Success Response (200 OK):**
```json
{
  "success": true,
  "media": [
    {
      "mediaId": "med_11029ab92",
      "url": "https://cdn.propconnect.com/media/prop_a298109bf_1.webp",
      "displayOrder": 1
    }
  ]
}
```

---

## 9. Database Impact
* **Target Tables:** `PROPERTY` (insert record), `PROPERTY_MEDIA` (insert multiple association links).
* **Indexes Needed:**
  * Spatial index on `latitude` and `longitude` fields (e.g., GIST index in PostgreSQL).
  * Foreign key index on `owner_id`.

---

## 10. UI Components
* **Progress Stepper Bar:** Highlight active step with animated transitions.
* **Drag-and-Drop Dropzone:** Dotted border dashboard element that turns blue on hover when dragging files, displaying active file upload progression bars.
* **Interactive Address Geocoding Input:** Autocomplete input powered by Mapbox geocoding API, rendering a mini static map coordinate confirmation pin on keypress.

---

## 11. Security Requirements
* **SEC-201.1 (Ownership Protection):** Verify that the user executing update (`PUT /api/v1/properties/{id}`) or delete actions is the original author of the listing (`owner_id === user.id`) or has the `Admin` role.
* **SEC-201.2 (Malicious File Sanitization):** Run backend file validation checking file headers (magic bytes) to ensure uploaded files are valid image/PDF data, scrubbing embedded metadata (EXIF data) to protect owner location privacy.

---

## 12. Acceptance Criteria
* **AC-201:** Verify that creating a property listing generates a record marked as `PENDING_APPROVAL` and registers the geographical coordinates correctly.
* **AC-202:** Check that uploading media larger than 5MB triggers an inline validation alert.

---

## 13. Definition of Done
* [ ] Database migrations executed.
* [ ] Multi-step form UI tested for responsiveness on iOS, Android, and Desktop viewports.
* [ ] Cloud storage S3 uploads verified with signed URLs.
