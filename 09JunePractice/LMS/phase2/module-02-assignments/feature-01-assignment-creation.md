# Feature 01: Assignment Creation

## 1. Purpose & Scope
Allows instructors to specify assignment criteria inside curriculum topics, setting max score limits, due date timestamps, instruction sheets, and attachment guidelines.

## 2. User Story Traceability
* **User Stories**: `US-004` (Manual Assignment Evaluation)
  * As an **Instructor**, I want to define practical assignment tasks for curriculum topics, so that students can complete project work.

## 3. FR Traceability
* **Functional Requirement**: `FR-04` (Part 1 - Creation)
  * The system shall allow instructors to define assignment models within any topic, setting max score and deadline parameters.

## 4. Inputs & Parameters
* **URL Parameter**: `topicId` (Topic ID)
* **Headers**: `Authorization: Bearer <token>`
* **JSON Body**:
```json
{
  "title": "String (Required)",
  "description": "String (Optional)",
  "maxScore": "Number (Default 100)",
  "dueDate": "Date String (Optional)",
  "referenceFileUrl": "String (URL format, Optional)"
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
    "title": "String",
    "description": "String",
    "maxScore": 100,
    "dueDate": "ISO Date String",
    "referenceFileUrl": "String"
  }
}
```

## 6. API Responsibilities
* Verify caller authentication and role (`Instructor`).
* Verify caller ownership over the course curriculum topic (`checkTopicOwnership`).
* Validate due date is in the future.
* Save the `Assignment` record to MongoDB.

## 7. Integration Boundaries
* **Backend Controller**: `courseController.createAssignment`
* **Mongoose Model**: `Assignment` model
* **Database**: MongoDB Atlas database

## 8. Error & Failure Scenarios
1. **Unauthorised Instructor Modifying Another Course**
   - *Status*: `403 Forbidden`
   - *Payload*: `{ "success": false, "message": "Only the owning instructor can modify this course." }`
2. **Invalid due date parameter** (e.g. date is in the past)
   - *Status*: `400 Bad Request`
   - *Payload*: `{ "success": false, "message": "Due date must be in the future." }`
3. **Reference URL validation failure**
   - *Status*: `400 Bad Request`
   - *Payload*: `{ "success": false, "message": "Invalid URL format for reference attachment." }`

## 9. Test Case References
* **TC-AS-01-01**: Should create assignment under owned topic successfully.
* **TC-AS-01-02**: Should fail creation if due date is in the past.
* **TC-AS-01-03**: Should reject request if requester is a Learner.

## 10. KPI References
* **SLA Targets**: Standard Write Routes (P95 < 300ms)
* **KPI-B04**: Weekly Assignment Submission Volume
