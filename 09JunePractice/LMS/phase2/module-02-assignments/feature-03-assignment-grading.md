# Feature 03: Assignment Grading and Feedback

## 1. Purpose & Scope
Provides instructors with a submission management center where they review student projects, post grades/scores, enter feedback texts, and return annotated files.

## 2. User Story Traceability
* **User Story**: `US-004` (Manual Assignment Evaluation)
  * As an **Instructor**, I want to access a central dashboard of student submissions to grade them, add comments, and return corrected files, so that I can deliver detailed, actionable feedback to my students.

## 3. FR Traceability
* **Functional Requirement**: `FR-04`
  * The system shall provide instructors with a grading dashboard to input a score, write text feedback, and upload corrected files.

## 4. Inputs & Parameters
* **URL Parameter**: `submissionId` (Submission ID)
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Form Data**:
  * `grade`: Number (Required, scale of 0 to Assignment's `maxScore`)
  * `feedback`: String (Required)
  * `feedbackFile`: Binary file stream (Optional annotation file)

## 5. Outputs & Results
* **Success Status**: `200 OK`
* **JSON Payload**:
```json
{
  "success": true,
  "data": {
    "id": "MongooseObjectId",
    "status": "Graded",
    "grade": 95,
    "feedback": "String",
    "feedbackFileUrl": "String (URL/path, Optional)"
  }
}
```

## 6. API Responsibilities
* Verify caller authentication and role (`Instructor`).
* Verify instructor owns the course associated with the submission (`checkCourseOwnership`).
* Validate score is within 0 and maxScore limits.
* Save file payload and update Mongoose `Submission` record fields.

## 7. Integration Boundaries
* **Backend Route**: `POST /api/submissions/:submissionId/grade`
* **Multer Middleware**: Processes optional feedback file uploads.
* **Mongoose Model**: `Submission` model

## 8. Error & Failure Scenarios
1. **Invalid Grade Value** (Score exceeds max assignment points or is negative)
   - *Status*: `400 Bad Request`
   - *Payload*: `{ "success": false, "message": "Grade must be between 0 and assignment maximum score." }`
2. **Missing required fields** (e.g. empty feedback comments)
   - *Status*: `400 Bad Request`
   - *Payload*: `{ "success": false, "message": "Grade and feedback comments are required." }`
3. **Course Ownership violation** (Instructor attempts to grade a course they do not own)
   - *Status*: `403 Forbidden`
   - *Payload*: `{ "success": false, "message": "Only the owning instructor can grade submissions." }`

## 9. Test Case References
* **TC-AS-03-01**: Should grade submission successfully with valid score and comments.
* **TC-AS-03-02**: Should reject grading if score exceeds maximum limits.
* **TC-AS-03-03**: Should reject grading request if instructor does not own the course.

## 10. KPI References
* **KPI-F04**: Grading Turnaround Latency (Target: < 48 hours)
* **SLA Targets**: Standard Write Routes (P95 < 300ms)
