# Feature 02: Milestone Badge Awards & User Profile Gallery

## 1. Purpose & Scope
Automatically evaluates user attempts and progress logs to trigger achievements. Unlocked achievements trigger UI toast notifications and populate the user profile achievements grid.

## 2. User Story Traceability
* **User Stories**:
  * `US-007` (Milestones Gamification Achievements)
    * As a **Learner**, I want to earn custom visual badges when I achieve learning milestones, so that I feel motivated to complete course requirements.

## 3. FR Traceability
* **Functional Requirement**: `FR-10`
  * The system shall display earned achievements in a visual grid on the learner's User Profile page.

## 4. Inputs & Parameters
* **URL Parameter**: `id` (For course completions or exam submittals) or API calls to fetch user profile logs.
* **Headers**: `Authorization: Bearer <token>`

## 5. Outputs & Results
* **Success Status**: `200 OK`
* **JSON Payload** (from User Profile Badges retrieve):
```json
{
  "success": true,
  "data": [
    {
      "badgeId": {
        "id": "MongooseObjectId",
        "title": "String",
        "description": "String",
        "iconUrl": "String"
      },
      "unlockedAt": "ISO Date String"
    }
  ]
}
```

## 6. API Responsibilities
* Automatically trigger badge criteria evaluations post-grading attempts.
* Evaluates conditions asynchronously to avoid performance blocking.
* Save uniqueness-guaranteed mappings in `UserBadge` collection.
* Return list of student achievements for the profile grid.

## 7. Integration Boundaries
* **Backend Hook**: Hooked into `submitQuizAssessment` and `submitFinalExam` database save pipelines.
* **Frontend Components**: `Profile.jsx`, `Navbar.jsx`, and global state notifications handler.
* **Remediation Protocol Reference**: `Protocol D: Badge Trigger Latency Breach`

## 8. Error & Failure Scenarios
1. **Duplicate Badge Unlock Attempt** (Criteria evaluated multiple times due to retakes)
   - *Status*: Silent Bypass / `409 Conflict` (Database level indexes `{ userId: 1, badgeId: 1 }` prevent duplication).
2. **Badge trigger computation timeout**
   - *Status*: `200 OK` returned for the exam submission, but the badge criteria execution runs asynchronously, updating badge records once resolved.
3. **Database connection failure during unlock logging**
   - *Status*: `500 Internal Server Error` (Logs failures for retry worker processes).

## 9. Test Case References
* **TC-GM-02-01**: Should unlock "Quiz Genius" badge upon scoring 100% on a quiz.
* **TC-GM-02-02**: Should display badge gallery grid on the profile page.
* **TC-GM-02-03**: Should ensure badge unlock check handles duplicate achievements without throwing exceptions to the user.

## 10. KPI References
* **KPI-F07**: Badge Unlock Trigger Latency (Target: < 500ms)
* **KPI-B01**: Course Completion Rate Increase
* **KPI-B02**: Platform Active Session Duration
* **SLA Targets**: Standard Read Routes (P95 < 150ms)
