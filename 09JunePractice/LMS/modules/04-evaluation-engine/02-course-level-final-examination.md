# Feature: Course-Level Final Examination

## 1. Feature Overview
This feature implements the cumulative final exam for a course. The exam is locked and cannot be retrieved or submitted unless a student has completed 100% of the curriculum topics and quizzes. Exam questions are fetched only upon active request, and correct answer keys are never exposed client-side. Submitting the exam returns the grade and status. Passing marks the course status as complete, which updates the learner's record to unlock certificate eligibility.

## 2. Acceptance Criteria
*   **AC1:** The final exam is locked and cannot be retrieved or submitted unless all course topics and quizzes are completed.
*   **AC2:** Submitting the final exam (`POST /api/courses/:id/final-exam/submit`) returns the final score and passing status.
*   **AC3:** Passing the final exam (score >= passing threshold) marks the overall course as completed and triggers certificate eligibility.
*   **AC4:** Failing the final exam keeps the course completion status as incomplete, and certificate eligibility remains false.
*   **AC5:** Final exam questions are retrieved only on request, and correct answers are never sent to the client-side browser before submission.

## 3. UI/UX Requirements
*   **Final Exam Entry Page:** Displayed at the end of the Course Viewer curriculum navigation. If locked, shows a lock badge and list of pending incomplete topics. If unlocked, displays a "Start Final Exam" button.
*   **Exam Panel Interface:** Rendered as a single paginated or scrollable list of multiple-choice questions. Contains a "Submit Exam" button with a secondary double-check confirmation alert.
*   **Result Summary Banner:** Displays the final percentage grade, passing threshold, and pass/fail state.
    *   If Passed: Displays a green banner and unlocks a prominent "Generate Certificate" button.
    *   If Failed: Displays a red warning banner with a "Retake Exam" button.

## 4. API Endpoints Required
*   **Endpoint:** `GET /api/courses/:id/final-exam`
    *   **Description:** Retrieves final exam questions. Enforces completion locks. Excludes correct answers.
    *   **Headers:** `Authorization: Bearer <token>`
    *   **Response (200 OK):**
        ```json
        {
          "success": true,
          "data": {
            "passingThreshold": 75,
            "questions": [
              {
                "id": "fq1",
                "questionText": "What does express.Router() do?",
                "options": ["Creates a database schema", "Creates a modular route handler", "Launches the web server"]
              }
            ]
          }
        }
        ```
*   **Endpoint:** `POST /api/courses/:id/final-exam/submit`
    *   **Description:** Grades final exam answers, updates course completion, and enables certification flags.
    *   **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
    *   **Request Body:**
        ```json
        {
          "answers": [
            { "questionId": "fq1", "selectedOptionIndex": 1 }
          ]
        }
        ```
    *   **Response (200 OK - Passed):**
        ```json
        {
          "success": true,
          "score": 90,
          "passed": true,
          "passingThreshold": 75,
          "certificateEligible": true
        }
        ```

## 5. Data Models / Schema
### FinalExam Schema (Mongoose)
```javascript
const finalExamSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true
  },
  passingThreshold: {
    type: Number,
    required: true,
    default: 75 // percentage
  },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true } // Secrets kept server-side
  }]
}, { timestamps: true });
```

### FinalExamAttempt Schema (Mongoose)
```javascript
const finalExamAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
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
*   **Context Sync:** Successful exam submission updates `finalExamPassed: true` in the global `ProgressContext` state, instantly enabling the certificate download menu items.

## 7. Edge Cases
*   **API Direct Request Bypass:** A learner attempts to query `/api/courses/:id/final-exam` directly using tools like Postman before finishing the curriculum. The backend course-exam endpoint queries the user's progress tracking document, verifies that `progress.completedTopics.length !== totalCourseTopics`, and aborts execution, returning an HTTP 403 Forbidden status.
*   **Answer Key Leakage Prevention:** The database query inside the GET endpoint must explicitly project out the `questions.correctOptionIndex` field, guaranteeing that correct answers are never transmitted to the browser's network logs before submission.

## 8. Dependencies on Other Features
*   **Feature 3.2: Learner Progress Tracking:** Relies on completed topic arrays to verify course completion status.
*   **Feature 3.3: Sequential Access & Locking System:** Relies on lock verification logic.

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Course/CourseViewer.test.jsx` (Checks exam lock warnings, form selection options, submit checks, and result banners).
*   **Backend API Test File:** `tests/backend/integration/progress.test.js` (Checks lock checks, question query sanitization, answer grading logic, and final completion state updates).

## 10. Out of Scope for This Feature
*   Timed exams (e.g. "Auto-submit after 60 minutes").
*   Proctoring software checks or browser-tab shift detection.
*   Partial grading / short-answer question fields (only MCQs are supported).
