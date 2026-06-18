# API Design — MOD-04 Interactive Quiz Feedback & Explanations

## Endpoint: POST /api/v1/quiz-feedback/setup

| Field | Value |
|------|------|
| Traces To | MOD-04 → FT-01 → US-006 → FR-07 |
| Auth | JWT / Role: Instructor |

### Request Schema
```json
{
  "topicId": "String (Required, Mongoose ObjectId)",
  "releaseRule": "String (Required, Enum: ['Always', 'OnPassing', 'AfterDeadline'])",
  "questions": [
    {
      "questionText": "String (Required)",
      "options": ["Array of Strings (Min 2)"],
      "correctOptionIndex": "Number (Required)",
      "explanation": "String (Optional, 10-1000 characters)"
    }
  ]
}
```

### Validation Rules
| Parameter | Rule | Error Status | Error Code |
| :--- | :--- | :--- | :--- |
| `topicId` | Must be a valid Mongoose ObjectId | 400 Bad Request | INVALID_TOPIC_ID |
| `releaseRule` | Must match Enum values | 400 Bad Request | INVALID_RELEASE_RULE |
| `questions` | Array must have at least 1 question card | 400 Bad Request | EMPTY_QUESTIONS_ARRAY |

### Response (Success)
Refer to Success Response envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L30-L54).
```json
{
  "id": "60d0fe4f5311236168a109d9",
  "topicId": "60d0fe4f5311236168a109cd",
  "releaseRule": "OnPassing",
  "questions": [
    {
      "questionText": "What is JWT secret used for?",
      "options": ["Symmetric encryption", "Signing tokens", "Payload hashing"],
      "correctOptionIndex": 1,
      "explanation": "The secret is used to generate the signature component of the JWT."
    }
  ]
}
```

### Response (Errors)
Refer to RFC7807 Error schema envelope in [api-schema_phase2.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/api-schema_phase2.md#L56-L104).
* **403 Forbidden**: `COURSE_OWNERSHIP_VIOLATION` (Requester does not own course).

### Business Rules
* The correct options index range is checked against options list sizes.

### Security
* Strip solution indicators and explanations from ordinary GET queries.

### Telemetry
* **Event Name**: `QUIZ_CONFIGURED`
* **Fields**: `quizId`, `topicId`, `releaseRule`

---

## Endpoint: POST /api/v1/quiz-feedback/submit

| Field | Value |
|------|------|
| Traces To | MOD-04 → FT-02 → US-006 → FR-08 |
| Auth | JWT / Role: Learner |

### Request Schema
```json
{
  "topicId": "String (Required, Mongoose ObjectId)",
  "answers": [
    {
      "questionId": "String (Required)",
      "selectedOptionIndex": "Number (Required)"
    }
  ]
}
```

### Validation Rules
| Parameter | Rule | Error Status | Error Code |
| :--- | :--- | :--- | :--- |
| `answers` | Array size must match total quiz questions | 400 Bad Request | INVALID_ANSWERS_COUNT |

### Response (Success)
```json
{
  "score": 80,
  "passed": true,
  "questions": [
    {
      "questionText": "What is JWT secret used for?",
      "options": ["Symmetric encryption", "Signing tokens", "Payload hashing"],
      "userAnswerIndex": 1,
      "correctOptionIndex": 1,
      "explanation": "The secret is used to generate the signature component of the JWT."
    }
  ]
}
```

### Security
* **Remediation Protocol Reference**: `Protocol C: Quiz Explanation Mask Integrity Failure` (in [kpis.md](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/phase2/kpis.md#L91-L96)).
