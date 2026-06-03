# Feature Specification: Employer Company Profile Management
## 1. Goal & Description
Enable registered recruiters and employers to establish, configure, and maintain their organization's public-facing company profile page. This page serves to showcase company culture, industry, size, and active job postings to interested candidates.

---

## 2. Scope
### In Scope
* Setup of basic company parameters (Name, Website URL, Description, Industry type, Size tier).
* Interactive company logo uploader (image cropping/scaling validation).
* Public company landing page template (visible to all candidates).
* List of active job postings automatically integrated into the public company page.
* Management panel for adding additional recruiters under the same company tenant.

### Out of Scope
* Office location interactive maps (Google Maps embed - reserved for Phase 2).
* Multimedia gallery upload (videos, office environment photos) - initial profile text/logo only.

---

## 3. User Flow & UI/UX Requirements
1. **Employer Onboarding:** Upon initial sign-up, the recruiter is prompted to complete their company profile.
2. **Details Form:** Recruiter fills fields:
   - Company Name
   - Website URL (with protocol validation)
   - Description (Rich-text editor support for lists, bold styling)
   - Industry (Dropdown selection: Tech, Healthcare, Finance, etc.)
   - Company Size (Dropdown tiers: 1-10, 11-50, 51-200, 200+ employees)
3. **Logo Upload:** Click-to-upload or drag image.
   - Validates dimensions (square aspect ratio recommended, auto-cropped).
   - Validates size (max 2MB) and type (PNG, JPG, WebP).
4. **Preview Mode:** Recruiter clicks "View Public Profile" to see how candidates see their page.
5. **Publish:** Changes saved successfully update all candidate-facing views.

---

## 4. Technical Specifications & API Design

### Database Model Updates (Company Profiles)
* `id` (UUID, Primary Key)
* `admin_user_id` (UUID, Foreign Key -> Users)
* `company_name` (VARCHAR, Indexed)
* `website` (VARCHAR)
* `description` (TEXT)
* `industry` (VARCHAR)
* `company_size` (VARCHAR / ENUM)
* `logo_url` (VARCHAR)
* `created_at` (TIMESTAMP)

### API Endpoints
* `GET /api/companies/:id`
  - Auth: Publicly readable.
  - Response: `200 OK` returning company profile details and array of active jobs.
* `POST /api/companies`
  - Auth: Employer token required.
  - Body: `{ company_name, website, description, industry, company_size }`
  - Response: `201 Created` with company ID.
* `PUT /api/companies/:id`
  - Auth: Employer token (must be authorized administrator of company ID).
  - Body: `{ company_name, website, description, industry, company_size }`
  - Response: `200 OK`.
* `POST /api/companies/:id/logo`
  - Content-Type: `multipart/form-data`
  - File: `logo` (Image format, max 2MB)
  - Response: `200 OK` returning `{ logo_url }`.

---

## 5. Acceptance Criteria (AC)
* **AC-1:** Modifying company profiles requires a token belonging to an employer associated with that specific company, rejecting others with `403 Forbidden`.
* **AC-2:** The public company page must load all active job listings from the database dynamically, excluding drafts or archived jobs.
* **AC-3:** Logos uploaded must be saved and served via CDN/Cloud Storage, deleting the previous logo file from disk/S3 on replacement.
* **AC-4:** Website input must validate format (must match standard URL formats `http://` or `https://`).
