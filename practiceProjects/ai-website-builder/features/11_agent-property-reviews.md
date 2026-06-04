# Feature Detail: Agent and Property Reviews

## Feature ID: FEAT-701

---

## 1. Purpose
Implement a trusted reviews system letting verified buyers submit 1-to-5 star ratings and written reviews for agents and properties, running auto-moderation checks on texts, and recalculating rating averages.

---

## 2. User Stories
* **US-701-1 (Agent Ratings & Reviews):** As a Buyer, I want to leave a rating (1-5 stars) and a written review for an agent after interacting with them to help maintain high quality on the platform.
  * *Dependency:* FEAT-101 (Registration) and FEAT-102 (Agent Profiles).
  * *Edge Case:* Agent submits fake reviews for themselves using dummy buyer accounts, or competitors submit malicious spam reviews.
  * *Resolution:* Enforce system checks: a user can only review an agent if they have an active inquiry thread in the database that has exchanged at least 3 messages.

---

## 3. Functional Requirements
1. **FR-701-1 (Review Form Widget):** Expose a review modal containing: Star Rating Selector (1-5), Review Title, Review Text (textarea), and Checkbox confirming genuine interaction.
2. **FR-701-2 (Profanity & Link Filtering):** Before database insertion, review text must pass through a regex checker filtering out links, phone numbers, email addresses, and blacklisted swear words. Mismatches trigger status `moderated_pending`.
3. **FR-701-3 (Rating Recalculation Service):** Creating or editing a review must trigger a database trigger or background job recalculating the target agent's `rating_avg` and `reviews_count` values.

---

## 4. Validation Rules
* **Rating:** Integer value between 1 and 5 (inclusive).
* **Review Text Length:** Minimum 15 characters, maximum 1000 characters.
* **Review Frequency Limits:** One review per buyer per agent every 90 days (BRL-006).

---

## 5. Edge Cases
* **Edge Case 1: Self-Review Block**
  * *Scenario:* Agent registers a standard buyer profile under a second email to write a review on their primary Agent profile.
  * *Resolution:* Match the IP address and phone number records. Block submission if any matched variables connect the reviewer to the target agent, returning `403 Forbidden` with reason `SELF_REVIEW_DETECTED`.
* **Edge Case 2: Multi-Property Single Sale Review**
  * *Scenario:* Buyer buys 3 properties from the same agent and tries to post 3 reviews.
  * *Resolution:* System limits submissions to one active review record per transactional exchange thread.

---

## 6. Dependencies
* FEAT-101 (User accounts and phone numbers).
* FEAT-102 (Agent profiles and metadata).

---

## 7. API Requirements

### Submit Agent Review
* **Method & Route:** `POST /api/agents/:id/reviews`
* **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
* **Request Payload:**
```json
{
  "rating": 5,
  "comment": "Marcus was incredibly helpful. Walked us through three different condos and helped us close in two weeks!"
}
```
* **Response `201 Created`:**
```json
{
  "status": "success",
  "reviewId": "rev_77192",
  "isModerated": false,
  "message": "Review published successfully."
}
```

### Fetch Agent Reviews
* **Method & Route:** `GET /api/agents/:id/reviews`
* **Query Parameters:** `page=1&limit=10`
* **Response `200 OK`:**
```json
{
  "status": "success",
  "meta": {
    "averageRating": 4.8,
    "totalReviews": 24
  },
  "reviews": [
    {
      "id": "rev_77192",
      "rating": 5,
      "comment": "Marcus was incredibly helpful...",
      "reviewer": {
        "fullName": "Sarah Jenkins"
      },
      "createdAt": "2026-06-04T12:00:00Z"
    }
  ]
}
```

---

## 8. Database Impact
* **Table:** `reviews` (New table).
  * Fields: `id` (uuid, primary key), `reviewer_id` (uuid, FK), `agent_id` (uuid, FK, nullable), `property_id` (uuid, FK, nullable), `rating` (integer), `comment` (text), `is_moderated` (boolean), `created_at` (timestamp).
* **Constraints:**
  * Check constraint `rating BETWEEN 1 AND 5`.
  * Foreign keys referencing `users.id`, `agents.id`, and `properties.id`.
* **Triggers:**
  * Postgres trigger to update `agents.rating_avg` and `agents.reviews_count` when reviews are inserted, updated, or deleted.

---

## 9. UI Components
* **Review Input Form:** Star rating interactive click system (turns yellow on hover), text block with character counter, warning indicators if links are typed.
* **Reviews Timeline:** List panel displaying user names, star layout, verified icons, publication timestamps, and a "Flag Review" button for moderation.

---

## 10. Security Requirements
* Enforce HTML encoding to prevent stored cross-site scripting (XSS) from comments.
* Limit review modification privileges exclusively to the reviewer user who authored the review.

---

## 11. Acceptance Criteria
* **AC-701-1:**
  * *Given* a buyer has swapped messages with an agent,
  * *When* they submit a 4-star rating with valid text,
  * *Then* the review publishes, and the agent's average rating calculation updates in the database.
* **AC-701-2:**
  * *Given* a user attempts to review an agent they have never messaged,
  * *When* they click submit,
  * *Then* the API returns `403 Forbidden` with a message: "You must complete a transaction or conversation with this agent before writing a review."

---

## 12. Definition of Done
* DB triggers for average rating calculation verified with intensive tests.
* Profanity/spam pattern checks covered in backend unit tests.
* Review creation modal verified for keyboard accessibility.
