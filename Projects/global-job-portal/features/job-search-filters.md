# Feature Specification: Job Search & Advanced Multi-Filter Board
## 1. Goal & Description
Provide candidates with an advanced job discovery page. This feature supports keyword search across job listings and multi-option filters (salary, job type, location type, experience level) resolving results instantly with pagination.

---

## 2. Scope
### In Scope
* Keyword search targeting job titles, company names, and descriptions.
* Filter bar:
  - Location Type: Remote, Hybrid, Onsite.
  - Job Type: Full-Time, Part-Time, Contract, Internship.
  - Experience Level: Junior, Mid, Senior, Lead.
  - Salary Range: Dynamic slider or input boxes.
* Sorting options: "Most Recent", "Highest Salary", "Best Match" (for logged-in candidates).
* Search indexing/optimized database queries to guarantee low latency.
* Client-side search state preservation (URL query parameters sync).

### Out of Scope
* Geographic distance calculations (e.g., "Find jobs within 10 miles of my GPS location").
* Save search queries / email alerts for searches - reserved for Phase 2.

---

## 3. User Flow & UI/UX Requirements
1. **Search Navigation:** User goes to `/jobs`.
2. **Search Input:** User types "React Developer" in the search bar.
3. **Filter Application:** User opens the filters panel:
   - Checks "Remote".
   - Selects "Full-time".
   - Moves the minimum salary slider to "$90,000".
4. **Instant Querying:** Results refresh as filters are clicked (debounce 300ms for text input).
5. **View Results:** The job list shows summary cards (Job Title, Company Logo, Location, Tags, Salary range, date posted).
6. **Navigation / Share:** Clicking a card displays details, updating the browser URL (e.g., `/jobs?search=react&location=remote`) so candidates can share the exact search results link.

---

## 4. Technical Specifications & API Design

### Search Query Logic (SQL example)
The API builds dynamic query filters:
```sql
SELECT jobs.*, companies.company_name, companies.logo_url 
FROM jobs 
JOIN companies ON jobs.company_id = companies.id 
WHERE jobs.status = 'PUBLISHED'
  AND (jobs.title ILIKE %keyword% OR jobs.description ILIKE %keyword%)
  AND jobs.job_type = ANY(:job_types)
  AND jobs.location_type = :location_type
  AND jobs.salary_max >= :min_salary
ORDER BY jobs.created_at DESC 
LIMIT :limit OFFSET :offset;
```

### API Endpoints
* `GET /api/jobs/search`
  - Query Parameters:
    - `q`: Search keyword.
    - `location_type`: `REMOTE` | `HYBRID` | `ONSITE`.
    - `job_type`: Comma-separated enum values.
    - `exp`: Comma-separated enums (`JUNIOR`,`MID`, etc.).
    - `salary_min`: Number.
    - `sort`: `RECENT` | `SALARY_DESC` | `MATCH_SCORE`.
    - `page`: Number (Default: 1).
    - `limit`: Number (Default: 20).
  - Response: `200 OK`
    ```json
    {
      "total_results": 142,
      "page": 1,
      "total_pages": 8,
      "jobs": [
        {
          "id": "uuid-1",
          "title": "Senior Frontend Engineer",
          "company_name": "Web Solutions Inc",
          "logo_url": "https://cdn.url/logo.png",
          "job_type": "FULL_TIME",
          "location": "Remote",
          "salary_min": 110000,
          "salary_max": 140000,
          "skills_required": ["React", "TypeScript", "Tailwind"],
          "created_at": "2026-06-01T10:00:00Z"
        }
      ]
    }
    ```

---

## 5. Acceptance Criteria (AC)
* **AC-1:** Search queries must exclude Draft and Archived job postings.
* **AC-2:** Search page loading and filter resolution p95 latency must be under 500ms.
* **AC-3:** If no matches are found, a user-friendly "No jobs found" illustration displays, suggesting to clear active filters.
* **AC-4:** Pagination must operate correctly, with the next/prev controls disabled when boundaries (first/last page) are reached.
