# Feature Specification: Candidate Profile Management & Resume Upload
## 1. Goal & Description
Enable registered candidates to create and manage their professional profile, add skills as searchable tags, upload a single resume in PDF format, and adjust settings via a clean dashboard interface.

---

## 2. Scope
### In Scope
* Candidate profile fields (Full Name, Bio, Phone, Location, Portfolio/LinkedIn URLs).
* Skill tag input component (multi-select / add tags).
* PDF Resume File Upload (with strict size/type validations).
* AWS S3 or secure local disk file storage integration for uploaded resumes.
* CRUD operations for candidate experience history and educational qualifications.
* Profile completeness percentage meter.

### Out of Scope
* Multi-resume storage (only 1 active resume supported per profile).
* Direct document editing on-site (resumes must be uploaded as files).

---

## 3. User Flow & UI/UX Requirements
1. **Profile Navigation:** Candidate logs in and lands on the Profile dashboard.
2. **Details Editing:** Clicking "Edit Profile" opens modal/form to enter contact, bio, and experience.
3. **Skill Addition:** Interactive tags field allows users to type and press "Enter" or select suggested tags to add skills to their profile.
4. **Resume Upload:** Drag-and-drop zone prompts users to upload a resume. 
   - Files are validated instantly on drop (must be PDF, max 5MB).
   - If invalid, show red error alert banner.
   - If valid, show loading indicator followed by success checkmark.
5. **Dashboard Settings:** Allows toggling profile visibility: "Public" (visible in recruiter search pools) or "Private" (only visible when candidate directly applies to a job).

---

## 4. Technical Specifications & API Design

### Database Model Updates (Candidate Profiles)
* `user_id` (UUID, Foreign Key -> Users, Unique)
* `full_name` (VARCHAR)
* `bio` (TEXT)
* `location` (VARCHAR)
* `skills` (JSONB / ARRAY of Strings)
* `resume_url` (VARCHAR, File link)
* `is_public` (BOOLEAN, Default: `true`)
* `experience` (JSONB list of `{ company, title, start_date, end_date, description }`)
* `education` (JSONB list of `{ institution, degree, year }`)

### API Endpoints
* `GET /api/candidate/profile`
  - Headers: Bearer Token
  - Response: `200 OK` with candidate profile object.
* `PUT /api/candidate/profile`
  - Body: `{ full_name, bio, location, skills, is_public, experience, education }`
  - Response: `200 OK` with updated profile.
* `POST /api/candidate/resume/upload`
  - Content-Type: `multipart/form-data`
  - File: `resume` (PDF)
  - Response: `200 OK` with `{ resume_url }`.
* `DELETE /api/candidate/resume`
  - Response: `200 OK` (removes resume file and URL link).

---

## 5. Acceptance Criteria (AC)
* **AC-1:** Resume uploads must reject any non-PDF files, returning a `400 Bad Request` with a clear message: `"Only PDF resumes are supported."`
* **AC-2:** File uploads exceeding 5MB must be blocked on both frontend and backend API.
* **AC-3:** If a candidate uploads a new resume, the older file must be deleted from storage to prevent orphan files.
* **AC-4:** Toggling "Private" state must immediately hide the candidate's profile from any recruiter keyword/semantic search endpoints.
