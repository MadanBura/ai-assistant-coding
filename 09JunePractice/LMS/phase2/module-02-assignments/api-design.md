# API Design — MOD-02 Assignment Grading & Feedback Portal

## Endpoint: POST /api/v1/assignments

| Field | Value |
|------|------|
| Traces To | MOD-02 → FT-01 → US-004 → FR-04 |
| Auth | JWT / Role: Instructor |

### Request Schema
```json
{
  "topicId": "String (Required, Mongoose ObjectId)",
  "title": "String (Required, 3-100 characters)",
  "description": "String (Optional, 10-1000 characters)",
  "maxScore": "Number (Default 100, Range 1-1000)",
  "dueDate": "String (Optional, ISO8601 Date String)",
  "referenceFileUrl": "String (Optional, URL format)"
}
```

### Validation Rules
| Parameter | Rule | Error Status | Error Code |
| :--- | :--- | :--- | :--- |
| `topicId` | Must be a valid Mongoose ObjectId | 400 Bad Request | INVALID_TOPIC_ID |
| `title` | Length must be between 3 and 100 characters | 400 Bad Request | INVALID_TITLE_LENGTH |
| `maxScore` | Must be an integer between 1 and 1000 | 400 Bad Request | INVALID_MAX_SCORE |
| `dueDate` | If provided, must be in the future | 400 Bad Request | INVALID_DUE_DATE |

### Response (Success)
Refer to Success Response envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L30-L54).
```json
{
  "id": "60d0fe4f5311236168a109cc",
  "topicId": "60d0fe4f5311236168a109cd",
  "title": "Build a REST API",
  "description": "Create a Node/Express app with 5 routes.",
  "maxScore": 100,
  "dueDate": "2026-06-25T18:00:00.000Z",
  "referenceFileUrl": "https://s3.amazonaws.com/lms/docs/rubric.pdf"
}
```

### Response (Errors)
Refer to RFC7807 Error schema envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L56-L104).
* **403 Forbidden**: `COURSE_OWNERSHIP_VIOLATION` (Requester does not own this curriculum course topic).
* **404 Not Found**: `TOPIC_NOT_FOUND`.

### Business Rules
* The system checks the topic's course ownership prior to creating assignments.

### Security
* **Rate Limits**: Max 10 requests per minute per IP.
* **Access Control**: Token and course ownership check.

### Telemetry
* **Event Name**: `ASSIGNMENT_CREATED`
* **Fields**: `assignmentId`, `topicId`, `maxScore`

### Test Cases
| TC-ID | Description | Expected |
| :--- | :--- | :--- |
| TC-AS-POST-01 | Instructor creates valid assignment | 201 Created + Payload |
| TC-AS-POST-02 | Instructor sets due date in past | 400 Bad Request |

---

## Endpoint: POST /api/v1/assignments/:id/submit

| Field | Value |
|------|------|
| Traces To | MOD-02 → FT-02 → US-003 → FR-03 |
| Auth | JWT / Role: Learner |

### Request Schema
* **Content-Type**: `multipart/form-data`
* Refer to File upload payload schema in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L154-L168).

### Validation Rules
| Parameter | Rule | Error Status | Error Code |
| :--- | :--- | :--- | :--- |
| `submissionFile` | Size must be less than 10MB | 413 Payload Too Large | FILE_TOO_LARGE |
| `submissionFile` | Extension must be PDF, ZIP, DOC, DOCX | 415 Unsupported Media Type | UNSUPPORTED_FILE_TYPE |
| `id` | Must be a valid Mongoose ObjectId | 400 Bad Request | INVALID_ASSIGNMENT_ID |

### Response (Success)
Refer to Success Response envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L30-L54).
```json
{
  "id": "60d0fe4f5311236168a109ce",
  "assignmentId": "60d0fe4f5311236168a109cc",
  "studentId": "60d0fe4f5311236168a109cf",
  "submittedFileUrl": "/uploads/60d0fe4f5311236168a109ce_api_v1.zip",
  "submittedAt": "2026-06-18T12:00:00.000Z",
  "status": "Submitted"
}
```

### Response (Errors)
Refer to RFC7807 Error schema envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L56-L104).
* **403 Forbidden**: `LATE_SUBMISSION_BLOCKED` (DueDate exceeded) or `TOPIC_LOCKED` (Pre-requisites incomplete).

### Business Rules
* The API runs magic bytes checking via the Multer buffer to block malware.
* Evaluates sequential progress logs to verify the topic has been unlocked.

### Security
* **Access Control**: Enrollment verification and sequential lock check.
* **Remediation Protocol Reference**: `Protocol A: File Upload Latency or Failure Breach` (in [kpis.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/kpis.md#L79-L84)).

### Telemetry
* **Event Name**: `ASSIGNMENT_SUBMITTED`
* **Fields**: `submissionId`, `assignmentId`, `fileSize`

---

## Endpoint: POST /api/v1/submissions/:id/grade

| Field | Value |
|------|------|
| Traces To | MOD-02 → FT-03 → US-004 → FR-04 |
| Auth | JWT / Role: Instructor |

### Request Schema
```
multipart/form-data
- grade: Number (Required)
- feedback: String (Required)
- feedbackFile: Binary file (Optional)
```

### Validation Rules
| Parameter | Rule | Error Status | Error Code |
| :--- | :--- | :--- | :--- |
| `grade` | Must be a number between 0 and maxScore | 400 Bad Request | GRADE_OUT_OF_BOUNDS |
| `feedback` | Cannot be empty or blank | 400 Bad Request | MISSING_FEEDBACK |

### Response (Success)
```json
{
  "id": "60d0fe4f5311236168a109ce",
  "status": "Graded",
  "grade": 95,
  "feedback": "Excellent work on modular router architecture!",
  "feedbackFileUrl": "/uploads/feedback_60d0fe4f5311236168a109ce.pdf"
}
```

### Business Rules
* Transitions submission status from `Submitted` to `Graded`.
