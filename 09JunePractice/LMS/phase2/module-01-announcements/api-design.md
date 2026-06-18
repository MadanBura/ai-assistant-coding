# API Design — MOD-01 Unified Course Announcement System

## Endpoint: POST /api/v1/announcements

| Field | Value |
|------|------|
| Traces To | MOD-01 → FT-01 → US-001 → FR-01 |
| Auth | JWT / Role: Instructor |

### Request Schema
```json
{
  "courseId": "String (Required, 24-char Mongoose ObjectId)",
  "title": "String (Required, 3-100 characters)",
  "content": "String (Required, 10-1000 characters)",
  "priority": "String (Required, Enum: ['Info', 'Warning', 'Urgent'])"
}
```

### Validation Rules
| Parameter | Rule | Error Status | Error Code |
| :--- | :--- | :--- | :--- |
| `courseId` | Must be a valid MongoDB ObjectId | 400 Bad Request | INVALID_COURSE_ID |
| `title` | Length must be between 3 and 100 characters | 400 Bad Request | INVALID_TITLE_LENGTH |
| `content` | Length must be between 10 and 1000 characters | 400 Bad Request | INVALID_CONTENT_LENGTH |
| `priority` | Must match 'Info', 'Warning', or 'Urgent' | 400 Bad Request | INVALID_PRIORITY_LEVEL |

### Response (Success)
Refer to Success Response envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L30-L54).
```json
{
  "id": "60d0fe4f5311236168a109cb",
  "courseId": "60d0fe4f5311236168a109ca",
  "title": "Exam Schedule Shifted",
  "content": "The final exam is pushed to next Friday at 10:00 AM UTC.",
  "priority": "Urgent",
  "creatorId": "60d0fe4f5311236168a109c9",
  "createdAt": "2026-06-17T23:39:34.000Z"
}
```

### Response (Errors)
Refer to RFC7807 Error schema envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L56-L104).
* **403 Forbidden**: `COURSE_OWNERSHIP_VIOLATION` (Requester does not own the course).
* **404 Not Found**: `COURSE_NOT_FOUND`.

### Business Rules
* The system must verify the instructor teaches this course prior to saving.
* Saving an announcement automatically appends notifications database entries for enrolled learners.

### Security
* **Rate Limits**: Max 10 requests per minute per IP.
* **Sanitization**: Filter title and content against NoSQL injection patterns.
* **Access Control**: Role check (`Instructor`) and course ownership validation middleware.

### Telemetry
* **Event Name**: `ANNOUNCEMENT_CREATED`
* **Fields**: `announcementId`, `courseId`, `priority`

### Test Cases
| TC-ID | Description | Expected |
| :--- | :--- | :--- |
| TC-AN-POST-01 | Instructor creates urgent announcement | 201 Created + Payload |
| TC-AN-POST-02 | Non-owner instructor attempts to post | 403 Forbidden |
| TC-AN-POST-03 | Instructor sends invalid priority value | 400 Bad Request |

---

## Endpoint: GET /api/v1/announcements

| Field | Value |
|------|------|
| Traces To | MOD-01 → FT-02 → US-002 → FR-02 |
| Auth | JWT / Role: Learner or Instructor |

### Request Schema
* Query parameters: `courseId` (Required, String). Refer to Pagination schema in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L106-L125).

### Validation Rules
| Parameter | Rule | Error Status | Error Code |
| :--- | :--- | :--- | :--- |
| `courseId` | Must be a valid MongoDB ObjectId | 400 Bad Request | INVALID_COURSE_ID |

### Response (Success)
Refer to Success Response envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L30-L54).
```json
[
  {
    "id": "60d0fe4f5311236168a109cb",
    "title": "Exam Schedule Shifted",
    "content": "The final exam is pushed to next Friday at 10:00 AM UTC.",
    "priority": "Urgent",
    "createdAt": "2026-06-17T23:39:34.000Z"
  }
]
```

### Response (Errors)
Refer to RFC7807 Error schema envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L56-L104).
* **403 Forbidden**: `LEARNER_NOT_ENROLLED` (Student is not enrolled in this course).

### Business Rules
* If the requester role is `Learner`, the system checks the `Progress` collection to verify the student is enrolled in the course.

### Security
* **Rate Limits**: Max 100 requests per minute per IP.
* **Access Control**: Token verification and enrollment mapping check.

### Telemetry
* **Event Name**: `ANNOUNCEMENTS_FETCHED`
* **Fields**: `courseId`, `userId`

### Test Cases
| TC-ID | Description | Expected |
| :--- | :--- | :--- |
| TC-AN-GET-01 | Enrolled learner retrieves announcements | 200 OK + Payload |
| TC-AN-GET-02 | Unenrolled learner attempts access | 403 Forbidden |
