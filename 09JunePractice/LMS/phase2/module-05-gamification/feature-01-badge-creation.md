# Feature 01: Custom Badge Designer

## 1. Purpose & Scope
Allows instructors to create custom badge definitions linked to course milestones, specifying title, description, badge graphic URL, and triggers.

## 2. User Story Traceability
* **User Story**: `US-007` (Milestones Gamification Achievements - Editor requirements)
  * As an **Instructor**, I want to define specific achievements and upload badge graphics for my courses, so that I can reward learners for hitting performance milestones.

## 3. FR Traceability
* **Functional Requirement**: `FR-09`
  * The system shall support custom badge definitions linked to course criteria triggers (`CourseCompletion`, `PerfectQuizzes`, `FastTrack`).

## 4. Inputs & Parameters
* **URL Parameter**: `id` (Course ID)
* **Headers**: `Authorization: Bearer <token>`
* **JSON Body**:
```json
{
  "title": "String (Required)",
  "description": "String (Optional)",
  "iconUrl": "String (URL format, Required)",
  "triggerType": "Enum: ['CourseCompletion', 'PerfectQuizzes', 'FastTrack'] (Required)"
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
    "courseId": "MongooseObjectId",
    "title": "String",
    "description": "String",
    "iconUrl": "String",
    "triggerType": "String"
  }
}
```

## 6. API Responsibilities
* Verify caller authentication and role (`Instructor`).
* Verify instructor owns the course (`checkCourseOwnership`).
* Validate parameters and URL syntax.
* Save the `Badge` record to MongoDB.

## 7. Integration Boundaries
* **Backend Route**: `POST /api/courses/:id/badges`
* **Mongoose Model**: `Badge` model
* **Database**: MongoDB Atlas database

## 8. Error & Failure Scenarios
1. **Invalid Trigger Type**
   - *Status*: `400 Bad Request`
   - *Payload*: `{ "success": false, "message": "Invalid trigger type." }`
2. **Missing Badge Title or Icon URL**
   - *Status*: `400 Bad Request`
   - *Payload*: `{ "success": false, "message": "Title and Icon URL are required." }`
3. **Course Ownership Violation**
   - *Status*: `403 Forbidden`
   - *Payload*: `{ "success": false, "message": "Access denied. Only the course instructor can create badges." }`

## 9. Test Case References
* **TC-GM-01-01**: Should create custom badge successfully.
* **TC-GM-01-02**: Should reject requests with invalid trigger types.
* **TC-GM-01-03**: Should reject request if caller lacks Instructor role.

## 10. KPI References
* **SLA Targets**: Standard Write Routes (P95 < 300ms)
* **KPI-B01**: Course Completion Rate Increase
