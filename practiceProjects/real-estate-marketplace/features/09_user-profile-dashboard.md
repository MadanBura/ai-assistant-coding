# Feature Specification: User Profile Dashboard

## 1. Feature Info
* **Feature ID:** `FT-1.3`
* **Priority:** 9 (User Retention and Account Hub)
* **Title:** User Profile Dashboard

---

## 2. Purpose
Consolidate user options, settings, saved searches, and favorited properties into a unified dashboard dashboard. The layout adapts depending on the logged-in role (e.g., Agents see lead queues, Buyers see saved searches).

---

## 3. User Stories
* **US-1.5:** As a registered user, I want to edit my profile details (name, avatar, phone number) so that my contact details remain accurate.
* **US-2.5:** As a Buyer, I want to bookmark listing cards as "Favorites" so that I can monitor pricing adjustments or availability changes over time.
* **US-2.6:** As a Buyer, I want to save search filter presets and subscribe to email alerts so that I am notified when matching properties are listed.

---

## 4. Functional Requirements

### FR-103.1: Role-Adapted Panel Interface
* **Description:** Render dashboard sections based on role:
  * *Buyer Panel:* Profile settings, Favorites, Saved Searches list.
  * *Owner Panel:* Profile settings, My Properties listing management pane.
  * *Agent Panel:* Profile, Public profile setup (Bio, Experience, social links), Listing builder link, Analytics dashboards.

### FR-103.2: Favorites Bookmark Manager
* **Description:** Allow users to toggle listing bookmarks. Bookmarking adds the listing ID to the user's favorites list. If the price changes on a bookmarked listing, trigger a notification.

### FR-103.3: Saved Search Alert Subscription
* **Description:** Save active filter objects (e.g., ZIP: 10001, Max Price: 500k) to the user's profile. Users can toggle "Email Notifications" on or off for each saved search.

---

## 5. Validation Rules
* **VAL-103.1 (Valid Phone Numbers):** Phone numbers must match the standard E.164 phone numbering structure (e.g. `+1234567890`).
* **VAL-103.2 (Limit on Saved Searches):** A user is capped at a maximum of 10 saved searches to prevent notification queue overloading.

---

## 6. Edge Cases
* **Edge Case 1: Archive Listings on Profile Deletion:** A user attempts to delete their profile while owning active listings.
  * *Resolution:* The system must block deletion, displaying a modal: "You have active listings. Please archive or transfer ownership before deleting your account."
* **Edge Case 2: Notification for Deleted Favorite:** A listing bookmarked in a user's Favorites is deleted by the owner or rejected by an admin.
  * *Resolution:* Do not break the UI. The dashboard must show the card marked as "Unavailable/Removed" with an option to remove it from favorites.

---

## 7. Dependencies
* **Upstream:** `FT-1.1` (Auth), `FT-2.1` (Properties data).
* **Downstream:** None.

---

## 8. API Requirements

### Toggle Property Favorite
* **Endpoint:** `POST /api/v1/profile/favorites`
* **Headers:** `Authorization: Bearer <token>`
* **Request Schema:**
```json
{
  "propertyId": "prop_9910a"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "favorited": true,
  "message": "Listing bookmarked."
}
```

### Save Search Preset
* **Endpoint:** `POST /api/v1/profile/saved-searches`
* **Headers:** `Authorization: Bearer <token>`
* **Request Schema:**
```json
{
  "searchName": "Condos in Uptown",
  "filters": {
    "propertyType": "Condo",
    "city": "Uptown",
    "maxPrice": 600000
  },
  "enableEmailAlert": true
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "savedSearchId": "sch_1120a"
}
```

---

## 9. Database Impact
* **Target Tables:** `USER` (Update metadata), `USER_FAVORITE` (junction table insert/delete), `SAVED_SEARCH` (insert/delete).
* **Junction Schema:**
```sql
CREATE TABLE user_favorites (
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    property_id VARCHAR REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id)
);
```

---

## 10. UI Components
* **Dashboard Nav Sidebar:** Sticky vertical navigation list shifting to a horizontal slider on mobile.
* **Favorites Tab Grid:** List cards showing a trash icon to remove them from favorites.
* **Search Alert Card:** Card display showing filter tags (e.g. `Condo`, `<$600k`) with a toggle switch for email notifications.

---

## 11. Security Requirements
* **SEC-103.1 (Profile Access Middleware):** Users can only access, view, or write to their own profile resources. Attempting to query `profile/favorites?userId=diff_id` must throw a `403 Forbidden` response.

---

## 12. Acceptance Criteria
* **AC-105:** Toggling favorites updates database junction records immediately.
* **AC-106:** Saving a search preserves all filter parameters.

---

## 13. Definition of Done
* [ ] Database migration for favorites and saved searches executed.
* [ ] Verification checks cover account deletion constraints.
* [ ] Integration tests verify profile update route security.
