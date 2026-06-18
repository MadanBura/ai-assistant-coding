# Feature 01: Quiz Question Rationale Setup

## 1. Purpose & Scope
Provides instructors with explanation and visibility inputs within the assessment builder. Instructors can attach step-by-step rationales to quiz questions.

## 2. User Story Traceability
* **User Story**: `US-006` (Explanation-based Assessment Review - Editor requirements)
  * As an **Instructor**, I want to include explanatory details with quiz questions, so that students can understand the conceptual reasoning behind the correct choices.

## 3. FR Traceability
* **Functional Requirement**: `FR-07`
  * The system shall allow instructors to attach an optional explanation string to each question in a quiz.

## 4. Inputs & Parameters
* **URL Parameter**: `courseId` or `topicId`
* **Headers**: `Authorization: Bearer <token>`
* **JSON Body Schema** (Inside quiz questions array):
```json
{
  "questions": [
    {
      "questionText": "String (Required)",
      "options": ["Array of Strings (Min 2)"],
      "correctOptionIndex": "Number (Required)",
      "explanation": "String (Optional, 10-1000 characters)"
    }
  ],
  "releaseRule": "Enum: ['Always', 'OnPassing', 'AfterDeadline'] (Default 'Always')"
}
```

## 5. Outputs & Results
* **Success Status**: `200 OK` or `201 Created`
* **JSON Payload**:
```json
{
  "success": true,
  "data": {
    "id": "MongooseObjectId",
    "topicId": "MongooseObjectId",
    "passingThreshold": 70,
    "releaseRule": "Always",
    "questions": [
      {
        "questionText": "String",
        "options": ["String"],
        "correctOptionIndex": 0,
        "explanation": "String"
      }
    ]
  }
}
```

## 6. API Responsibilities
* Verify requester authentication and role (`Instructor`).
* Validate course ownership checks.
* Run format validations (Ensuring `correctOptionIndex` matches options indices).
* Store the quiz payload containing explanations and release configurations.

## 7. Integration Boundaries
* **Backend Controller**: `courseController.createOrUpdateQuiz`
* **Assessment Editor Page**: `AssessmentBuilder.jsx`
* **Mongoose Models**: `Quiz` and `FinalExam` models

## 8. Error & Failure Scenarios
1. **Invalid Correct Option Index** (e.g. Index set to 5 but options array only has 4 items)
   - *Status*: `400 Bad Request`
   - *Payload*: `{ "success": false, "message": "Correct option index out of bounds." }`
2. **Missing required fields** (e.g. Empty question text)
   - *Status*: `400 Bad Request`
   - *Payload*: `{ "success": false, "message": "Question text is required." }`
3. **Invalid Release Rule** (Passing parameter value not in enum)
   - *Status*: `400 Bad Request`
   - *Payload*: `{ "success": false, "message": "Invalid release rule." }`

## 9. Test Case References
* **TC-QF-01-01**: Should create quiz questions with explanations and release rule values.
* **TC-QF-01-02**: Should validate option bounds checks correctly.
* **TC-QF-01-03**: Should reject quiz updates if requester is not the course instructor.

## 10. KPI References
* **SLA Targets**: Standard Write Routes (P95 < 300ms)
* **KPI-B05**: Retake Pass Rate Improvement
