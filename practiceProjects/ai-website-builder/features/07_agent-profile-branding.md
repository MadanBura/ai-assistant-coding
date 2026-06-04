# Feature Detail: Agent Profile & Branding

## Feature ID: FEAT-102

---

## 1. Purpose
Enable real estate agents to build credibility and showcase their listings by customizing a public profile containing bio, agency information, verified licensing details, active listings, and client reviews.

---

## 2. User Stories
* **US-102-1 (Agent Customization & Portfolios):** As a verified agent, I want to design my public profile page with my bio, agency logo, listings, contact details, and customer reviews to attract clients.
  * *Dependency:* FEAT-101 (Registration and Role Selection).
  * *Edge Case:* Agent is suspended by admin.
  * *Resolution:* Their public profile page is immediately replaced with a 404 page, and all active listings are hidden from search results.

---

## 3. Functional Requirements
1. **FR-102-1 (Profile Editor):** Provide settings options for agents to update: Bio (max 1000 chars), Agency Name, Profile Picture URL, Agency Logo URL, Social Media links (Facebook, LinkedIn, Twitter), and Phone numbers.
2. **FR-102-2 (Public Agent Landing Page):** System dynamically renders a public-facing URL showing:
   * Verification Badge (displaying "Verified" or "Unverified License").
   * Average review rating star calculation and individual client reviews.
   * Paginated list of active property listings managed by this agent.
3. **FR-102-3 (Suspension Masking):** The routing middleware must check user status in database on page load. If status is `suspended`, route public URL to a "Profile Unavailable" status page.

---

## 4. Validation Rules
* **Bio Character Limit:** 0 to 1000 characters.
* **Social Media Links:** Must be valid HTTP/HTTPS URLs pointing only to domain structures matching `facebook.com`, `linkedin.com`, or `twitter.com`.
* **Profile Picture / Logo Size:** Max 3MB per file, allowed types: JPEG, PNG.

---

## 5. Edge Cases
* **Edge Case 1: Unverified vs Verified Badge Display**
  * *Scenario:* Agent creates profile, but the Admin has not yet verified their license.
  * *Resolution:* Show a clear, amber-colored badge on the agent's profile: "License Verification Pending". Limit public contact routes until verification is completed to build trust.
* **Edge Case 2: Broken Media Links**
  * *Scenario:* Agent deletes their hosted avatar or link breaks.
  * *Resolution:* Ensure UI falls back to standard avatar placeholder displaying initials computed from their Full Name (e.g. `MV` for Marcus Vance).

---

## 6. Dependencies
* FEAT-101 (Registration & user identity models).
* Object storage backend (AWS S3) for branding uploads.

---

## 7. API Requirements

### Fetch Public Agent Profile
* **Method & Route:** `GET /api/agents/:id`
* **Response `200 OK`:**
```json
{
  "status": "success",
  "agent": {
    "id": "agent_88293",
    "fullName": "Marcus Vance",
    "bio": "Residential and commercial real estate specialist with 10 years experience...",
    "agencyName": "Vance & Associates",
    "profilePicture": "https://cdn.platform.com/marcus.webp",
    "licenseStatus": "verified",
    "ratingAverage": 4.8,
    "reviewsCount": 24,
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/marcus-vance"
    }
  }
}
```

### Update Agent Profile
* **Method & Route:** `PUT /api/agents/profile`
* **Headers:** `Authorization: Bearer <Agent-JWT>`, `Content-Type: multipart/form-data`
* **Request Fields:**
  * `bio`: "Updated bio text..."
  * `agencyName`: "Vance Group"
  * `avatar`: Binary image file (optional)
  * `logo`: Binary image file (optional)
  * `linkedin`: "https://linkedin.com/in/marcus-vance"
* **Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Profile updated successfully."
}
```

---

## 8. Database Impact
* **Table:** `agents` (New table).
  * Fields: `id` (uuid, PK), `user_id` (uuid, FK), `license_number` (varchar), `bio` (text), `agency_name` (varchar), `rating_avg` (float), `reviews_count` (integer), `social_links` (jsonb), `created_at` (timestamp).
* **Constraints:**
  * Foreign key `user_id` referencing `users.id` with delete cascades.

---

## 9. UI Components
* **Agent Public Page Layout:** Premium split-grid structure: Left sidebar showing agent avatar, verified badge, stats, and social icons; Right pane showing active listings cards and customer reviews feed.
* **Agent Settings Form:** Clean forms with separate tabs for `Basic Info`, `Branding Assets`, and `License Verification`.

---

## 10. Security Requirements
* Only the authenticated user matching `agents.user_id` can modify agent profile records.
* Sanitize custom bio fields using string escape methods to prevent stored cross-site scripting (XSS).

---

## 11. Acceptance Criteria
* **AC-102-1:**
  * *Given* a logged-in Agent,
  * *When* they upload an image and bio description and submit,
  * *Then* the backend validates inputs, saves references, and updates the public landing page instantly.
* **AC-102-2:**
  * *Given* an agent profile is set to `suspended` by an admin,
  * *When* a buyer navigates to their public profile URL,
  * *Then* they receive a 404 page stating: "Profile Unavailable."

---

## 12. Definition of Done
* Integration of file uploading, validation, and storage functions.
* CSS rules verified for responsiveness on standard devices (mobile, tablet, desktop).
* Database migration creating the `agents` table verified against production schemas.
