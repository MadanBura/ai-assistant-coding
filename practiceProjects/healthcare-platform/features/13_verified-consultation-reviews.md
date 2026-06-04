# Feature Specification: Verified Consultation Review System

## Feature ID
`FEAT-602` (Epic: `EPC-006`)

## Purpose
Allow patients to submit numerical ratings and text-based reviews for doctors after completing a consultation. To preserve integrity, reviews are verified (only patients with completed appointments can submit), and are filtered for spam and privacy violations.

## User Stories
* **US-602.1:** As a patient, I want to submit a rating (1-5 stars) and a comment about my consultation, so that other patients can choose doctors with confidence.
* **US-602.2:** As a doctor, I want to see the reviews left on my profile, so that I can receive feedback and improve my medical services.

## Functional Requirements
1. **Verified Review Validator:** A check confirming that `patient_id` has a corresponding appointment with `doctor_id` in `completed` status, and that no review has already been submitted for it.
2. **Review Form UI:** A review input interface capturing:
   * **Rating:** 1 to 5 stars numeric selection.
   * **Comment:** A text area detailing feedback.
3. **Automated Content Filter:** Review text checks filtering out profanity, patient names, direct email strings, or telephone numbers to prevent HIPAA compliance leaks.
4. **Aggregate Rating Calculator:** Upon review creation, trigger a background worker calculating the doctor's average rating:
   * `rating_average = Sum(ratings) / Total(reviews)`
   * Save the calculated average back to the `doctors` table for search indexing.

## Validation Rules
* **Rating Range Bounds:** Ratings must be integers between 1 and 5 (inclusive).
* **Comment Length Limit:** Review comments must span between 10 and 500 characters.
* **One Review Limit:** Patients can submit exactly one review per completed appointment.

## Edge Cases
* **Patient submits a review, but appointment is disputed:** **Rule:** If an appointment is disputed post-session, the review visibility is toggled to `hidden` until administrative investigations finish.
* **Patient tries to submit review for canceled appointment:** **Rule:** The verified validator blocks the form launch, rendering an error: "Reviews can only be submitted for completed consultations."
* **Review contains private medical data (HIPAA leakage):** **Rule:** If the automated parser flags pattern matches (emails, phone numbers, SSNs), the review status transitions to `pending_moderation`, hiding it from the public profile page until an administrator audits it.

## Dependencies
* **Content Filter Service:** Regular expression scanner / profanity library.
* **Database Workers:** BullMQ or database triggers to compute average rating scores.

## API Requirements

### `POST /api/v1/reviews`
* **Security:** Authenticated (JWT) - Patient Only
* **Payload:**
```json
{
  "appointment_id": "appt-449102",
  "rating": 5,
  "comment": "Dr. Chen was extremely professional. He listened carefully to my symptoms and explained the diagnostic tests clearly."
}
```
* **Response (201 Created):**
```json
{
  "review_id": "rev-881923",
  "status": "published",
  "rating_average_updated": 4.8
}
```

### `GET /api/v1/doctors/:id/reviews`
* **Security:** Public
* **Query Parameters:** `page` (int), `limit` (int)
* **Response (200 OK):**
```json
{
  "doctor_id": "doc-robert-chen-77",
  "rating_average": 4.8,
  "total_reviews": 120,
  "data": [
    {
      "review_id": "rev-881923",
      "patient_display_name": "Sarah C.",
      "rating": 5,
      "comment": "Dr. Chen was extremely professional. He listened carefully...",
      "created_at": "2026-06-04T17:00:00Z"
    }
  ]
}
```

## Database Impact
* **`doctor_reviews` Table (New):**
  * `id` (VARCHAR(64), PK)
  * `appointment_id` (VARCHAR(64), FK to `appointments.id`, Unique)
  * `patient_id` (VARCHAR(64), FK to `users.id`)
  * `doctor_id` (VARCHAR(64), FK to `users.id`, Indexed)
  * `rating` (INT)
  * `comment` (TEXT)
  * `status` (ENUM('published', 'pending_moderation', 'hidden'))
  * `created_at` (TIMESTAMP)
* **`doctors` Table:** Update `rating_average` and `review_count` fields upon new review submissions.

## UI Components
* **Consultation Review Form (`SCR-102E`):**
  * Star rating input widget (interactive hover styling states).
  * Review feedback text area with live character counter.
  * Submit review button transitioning to loading states during processing.
* **Doctor Profile Reviews Widget (`SCR-101C`):**
  * Average rating score header display with filled star graphics.
  * Paged review cards listing patient initials, date, rating stars, and feedback text.

## Security Requirements
* **Cross-Site Scripting (XSS) Defenses:** Render comments as sanitized text values. Use script stripping filters prior to rendering raw comments.
* **Patient Identity Safeguards:** Mask patient names on public profile listings (e.g. displaying "Sarah Connor" as "Sarah C.").

## Acceptance Criteria
* **AC-602.1.1:** Verify that reviews can only be submitted for appointments whose database status is `completed`.
* **AC-602.1.2:** Validate that entering an out-of-bounds rating integer (e.g., 6) throws a 400 validation error.
* **AC-602.2.1:** Verify that submitting a review updates the doctor's average rating calculation accurately.

## Definition of Done
* Review submission UI forms built and styled.
* Verified review validator backend check middleware written.
* Auto-calculation trigger logic implemented and covered by unit tests.
* Profanity/privacy pattern filters integrated.
* QA verified review publishing flow.
