# Feature 02: Doubt Thread Management & Official Responses (Doubt Portal)

## 1. Purpose & Scope
Provides instructors with a central Q&A Alert dashboard. Instructors can answer doubts, edit answers, and pin selected resolutions as "Official Responses" which appear highlighted and pinned at the top of the thread.

## 2. User Story Traceability
* **User Stories**: `US-005` (Contextual Doubt Resolution - Response & Pinning logic)
  * As an **Instructor**, I want to view student doubts, answer them, and mark selected replies as official answers, so that the student and their peers get verified resolutions.

## 3. FR Traceability
* **Functional Requirement**: `FR-06`
  * The system shall allow instructors to reply to doubt threads and mark specific responses as "Official Responses".

## 4. Inputs & Parameters
* **URL Parameter**: `doubtId` (Doubt ID)
* **Headers**: `Authorization: Bearer <token>`
* **JSON Body**:
```json
{
  "content": "String (Required, 5-1000 characters)",
  "isOfficial": "Boolean (Default false)"
}
```

## 5. Outputs & Results
* **Success Status**: `200 OK`
* **JSON Payload**:
```json
{
  "success": true,
  "data": {
    "id": "MongooseObjectId",
    "isResolved": true,
    "answers": [
      {
        "repliedBy": "MongooseObjectId",
        "content": "String",
        "isOfficial": true,
        "createdAt": "Timestamp"
      }
    ]
  }
}
```

## 6. API Responsibilities
* Verify caller authentication and role (`Instructor`).
* Verify instructor owns the course associated with the doubt thread (`checkCourseOwnership` on the topic's module).
* Push new reply into `answers` sub-document array.
* Set `isResolved = true` and `isOfficial = true` (if requested).
* Sort answers ensuring `isOfficial: true` objects are returned at index 0.

## 7. Integration Boundaries
* **Backend Route**: `POST /api/doubts/:doubtId/answers`
* **Instructor Dashboard Component**: `DoubtAlertCenter`
* **Mongoose Model**: `Doubt` model

## 8. Error & Failure Scenarios
1. **Doubt ID not found**
   - *Status*: `404 Not Found`
   - *Payload*: `{ "success": false, "message": "Doubt thread not found." }`
2. **Access Violation** (Instructor reply attempted on a course they do not teach)
   - *Status*: `403 Forbidden`
   - *Payload*: `{ "success": false, "message": "Only the course instructor can mark official responses." }`
3. **Empty Answer Content**
   - *Status*: `400 Bad Request`
   - *Payload*: `{ "success": false, "message": "Answer text cannot be empty." }`

## 9. Test Case References
* **TC-DB-02-01**: Should post instructor answer successfully.
* **TC-DB-02-02**: Should pin answer as official and set resolved status.
* **TC-DB-02-03**: Should reject answer update if requester has Learner role.

## 10. KPI References
* **KPI-B03**: Doubt Resolution Rate (Target: > 85% in 24 hours)
* **SLA Targets**: Standard Write Routes (P95 < 300ms)
