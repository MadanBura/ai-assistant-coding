# API Design — MOD-05 Gamification and Custom Badges

## Endpoint: POST /api/v1/gamification/badges

| Field | Value |
|------|------|
| Traces To | MOD-05 → FT-01 → US-007 → FR-09 |
| Auth | JWT / Role: Instructor |

### Request Schema
```json
{
  "courseId": "String (Required, Mongoose ObjectId)",
  "title": "String (Required, 3-50 characters)",
  "description": "String (Optional, 10-250 characters)",
  "iconUrl": "String (Required, valid image URL format)",
  "triggerType": "String (Required, Enum: ['CourseCompletion', 'PerfectQuizzes', 'FastTrack'])"
}
```

### Validation Rules
| Parameter | Rule | Error Status | Error Code |
| :--- | :--- | :--- | :--- |
| `courseId` | Must be a valid Mongoose ObjectId | 400 Bad Request | INVALID_COURSE_ID |
| `title` | Length must be between 3 and 50 characters | 400 Bad Request | INVALID_TITLE_LENGTH |
| `iconUrl` | Must be a valid HTTP/HTTPS image URL | 400 Bad Request | INVALID_ICON_URL |
| `triggerType` | Must match trigger type Enum values | 400 Bad Request | INVALID_TRIGGER_TYPE |

### Response (Success)
Refer to Success Response envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L30-L54).
```json
{
  "id": "60d0fe4f5311236168a109d1",
  "courseId": "60d0fe4f5311236168a109ca",
  "title": "Speed Demon",
  "description": "Complete all modules within 7 days of enrollment.",
  "iconUrl": "https://s3.amazonaws.com/lms/badges/speed.png",
  "triggerType": "FastTrack"
}
```

### Response (Errors)
Refer to RFC7807 Error schema envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L56-L104).
* **403 Forbidden**: `COURSE_OWNERSHIP_VIOLATION` (Requester does not own course).

### Security
* Enforce input validations to prevent XSS in `iconUrl` and `title` paths.

### Telemetry
* **Event Name**: `BADGE_DESIGN_CREATED`
* **Fields**: `badgeId`, `courseId`, `triggerType`

---

## Endpoint: GET /api/v1/gamification/badges

| Field | Value |
|------|------|
| Traces To | MOD-05 → FT-02 → US-007 → FR-10 |
| Auth | JWT / Role: Learner |

### Request Schema
* Headers: `Authorization: Bearer <token>`
* Refer to Pagination in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L106-L125).

### Response (Success)
```json
[
  {
    "badgeId": {
      "id": "60d0fe4f5311236168a109d1",
      "title": "Speed Demon",
      "description": "Complete all modules within 7 days of enrollment.",
      "iconUrl": "https://s3.amazonaws.com/lms/badges/speed.png"
    },
    "unlockedAt": "2026-06-18T14:00:00.000Z"
  }
]
```

### Business Rules
* The system evaluates achievement criteria asynchronously inside database transaction middleware pipelines.
* **Remediation Protocol Reference**: `Protocol D: Badge Trigger Latency Breach` (in [kpis.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/kpis.md#L97-L100)).
