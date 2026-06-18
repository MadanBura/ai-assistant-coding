# Feature 02: Course Announcement Display and Dismissal

## 1. Purpose & Scope
Provides learners with visibility of course announcements through a global Navbar Notification tray and dynamic Urgent Alert banners. Learners can dismiss banners locally.

## 2. User Story Traceability
* **User Story**: `US-002` (Real-time Alert Visibility)
  * As a **Learner**, I want to view urgent course announcements immediately upon loading my dashboard, so that I don't miss critical date shifts or structural course updates.

## 3. FR Traceability
* **Functional Requirement**: `FR-02`
  * The system shall display `Urgent` announcements as flashing top-level banners on the learner's dashboard and course page.

## 4. Inputs & Parameters
* **URL Parameter**: `id` (Course ID)
* **Headers**: `Authorization: Bearer <token>`
* **Query Params**: `limit`, `priority` (Optional filtering)

## 5. Outputs & Results
* **Success Status**: `200 OK`
* **JSON Payload**:
```json
{
  "success": true,
  "data": [
    {
      "id": "MongooseObjectId",
      "title": "String",
      "content": "String",
      "priority": "String",
      "createdAt": "Timestamp"
    }
  ]
}
```

## 6. API Responsibilities
* Verify that the learner is enrolled in the specified course (`Progress.findOne`).
* Retrieve announcements matching the course ID sorted in descending chronological order.
* Return list filtering by active criteria.

## 7. Integration Boundaries
* **Backend Controller**: `courseController.getAnnouncements`
* **Frontend Components**: `Navbar.jsx`, `CourseViewer.jsx`, `CourseDetails.jsx`
* **Local Session State**: Keeps track of dismissed banner IDs locally so they don't persist on page reloads.

## 8. Error & Failure Scenarios
1. **Access Unenrolled Course** (Learner attempts to fetch announcements for a course they are not enrolled in)
   - *Status*: `403 Forbidden`
   - *Payload*: `{ "success": false, "message": "Access denied. You must enroll in this course to view announcements." }`
2. **Expired Session token** (Unauthenticated access)
   - *Status*: `401 Unauthorized`
   - *Payload*: `{ "success": false, "message": "Unauthorized access." }`
3. **Database Timeout** (Failed retrieval)
   - *Status*: `500 Internal Server Error`
   - *Payload*: `{ "success": false, "message": "Failed to retrieve announcements." }`

## 9. Test Case References
* **TC-AN-02-01**: Should retrieve list of announcements for enrolled learners.
* **TC-AN-02-02**: Should block announcement retrieval for unenrolled learners.
* **TC-AN-02-03**: Should ensure banner dismiss action removes banner from active viewport state.

## 10. KPI References
* **KPI-F01**: Announcement Display Latency (Target: < 100ms)
* **SLA Targets**: Standard Read Routes (P95 < 150ms)
