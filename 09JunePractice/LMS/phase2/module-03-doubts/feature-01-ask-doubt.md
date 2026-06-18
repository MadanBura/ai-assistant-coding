# Feature 01: In-context Doubt Submission (Doubt Drawer)

## 1. Purpose & Scope
Provides learners with a context-aware collapsible Q&A drawer beside lessons. Learners can write, search, and submit conceptual doubts without leaving the learning module.

## 2. User Story Traceability
* **User Story**: `US-005` (Contextual Doubt Resolution)
  * As an **Learner**, I want to submit doubt questions in a side panel next to the video lesson or reading resource, so that I can get clarification on complex concepts without losing my place in the course.

## 3. FR Traceability
* **Functional Requirement**: `FR-05`
  * The system shall render a collapsible doubt drawer next to learning content and allow learners to post text questions.

## 4. Inputs & Parameters
* **URL Parameter**: `topicId` (Topic ID)
* **Headers**: `Authorization: Bearer <token>`
* **JSON Body**:
```json
{
  "question": "String (Required, 5-500 characters)"
}
```

## 5. Outputs & Results
* **Success Status**: `201 Created`
* **JSON Payload**:
```json
{
  "success": true,
  "data": {
    "id": "MongooseObjectId",
    "topicId": "MongooseObjectId",
    "studentId": "MongooseObjectId",
    "question": "String",
    "answers": [],
    "isResolved": false,
    "createdAt": "Timestamp"
  }
}
```

## 6. API Responsibilities
* Verify requester is authenticated and has the role `Learner`.
* Verify user enrollment and check sequential unlock conditions for the topic.
* Validate input length constraints.
* Create and save the `Doubt` record to MongoDB.

## 7. Integration Boundaries
* **Backend Route**: `POST /api/topics/:topicId/doubts`
* **Frontend Component**: `DoubtDrawer` (nested in [CourseViewer.jsx](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/frontend/src/pages/Course/CourseViewer.jsx))
* **Remediation Protocol Reference**: `Protocol B: Doubt Drawer API Latency Breach`

## 8. Error & Failure Scenarios
1. **Accessing Locked Topic** (Learner attempts to post a doubt in a topic they haven't unlocked yet)
   - *Status*: `403 Forbidden`
   - *Payload*: `{ "success": false, "message": "Topic is locked." }`
2. **Empty Question Content**
   - *Status*: `400 Bad Request`
   - *Payload*: `{ "success": false, "message": "Question content cannot be empty." }`
3. **Database Write Failure**
   - *Status*: `500 Internal Server Error`
   - *Payload*: `{ "success": false, "message": "Failed to post doubt." }`

## 9. Test Case References
* **TC-DB-01-01**: Should post doubt under unlocked topic successfully.
* **TC-DB-01-02**: Should reject doubt post if topic is locked.
* **TC-DB-01-03**: Should reject empty query body payload.

## 10. KPI References
* **KPI-F05**: Doubt Thread Load Time (Target: P95 < 200ms)
* **SLA Targets**: Standard Write Routes (P95 < 300ms)
