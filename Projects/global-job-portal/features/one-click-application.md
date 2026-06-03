# Feature Specification: One-Click Application Engine
## 1. Goal & Description
Allow candidates with completed profiles to apply for published jobs instantly. The engine packages their active profile snapshot and resume file, verifies eligibility (preventing duplicate applications), and submits it to the employer's applicant tracking database.

---

## 2. Scope
### In Scope
* "Apply Now" button on job detail pages.
* Validation check for profile readiness (checks if resume and email are verified).
* Application creation logic binding Candidate ID, Job ID, and current datetime.
* Snap-shotting of CV URL at the time of application to preserve historical submission integrity.
* Duplicate application prevention (restricting candidates to a single submission per job).
* Post-apply UI state change (button disables and changes to "Applied").

### Out of Scope
* Custom application questionnaires ("Why do you want to work here?") - strictly "one-click" using profile data.
* Cover letter drafting tools.

---

## 3. User Flow & UI/UX Requirements
1. **Job Details View:** Candidate views a job description page.
2. **Profile Completeness Check:**
   - If profile lacks a resume, the "Apply" button is disabled and replaced by a link: "Please upload a resume in your profile settings to apply."
3. **Application Submission:** Candidate clicks the active "Apply Now" button.
4. **Processing State:** A button loading indicator replaces the text for 500ms while validations run on the backend.
5. **Confirmation Modal:** An in-app popup states: "Application submitted successfully! Track your application status on your dashboard."
6. **Button Updated:** The job detail page reloads/updates the button state to: "Applied on 2026-06-03".

---

## 4. Technical Specifications & API Design

### Database Model Updates (Applications)
* `id` (UUID, Primary Key)
* `job_id` (UUID, Foreign Key -> Jobs, Indexed)
* `candidate_id` (UUID, Foreign Key -> Users, Indexed)
* `resume_url_snapshot` (VARCHAR, Links to file version submitted)
* `status` (ENUM: `'APPLIED'`, `'UNDER_REVIEW'`, `'INTERVIEWING'`, `'OFFERED'`, `'REJECTED'`)
* `applied_at` (TIMESTAMP)

### API Endpoints
* `POST /api/applications`
  - Auth: Candidate token required.
  - Body: `{ job_id }`
  - Backend Validation Steps:
    1. Checks if candidate has already applied to `job_id` (Query `applications` where `candidate_id` and `job_id` match). If exists, return `409 Conflict`.
    2. Checks if job status is `PUBLISHED`. If not, return `404 Not Found`.
    3. Checks if candidate profile has a valid `resume_url`. If empty, return `400 Bad Request`.
  - Action: Creates record in `applications` table, setting status to `'APPLIED'`.
  - Response: `201 Created` with application record.
* `GET /api/applications/candidate`
  - Auth: Candidate token.
  - Response: `200 OK` listing candidate's applications with job and company details.

---

## 5. Acceptance Criteria (AC)
* **AC-1:** Candidate must NOT be allowed to submit more than one application per job ID. Clicking "Apply" on a previously applied job must block submission.
* **AC-2:** Applying must fail if the candidate's account email status `is_verified` is `false`.
* **AC-3:** If an employer archives/deletes a job after applications are submitted, the application record must remain readable in the candidate's dashboard list, marked as "Closed/Archived".
* **AC-4:** The database must index `(job_id, candidate_id)` as a unique composite index to guarantee zero duplicate submissions at the DB constraint level.
