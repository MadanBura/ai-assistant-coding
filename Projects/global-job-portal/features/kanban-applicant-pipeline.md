# Feature Specification: Interactive Kanban Applicant Pipeline
## 1. Goal & Description
Build a Kanban-style workflow board for employers, giving hiring managers a visual interface to manage candidates. Dragging applicant cards across columns (Applied, Under Review, Interviewing, Offered, Rejected) updates the applicant's status instantly.

---

## 2. Scope
### In Scope
* Column-based Kanban board representing applicant stages:
  - `Applied` (Default)
  - `Under Review`
  - `Interviewing`
  - `Offered`
  - `Rejected`
* Drag-and-drop capability using frontend library (e.g., `react-beautiful-dnd`, `dnd-kit`, or native HTML5 DnD).
* Single card representation of applicant: Candidate Name, parsed top skills, matching score percentage, date applied.
* Clicking a card opens detailed side-drawer with candidate profile, work history, and resume viewer.
* Database synchronization of card movements with debounce/instant save.

### Out of Scope
* Custom columns creation (stages are fixed to the default 5 columns).
* Batch processing (dragging multiple candidate cards simultaneously).

---

## 3. User Flow & UI/UX Requirements
1. **Pipeline Access:** Employer clicks "Applicants Pipeline" on their active job listing.
2. **Board Rendering:** Board displays 5 columns with count totals in header (e.g., "Applied (12)", "Interviewing (3)").
3. **Card Interaction:** Recruiter reviews candidate information on a card.
4. **Drag Action:** Recruiter clicks and drags "Alex Smith" from `Applied` to `Under Review`.
   - UI shows smooth dragging placeholder indicator.
5. **Drop Trigger:** Drop completes:
   - Backend API is called immediately.
   - Column totals recalculate in real-time.
   - Card displays a subtle green loading/saving spinner, then checkmark.
6. **Detailed View:** Recruiter clicks a card, slide-out drawer appears on the right side of the screen displaying detailed bio, experience list, and a scrollable PDF frame embedding their resume file.

---

## 4. Technical Specifications & API Design

### Kanban Architecture
```
[React Dnd State] -> User Drags Card -> Drop -> optimistic UI update -> Fetch PATCH /api/applications/:id/status -> Status Updated (Success/Failure fallback)
```

### API Endpoints
* `GET /api/jobs/:job_id/applicants`
  - Auth: Owner employer token required.
  - Response: `200 OK`
    ```json
    {
      "job_id": "job-uuid",
      "stages": {
        "APPLIED": [
          { "application_id": "app-1", "candidate_name": "Alex Smith", "match_score": 85, "applied_at": "2026-06-02" }
        ],
        "UNDER_REVIEW": [],
        "INTERVIEWING": [],
        "OFFERED": [],
        "REJECTED": []
      }
    }
    ```
* `PATCH /api/applications/:id/status`
  - Auth: Owner employer token.
  - Body: `{ status: 'UNDER_REVIEW' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' }`
  - Response: `200 OK` with updated application details.

---

## 5. Acceptance Criteria (AC)
* **AC-1:** Dragging cards between columns must perform an optimistic UI update, immediately placing the card in the target column while the backend request resolves.
* **AC-2:** If the backend status update fails (e.g., network failure), the card must automatically revert back to its starting column and show a red error notification.
* **AC-3:** Recruiters must NOT be able to access the applicant pipeline or change statuses for jobs belonging to other companies/recruiters (`403 Forbidden`).
* **AC-4:** The side drawer candidate details must update dynamically when clicking different cards, avoiding caching leaks (showing previous candidate info).
