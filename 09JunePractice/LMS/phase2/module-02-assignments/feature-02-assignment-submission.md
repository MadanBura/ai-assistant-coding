# Feature 02: Assignment Submission

## 1. Purpose & Scope
Provides learners with an upload canvas on topic pages to submit single project files (PDF, ZIP, DOC up to 10MB) before the specified due date.

## 2. User Story Traceability
* **User Story**: `US-003` (Task File Submission)
  * As an **Learner**, I want to upload my homework files directly within the topic page before the deadline, so that my work can be validated and graded by the instructor.

## 3. FR Traceability
* **Functional Requirement**: `FR-03`
  * The system shall permit learners to upload PDF, ZIP, and Word Documents up to a maximum size limit of 10MB.

## 4. Inputs & Parameters
* **URL Parameter**: `assignmentId` (Assignment ID)
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Form Data**:
  * `submissionFile`: Binary file stream (Required)

## 5. Outputs & Results
* **Success Status**: `201 Created`
* **JSON Payload**:
```json
{
  "success": true,
  "data": {
    "id": "MongooseObjectId",
    "assignmentId": "MongooseObjectId",
    "studentId": "MongooseObjectId",
    "submittedFileUrl": "String (URL/path)",
    "submittedAt": "Timestamp",
    "status": "Submitted"
  }
}
```

## 6. API Responsibilities
* Verify caller authentication and role (`Learner`).
* Verify user enrollment in the parent course (`Progress.findOne`).
* Check sequential lock constraints (Verify all prior topics are completed).
* Run file payload filters checking extension (PDF, ZIP, DOC, DOCX) and size (< 10MB).
* Scan binary stream using magic bytes to block malicious execution payloads.
* Store file and save `Submission` record in MongoDB.

## 7. Integration Boundaries
* **Backend Route**: `POST /api/assignments/:assignmentId/submit`
* **Multer Middleware**: Enforces basic upload size and type constraints.
* **Remediation Protocol Reference**: `Protocol A: File Upload Latency or Failure Breach`
* **SLA Reference**: `File Upload/Multipart Routes` (P95 < 2000ms)

## 8. Error & Failure Scenarios
1. **File Too Large** (File size exceeds 10MB)
   - *Status*: `413 Payload Too Large`
   - *Payload*: `{ "success": false, "message": "File exceeds the 10MB size limit." }`
2. **Invalid File Type** (Student uploads `script.sh` or `malware.exe`)
   - *Status*: `415 Unsupported Media Type`
   - *Payload*: `{ "success": false, "message": "Invalid file type. Only PDF, ZIP, and Word Documents are allowed." }`
3. **Late Submission past due date**
   - *Status*: `403 Forbidden`
   - *Payload*: `{ "success": false, "message": "Submission deadline has passed." }`

## 9. Test Case References
* **TC-AS-02-01**: Should accept PDF files under 10MB before due date.
* **TC-AS-02-02**: Should reject uploads exceeding 10MB size limits.
* **TC-AS-02-03**: Should reject uploads past the due date deadline.
* **TC-AS-02-04**: Should reject unsupported files (e.g. `.exe`, `.png`).

## 10. KPI References
* **KPI-F03**: Assignment Upload Success Rate (Target: > 99.5%)
* **SLA Targets**: File Upload/Multipart Routes (P95 < 2s)
