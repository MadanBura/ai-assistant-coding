# Feature 02: Quiz Attempt Review with Explanations

## 1. Purpose & Scope
Displays question explanations and rationales to learners on assessment result screens after submission, matching active release rule filters.

## 2. User Story Traceability
* **User Story**: `US-006` (Explanation-based Assessment Review)
  * As an **Learner**, I want to view explanations and rationales behind correct and incorrect quiz answers, so that I can learn from my mistakes and improve my score on retakes.

## 3. FR Traceability
* **Functional Requirement**: `FR-08`
  * The system shall block or display quiz explanations to the user post-submission based on configured release rules.

## 4. Inputs & Parameters
* **URL Parameter**: `topicId` (Topic ID) or `courseId` (For Final Exam)
* **Headers**: `Authorization: Bearer <token>`
* **JSON Body**: (Used when querying review data post-attempt or during submission feedback response)
```json
{
  "attemptId": "MongooseObjectId (Required)"
}
```

## 5. Outputs & Results
* **Success Status**: `200 OK`
* **JSON Payload**:
```json
{
  "success": true,
  "data": {
    "score": 80,
    "passed": true,
    "questions": [
      {
        "questionText": "String",
        "options": ["String"],
        "userAnswerIndex": 1,
        "correctOptionIndex": 0,
        "explanation": "String (Present if release conditions met)"
      }
    ]
  }
}
```

## 6. API Responsibilities
* Verify requester authentication and enrollment.
* Check sequential unlock status.
* Check release rules in database:
  * If `Always`: Populates explanations.
  * If `OnPassing`: Populates explanations only if the attempt scored >= passingThreshold.
  * If `AfterDeadline`: Populates explanations only if the current date is past the course final deadline.
* Strip explanations from response if conditions are not met.

## 7. Integration Boundaries
* **Backend Route**: `POST /api/topics/:topicId/assessment/submit` and `GET /api/attempts/:attemptId`
* **Frontend Components**: [AssessmentResults.jsx](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/frontend/src/pages/Course/AssessmentResults.jsx)
* **Remediation Protocol Reference**: `Protocol C: Quiz Explanation Mask Integrity Failure`

## 8. Error & Failure Scenarios
1. **Invalid Attempt ID**
   - *Status*: `404 Not Found`
   - *Payload*: `{ "success": false, "message": "Attempt record not found." }`
2. **Access Violation** (Learner attempts to fetch an attempt details record belonging to another student)
   - *Status*: `403 Forbidden`
   - *Payload*: `{ "success": false, "message": "Access denied. You can only view your own attempts." }`
3. **Mismatched release criteria** (Attempted explanation fetch query when rules are not met)
   - *Status*: `200 OK`
   - *Payload*: Contains quiz score details, but `explanation` fields are returned as `null` or excluded.

## 9. Test Case References
* **TC-QF-02-01**: Should return rationales if release rule is set to `Always`.
* **TC-QF-02-02**: Should hide rationales if rule is `OnPassing` and learner fails the quiz.
* **TC-QF-02-03**: Should ensure pre-submission queries block explanations.

## 10. KPI References
* **KPI-F06**: Quiz Explanation Mask Integrity (Target: 100%)
* **KPI-B05**: Retake Pass Rate Improvement (Target: > 75%)
* **SLA Targets**: Standard Read Routes (P95 < 150ms)
