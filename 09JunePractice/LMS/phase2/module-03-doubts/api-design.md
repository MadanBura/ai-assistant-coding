# API Design — MOD-03 Topic-Specific Q&A & Doubt Resolver

## Endpoint: POST /api/v1/doubts

| Field | Value |
|------|------|
| Traces To | MOD-03 → FT-01 → US-005 → FR-05 |
| Auth | JWT / Role: Learner |

### Request Schema
```json
{
  "topicId": "String (Required, Mongoose ObjectId)",
  "question": "String (Required, 5-500 characters)"
}
```

### Validation Rules
| Parameter | Rule | Error Status | Error Code |
| :--- | :--- | :--- | :--- |
| `topicId` | Must be a valid Mongoose ObjectId | 400 Bad Request | INVALID_TOPIC_ID |
| `question` | Length must be between 5 and 500 characters | 400 Bad Request | INVALID_QUESTION_LENGTH |

### Response (Success)
Refer to Success Response envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L30-L54).
```json
{
  "id": "60d0fe4f5311236168a109d0",
  "topicId": "60d0fe4f5311236168a109cd",
  "studentId": "60d0fe4f5311236168a109cf",
  "question": "How do we write a Mongoose transaction hook?",
  "answers": [],
  "isResolved": false,
  "createdAt": "2026-06-18T13:00:00.000Z"
}
```

### Response (Errors)
Refer to RFC7807 Error schema envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L56-L104).
* **403 Forbidden**: `TOPIC_LOCKED` (Learner has not unlocked this sequential topic).

### Business Rules
* Users must be enrolled and have unlocked this topic chronologically to post.

### Security
* Filter parameters against NoSQL operators.
* **Remediation Protocol Reference**: `Protocol B: Doubt Drawer API Latency Breach` (in [kpis.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/kpis.md#L85-L90)).

### Telemetry
* **Event Name**: `DOUBT_CREATED`
* **Fields**: `doubtId`, `topicId`, `studentId`

---

## Endpoint: POST /api/v1/doubts/:id/answers

| Field | Value |
|------|------|
| Traces To | MOD-03 → FT-02 → US-005 → FR-06 |
| Auth | JWT / Role: Learner or Instructor |

### Request Schema
```json
{
  "content": "String (Required, 5-1000 characters)",
  "isOfficial": "Boolean (Default false)"
}
```

### Validation Rules
| Parameter | Rule | Error Status | Error Code |
| :--- | :--- | :--- | :--- |
| `content` | Length must be between 5 and 1000 characters | 400 Bad Request | INVALID_ANSWER_LENGTH |
| `isOfficial` | Only Instructors can set to true | 403 Forbidden | ILLEGAL_OFFICIAL_FLAG |

### Response (Success)
```json
{
  "id": "60d0fe4f5311236168a109d0",
  "isResolved": true,
  "answers": [
    {
      "repliedBy": "60d0fe4f5311236168a109c9",
      "content": "You can use connection.startSession() to execute transaction blocks.",
      "isOfficial": true,
      "createdAt": "2026-06-18T13:05:00.000Z"
    }
  ]
}
```

---

## Endpoint: GET /api/v1/doubts

| Field | Value |
|------|------|
| Traces To | MOD-03 → FT-01 → US-005 → FR-05 |
| Auth | JWT / Role: Learner or Instructor |

### Request Schema
* Query Parameter: `topicId` (Required, Mongoose ObjectId). Refer to Pagination in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L106-L125).

### Business Rules
* Official responses are sorted to appear first in the array.
