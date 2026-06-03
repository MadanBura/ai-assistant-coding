# Feature Specification: Job Posting CRUD System
## 1. Goal & Description
Provide employers with an intuitive dashboard module to manage the lifecycle of job vacancies: creating postings, editing details, saving drafts, publishing to the public job board, and archiving filled/expired roles.

---

## 2. Scope
### In Scope
* Job Post creation wizard/form (Title, Description, Requirements, Location preferences, Experience tier).
* Salary specification parameters (minimum, maximum, currency, toggling toggle for "Hide Salary").
* Skill tag association per job (e.g., "Node.js", "System Design").
* Job Lifecycle States: `Draft`, `Published`, `Archived`.
* Dashboard tables displaying job metrics (number of active applicants, view counts).
* Deleting/Archiving postings (soft-delete behavior to preserve applicant histories).

### Out of Scope
* Automatic job posting syndication (e.g., cross-posting to LinkedIn, Indeed).
* Scheduled publishing times (all jobs publish immediately upon clicking "Publish").

---

## 3. User Flow & UI/UX Requirements
1. **Recruiter Jobs Panel:** Employer navigates to "Manage Jobs" dashboard.
2. **Post a Job:** Recruiter clicks "Post a New Job" to open a multi-section form:
   - *Basic Info:* Title, Job Type (Full-Time, Contract, etc.), Location type.
   - *Requirements:* Markdown description, structured requirement items, salary range.
   - *Target Skills:* Searchable select field matching database skill dictionary.
3. **Drafting:** Recruiter can click "Save Draft" to exit and return later.
4. **Publishing:** Clicking "Publish" makes the post visible to candidate search boards immediately.
5. **Modification:** Recruiter can edit active job posts. If requirements change, a notification warning alerts them that AI match scores may re-calculate.
6. **Archiving:** Clicking "Archive" removes the job listing from public search but retains the applicant pool list for internal recruiter tracking.

---

## 4. Technical Specifications & API Design

### Database Model Updates (Job Postings)
* `id` (UUID, Primary Key)
* `employer_id` (UUID, Foreign Key -> Users)
* `company_id` (UUID, Foreign Key -> Companies)
* `title` (VARCHAR)
* `description` (TEXT, Markdown supported)
* `requirements` (TEXT)
* `location` (VARCHAR)
* `job_type` (ENUM: `'FULL_TIME'`, `'PART_TIME'`, `'CONTRACT'`, `'INTERNSHIP'`)
* `salary_min` (DECIMAL)
* `salary_max` (DECIMAL)
* `is_salary_visible` (BOOLEAN, Default: `true`)
* `experience_level` (ENUM: `'JUNIOR'`, `'MID'`, `'SENIOR'`, `'LEAD'`)
* `status` (ENUM: `'DRAFT'`, `'PUBLISHED'`, `'ARCHIVED'`)
* `skills_required` (JSONB / ARRAY of Strings)
* `created_at` (TIMESTAMP)
* `updated_at` (TIMESTAMP)

### API Endpoints
* `POST /api/jobs`
  - Auth: Employer token required.
  - Body: `{ title, description, requirements, job_type, salary_min, salary_max, location, experience_level, status, skills_required }`
  - Response: `201 Created` with job ID.
* `GET /api/jobs/employer`
  - Auth: Employer token.
  - Response: `200 OK` listing all jobs created by this employer (published + drafts + archived).
* `PUT /api/jobs/:id`
  - Auth: Owner employer token.
  - Body: `{ ...updated_fields }`
  - Response: `200 OK`.
* `PATCH /api/jobs/:id/status`
  - Auth: Owner employer token.
  - Body: `{ status: 'PUBLISHED' | 'ARCHIVED' | 'DRAFT' }`
  - Response: `200 OK`.
* `DELETE /api/jobs/:id`
  - Auth: Owner employer token.
  - Action: Sets status to `'ARCHIVED'` (Soft-delete).
  - Response: `200 OK`.

---

## 5. Acceptance Criteria (AC)
* **AC-1:** Form validation must reject submittals with `salary_min` greater than `salary_max`, returning a `400 Bad Request` validation error.
* **AC-2:** Archived job postings must be excluded from public list/search APIs instantly.
* **AC-3:** Changing a job's status must not corrupt or delete existing candidate application links associated with the job ID.
* **AC-4:** System must support rich markdown formatting in the job description field, sanitizing input on the backend to prevent Cross-Site Scripting (XSS).
