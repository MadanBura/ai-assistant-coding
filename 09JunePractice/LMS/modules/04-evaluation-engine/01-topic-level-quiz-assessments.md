# Feature: Topic-Level Quiz Assessments

## 1. Feature Overview
This feature allows learners to take quizzes at the end of specific topics. The backend manages quiz questions and compares submitted student answers against correct keys server-side. Submitting a quiz returns their score, pass/fail status, and the passing threshold. Passing marks the topic complete, triggering the unlocking of the next sequential topic. Failing blocks progress, leaving the next topic locked, but permits retakes while tracking all attempt logs.

## 2. Acceptance Criteria
*   **AC1:** Submitting a topic quiz (`POST /api/topics/:topicId/assessment/submit`) checks answers against the correct answers saved on the server.
*   **AC2:** Submitting a quiz returns a JSON response containing the learner's score, pass/fail status, and passing threshold.
*   **AC3:** If a learner achieves a score equal to or greater than the passing threshold, the topic is marked as complete, and the next topic is unlocked.
*   **AC4:** If a learner scores below the passing threshold, the topic remains incomplete, and the next topic remains locked.
*   **AC5:** Learners are allowed to submit a quiz multiple times (retakes), and each submission's score is recorded in MongoDB.

## 3. UI/UX Requirements
*   **Quiz Board View:** Renders inside the Course Viewer panel when a topic contains an assessment. Displays one multiple-choice question at a time with radio inputs for options, and navigation buttons ("Next", "Back").
*   **Grading Scoreboard Card:** Upon submission, locks form options and renders a score badge (e.g. `Score: 80% - PASSED` in green, or `Score: 50% - FAILED` in red).
*   **Next Action Buttons:**
    *   If Passed: Displays a prominent "Continue to Next Topic" button.
    *   If Failed: Displays a "Try Again" button to reload the quiz interface for a retake.
*   **Review Mode:** Displays which questions were answered incorrectly (without revealing correct answers, to maintain integrity for retakes).

## 4. API Endpoints Required
*   **Endpoint:** `GET /api/topics/:topicId/assessment`
    *   **Description:** Retrieves quiz questions. Excludes answer keys from response.
    *   **Headers:** `Authorization: Bearer <token>`
    *   **Response (200 OK):**
        ```json
        {
          "success": true,
          "data": {
            "passingThreshold": 70,
            "questions": [
              {
                "id": "q1",
                "questionText": "What hook is used to perform side effects in React?",
                "options": ["useState", "useEffect", "useContext", "useReducer"]
              }
            ]
          }
        }
        ```
*   **Endpoint:** `POST /api/topics/:topicId/assessment/submit`
    *   **Description:** Grades quiz answers and updates progress.
    *   **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
    *   **Request Body:**
        ```json
        {
          "answers": [
            { "questionId": "q1", "selectedOptionIndex": 1 }
          ]
        }
        ```
    *   **Response (200 OK - Passed):**
        ```json
        {
          "success": true,
          "score": 100,
          "passed": true,
          "passingThreshold": 70,
          "progressPercent": 60
        }
        ```
    *   **Response (200 OK - Failed):**
        ```json
        {
          "success": true,
          "score": 0,
          "passed": false,
          "passingThreshold": 70,
          "progressPercent": 40
        }
        ```

## 5. Data Models / Schema
### Quiz Schema (Mongoose)
```javascript
const quizSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
    unique: true
  },
  passingThreshold: {
    type: Number,
    required: true,
    default: 70 // percentage
  },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true } // Secret key kept on DB
  }]
}, { timestamps: true });
```

### QuizAttempt Schema (Mongoose)
```javascript
const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  }
}, { timestamps: true });
```

## 6. State Management Notes
*   **Local Component State:** Keeps track of the current question index (`currentQuestionIndex`) and selected option choices (`selectedAnswers: { [qId]: index }`).
*   **Progress Context Refresh:** Success responses return updated course progress percentages, which are pushed to the global `ProgressContext` to refresh course navigation instantly.

## 7. Edge Cases
*   **Faked Client Submissions:** A malicious client attempts to send `{ passed: true, score: 100 }` directly in the payload. The API must verify answers server-side against the `Quiz` schema's `correctOptionIndex` records, ignoring client-side grading assertions entirely.
*   **Internet Interruption Mid-Submit:** If connection drops during submit processing, the request will fail. Re-submitting the same payload must be supported securely.

## 8. Dependencies on Other Features
*   **Feature 3.2: Learner Progress Tracking:** Relies on the Progress model to update completed arrays and recalculate overall percentages.
*   **Feature 3.3: Sequential Access & Locking:** The GET endpoint checks that the topic itself is unlocked before returning quiz questions.

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Course/CourseViewer.test.jsx` (Checks quiz rendering, radio select behavior, grading layouts, and next-topic buttons).
*   **Backend API Test File:** `tests/backend/integration/progress.test.js` (Checks grading answer accuracy, score returns, progress update executions, and attempt log writes).

## 10. Out of Scope for This Feature
*   Timer limits on quizzes (e.g. "complete in 10 minutes").
*   Instructors creating customized question types (only standard Multiple-Choice Questions are supported).
