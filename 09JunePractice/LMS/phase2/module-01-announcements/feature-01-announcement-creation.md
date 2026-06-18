# Feature 01: Course Announcement Creation

## 1. Purpose & Scope
Allows instructors to compose and distribute course-wide announcements. This feature supports title, rich-text body, and priority classification (`Info`, `Warning`, `Urgent`).

## 2. User Story Traceability
* **User Story**: `US-001` (Course Broadcast Updates)
  * As an **Instructor**, I want to post course-wide announcements with different priority levels, so that I can quickly inform all enrolled learners about important schedule modifications or upcoming deadlines.

## 3. FR Traceability
* **Functional Requirement**: `FR-01`
  * The system shall allow instructors to create course announcements with Title, Content, and Priority (`Info`, `Warning`, `Urgent`).

## 4. Inputs & Parameters
* **URL Parameter**: `id` (Course ID)
* **Headers**: `Authorization: Bearer <token>`
* **JSON Body**:
```json
{
  "title": "String (Required, 3-100 characters)",
  "content": "String (Required, 10-1000 characters)",
  "priority": "Enum: ['Info', 'Warning', 'Urgent'] (Required)"
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
    "content": "String",
    "priority": "String",
    "creatorId": "MongooseObjectId",
    "createdAt": "Timestamp"
  }
}
```

## 6. API Responsibilities
* Verify that the requester is authenticated and has the role `Instructor`.
* Verify that the instructor is the owner of the specified course (`checkCourseOwnership`).
* Run schema validators ensuring Title, Content, and Priority match criteria.
* Create and save the `Announcement` document in MongoDB.

## 7. Integration Boundaries
* **Backend Controller**: `courseController.createAnnouncement`
* **Mongoose Model**: `Announcement` model
* **Database**: MongoDB Atlas database

## 8. Error & Failure Scenarios
1. **Unauthorised Role** (e.g. Learner attempts to post)
   - *Status*: `403 Forbidden`
   - *Payload*: `{ "success": false, "message": "Access denied. Only instructors can post announcements." }`
2. **Missing Input Fields** (e.g. Empty title)
   - *Status*: `400 Bad Request`
   - *Payload*: `{ "success": false, "message": "Title, content, and valid priority level are required." }`
3. **Invalid Course Reference** (e.g. Course ID does not exist)
   - *Status*: `404 Not Found`
   - *Payload*: `{ "success": false, "message": "Course not found." }`

## 9. Test Case References
* **TC-AN-01-01**: Should create announcement successfully with valid fields.
* **TC-AN-01-02**: Should reject announcement request if user has Learner role.
* **TC-AN-01-03**: Should reject request if required parameters are missing.

## 10. KPI References
* **KPI-F02**: Notification Delivery Success (Target: 100%)
* **SLA Targets**: Standard Write Routes (P95 < 300ms, Error rate < 0.05%)
