# Feature: Instructor Progress & Performance Analytics

## 1. Feature Overview
This feature implements the performance tracking and analytics dashboard for instructors. Instructors can query aggregated and student-level metrics for their courses, including enrollment counts, completion statistics, quiz/exam averages, and a list of enrolled learners with their specific course completion percentages. The backend dynamically compiles this data from active enrollment records in MongoDB Atlas, strictly guarding access to course owners.

## 2. Acceptance Criteria
*   **AC1:** Retrieving instructor analytics dashboard data (`GET /api/courses/:id/analytics`) without an instructor role returns an HTTP 403 Forbidden status.
*   **AC2:** The analytics payload returns the total count of enrolled learners, completion rates, and assessment pass rates.
*   **AC3:** The response must return an array of learners enrolled in the course, along with their individual progress percentages.
*   **AC4:** The response must return average quiz and final exam scores for the course.
*   **AC5:** Analytics results must dynamically update when learners complete topics or submit assessments.

## 3. UI/UX Requirements
*   **Instructor Analytics Panel:** Renders when an instructor clicks "View Analytics" from their course dashboard list. Contains:
    *   **Summary Metric Cards:** Displays Total Enrolled Learners, Course Completion Rate (%), Average Quiz Score (%), and Average Final Exam Score (%).
    *   **Student Progress Table:** A responsive table showing Student Name, Student Email, Progress Percentage (Bootstrap progress bar inside a cell), and Course Completion Date (or "In Progress").
*   **Dynamic Reload:** A "Refresh Analytics" button that triggers a background GET request to fetch the latest values and re-animates charts or table rows.

## 4. API Endpoints Required
*   **Endpoint:** `GET /api/courses/:id/analytics`
    *   **Description:** Compiles course enrollment metrics and score analytics.
    *   **Headers:** `Authorization: Bearer <token>`
    *   **Response (200 OK):**
        ```json
        {
          "success": true,
          "data": {
            "totalEnrolled": 150,
            "completionRate": 65.5,
            "averageQuizScore": 82.3,
            "averageFinalExamScore": 79.1,
            "learners": [
              {
                "id": "60d0fe4f5311236168a109ca",
                "name": "Jane Doe",
                "email": "jane@example.com",
                "progressPercent": 100,
                "completedAt": "2026-06-11T12:00:00Z"
              }
            ]
          }
        }
        ```
    *   **Response (403 Forbidden - Not Course Owner or Role Invalid):**
        ```json
        {
          "success": false,
          "message": "Access denied. Only the course instructor can view analytics."
        }
        ```

## 5. Data Models / Schema
*   There are no dedicated database collections for this feature. All analytics are computed dynamically on query request by joining and aggregating the **User** (Feature 1.1), **Progress** (Feature 3.1), and **QuizAttempt / FinalExamAttempt** collections (Module 4) using MongoDB Aggregation pipelines.
*   **Aggregation Pipeline outline:**
    1.  Match `Progress` records matching `courseId`.
    2.  Lookup `User` details using `userId` to retrieve name and email.
    3.  Compute average progress percent.
    4.  Lookup related attempt documents to average final scores.

## 6. State Management Notes
*   **Local Component State:** The analytics view holds local states for `analyticsData` (the JSON payload), `isLoading`, and `error`.
*   **No Global Cache:** Because analytics data changes dynamically as students progress, the client fetches the payload on view mount and does not save analytics in a global store.

## 7. Edge Cases
*   **Bypassing Owner Restrictions:** The backend must explicitly verify that the requesting user's ID matches the course's `instructorId` from the database. Instructors are blocked from requesting analytics for courses they do not teach, returning an HTTP 403 Forbidden status.
*   **Large Cohorts Query Drag:** If a course has thousands of students, running heavy aggregation pipelines can block the database threads. We implement projection filters to pull only necessary keys, limiting connection strain.

## 8. Dependencies on Other Features
*   **Feature 2.1: Course Creation and Management:** Requires Course metadata records to verify ownership.
*   **Feature 3.2: Learner Progress Tracking:** Requires active student progress percentage tracking records.
*   **Module 4: Evaluation Engine:** Requires attempt scores to compute overall assessment averages.

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Dashboard/InstructorDashboard.test.jsx` (Checks analytics summary rendering, list rendering, and reload triggers).
*   **Backend API Test File:** `tests/backend/integration/analytics.test.js` (Checks endpoint security, aggregation pipeline math accuracy, role exceptions, and response structures).

## 10. Out of Scope for This Feature
*   Exporting analytics data to Excel or CSV spreadsheets.
*   Time-series graphs showing enrollment progress over months (only aggregate values are in scope).
*   Filtering analytics data by specific modules or individual topics (only course-level averages are in scope).
