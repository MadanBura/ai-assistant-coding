# Feature Specification: Agent Ratings & Reviews

## 1. Feature Info
* **Feature ID:** `FT-5.2`
* **Priority:** 10 (Trust & Reputation System)
* **Title:** Agent Ratings & Reviews

---

## 2. Purpose
Enables buyers to review verified agents they have interacted with on the platform. The system scores agents across three metrics: Communication, Market Knowledge, and Helpfulness, calculating aggregate ratings to display on public profiles.

---

## 3. User Stories
* **US-5.3:** As a Buyer, I want to submit a rating and text review for an Agent I interacted with so that I can share my experience.
* **US-5.4:** As a Buyer, I want to see verified reviews on an Agent's profile page so that I can choose a reliable professional to represent me.

---

## 4. Functional Requirements

### FR-502.1: Multi-Metric Rating Form
* **Description:** Form capturing score selections (1 to 5 stars) for three metrics:
  * *Communication*
  * *Market Knowledge*
  * *Helpfulness*
* **Inputs:** Numeric score values, text review body.

### FR-502.2: Inquiry Verification Guard
* **Description:** Before submitting, the backend must verify that the reviewer (Buyer ID) has an active inquiry thread with the target Agent. The thread must be at least 7 days old to ensure sufficient interaction history.

### FR-502.3: Cached Aggregate Rating Calculator
* **Description:** When a review is approved, update the agent's profile summary metrics: calculate the average scores for each rating sub-category and update the overall rating.

---

## 5. Validation Rules
* **VAL-502.1 (Score Boundaries):** Rating values must be integers between `1` and `5`.
* **VAL-502.2 (Review Text Length):** Review text must contain between `20` and `1000` characters.
* **VAL-502.3 (Single Review Cap):** A Buyer can submit only one review per Agent to prevent score manipulation.

---

## 6. Edge Cases
* **Edge Case 1: Self-Review Prevention:** An Agent attempts to review their own profile.
  * *Resolution:* The system must check if `reviewer_id === agent_id`, rejecting the request with a `400 Bad Request` code.
* **Edge Case 2: Multi-Agent Brokerage Manipulation:** Agents in the same brokerage write reviews for one another to artificially boost ratings.
  * *Resolution:* Validate that a real, active inquiry thread exists between the accounts concerning a listing not owned by the reviewer, checking that the reviewer role is set to `Buyer`.

---

## 7. Dependencies
* **Upstream:** `FT-1.1` (Auth), `FT-5.1` (Inquiry thread history verification).
* **Downstream:** Agent Profile Views (renders aggregated ratings).

---

## 8. API Requirements

### Submit Agent Review
* **Endpoint:** `POST /api/v1/agents/{id}/reviews`
* **Headers:** `Authorization: Bearer <token>`
* **Request Schema:**
```json
{
  "ratingCommunication": 5,
  "ratingKnowledge": 4,
  "ratingHelpfulness": 5,
  "reviewText": "David was extremely helpful in coordinating viewings and explaining neighborhood price trends."
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Review submitted successfully."
}
```

### Fetch Agent Reviews
* **Endpoint:** `GET /api/v1/agents/{id}/reviews`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "aggregateRating": 4.7,
    "metrics": {
      "communication": 5.0,
      "knowledge": 4.0,
      "helpfulness": 5.0
    },
    "reviews": [
      {
        "reviewId": "rev_01a",
        "reviewerName": "Jane Doe",
        "reviewText": "David was extremely helpful...",
        "createdAt": "2026-06-04T18:31:00Z"
      }
    ]
  }
}
```

---

## 9. Database Impact
* **Target Table:** `REVIEW` (writes record).
* **Updates Table:** `USER` (caches aggregated rating fields).
* **Index Requirements:**
  * Index on `REVIEW(agent_id)` to optimize reviews loading on profile pages.
  * Unique index constraint on `(agent_id, reviewer_id)` to enforce the single-review cap.

---

## 10. UI Components
* **Star Grid Component:** Five interactive stars that highlight orange on hover.
* **Verified Badge Checkmark:** A green tick marked "Verified Interaction" rendered alongside reviews that passed inquiry validation checks.
* **Summary Metrics Progress Bars:** Horizontal status bars displaying the distribution of ratings (e.g. % of 5-star, 4-star ratings) at the top of the reviews section.

---

## 11. Security Requirements
* **SEC-502.1 (Write Access Role Enforcement):** Validate that `req.user.role === 'Buyer'`. Agent accounts must be restricted from submitting reviews.
* **SEC-502.2 (Text Sanitization):** Apply HTML sanitization checks to review text to block script injections.

---

## 12. Acceptance Criteria
* **AC-503:** Submitting a review without a verified interaction history returns a `403 Forbidden` response.
* **AC-504:** Aggregated average rating updates correctly when a new review is added.

---

## 13. Definition of Done
* [ ] Database migration schema applied.
* [ ] Verification checks cover self-review and multiple review attempts.
* [ ] Integration tests verify automated calculation of aggregate averages.
