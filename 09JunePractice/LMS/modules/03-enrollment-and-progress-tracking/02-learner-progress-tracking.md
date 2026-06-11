# Feature: Learner Progress Tracking

## 1. Feature Overview
This feature tracks a learner's progression through an enrolled course. When a learner completes a topic (reads notes, watches a video, or completes an assessment), they invoke a progress-complete endpoint. The system marks the topic as completed, updates the list of completed topics, recalculates the overall course progress percentage (Completed Topics / Total Topics * 100), and returns the updated progress object.

## 2. Acceptance Criteria
*   **AC1:** Completing a topic resource (`POST /api/topics/:topicId/complete`) marks that topic as completed in the learner's progress record.
*   **AC2:** Completing a topic recalculates the overall course progress percentage (completed topics divided by total topics) and saves it in MongoDB.
*   **AC3:** Retrieving learner course progress (`GET /api/courses/:id/progress`) returns a breakdown of completed/incomplete topics and the overall percentage.
*   **AC4:** When a topic is completed, the system returns an HTTP 200 OK status along with the updated progress object.
*   **AC5:** A learner cannot mark a topic as complete if they have not met its pre-requisite requirements (e.g. preceding topic incomplete).

## 3. UI/UX Requirements
*   **Course Viewer Navigation:** A sidebar inside the Course Viewer displaying modules and topics. Completed topics display a green checkmark icon; current topics display an active icon; locked topics show a lock icon.
*   **Progress Indicators:** A Bootstrap progress bar at the top of the Course Viewer showing the learner's overall course completion percentage (e.g., `45% Complete`).
*   **Mark as Complete Action:** A "Mark as Completed" button at the bottom of standard topic pages (notes/videos). Clicking the button triggers the API call, animates the progress bar to its new value, and unlocks the next sidebar item.
*   **Conditional Lock states:** If the topic contains an assessment (quiz), the "Mark as Complete" button is hidden, forcing the user to complete and pass the quiz (see Module 4) to mark the topic complete.

## 4. API Endpoints Required
*   **Endpoint:** `GET /api/courses/:id/progress`
    *   **Description:** Retrieves progress metrics for the logged-in learner.
    *   **Headers:** `Authorization: Bearer <token>`
    *   **Response (200 OK):**
        ```json
        {
          "success": true,
          "data": {
            "progressPercent": 50,
            "completedTopics": [
              "60d3ae4f5311236168a109cd"
            ],
            "totalTopics": 2
          }
        }
        ```
*   **Endpoint:** `POST /api/topics/:topicId/complete`
    *   **Description:** Marks a topic as complete and recalculates percentage.
    *   **Headers:** `Authorization: Bearer <token>`
    *   **Response (200 OK):**
        ```json
        {
          "success": true,
          "data": {
            "progressPercent": 100,
            "completedTopics": [
              "60d3ae4f5311236168a109cd",
              "60d3be4f5311236168a109ce"
            ]
          }
        }
        ```

## 5. Data Models / Schema
*   Modifies the **Progress** schema defined in Feature 3.1.
*   Updates `completedTopics` (adds topic ID if not already present) and updates `progressPercent` using Mongoose hooks or service calculations:
    ```javascript
    const totalTopicsCount = await Topic.countDocuments({ courseId });
    const completedCount = progress.completedTopics.length;
    progress.progressPercent = Math.round((completedCount / totalTopicsCount) * 100);
    await progress.save();
    ```

## 6. State Management Notes
*   **Global Progress Context:** The client application uses `ProgressContext` to store the active course's completion percentage and completed topics list.
*   **Context Sync:** Calling the complete API returns the updated progress object, which immediately updates `ProgressContext` to refresh sidebar icons and progress bars across the UI.

## 7. Edge Cases
*   **Duplicate Completion Submissions:** A user clicks the "Mark as Complete" button multiple times. The controller uses MongoDB `$addToSet` rather than `$push` to prevent duplicate IDs in the `completedTopics` array and avoid inflating the progress percentage.
*   **Pre-requisite Bypass:** Attempting to mark Topic 3 as complete when Topic 2 is incomplete is blocked by backend validator logic, returning an HTTP 403 Forbidden status.

## 8. Dependencies on Other Features
*   **Feature 2.2: Curriculum Design (Modules & Topics):** Needs topic records to verify existence and calculate total counts.
*   **Feature 3.1: Course Discovery and Enrollment:** Requires the Progress schema and an existing enrollment record.

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Course/CourseViewer.test.jsx` (Checks sidebar completion checkmarks, progress bar state changes, and lock indicators).
*   **Backend API Test File:** `tests/backend/integration/progress.test.js` (Checks pre-requisite enforcement, percentage math algorithms, database array updates, and response formats).

## 10. Out of Scope for This Feature
*   Tracking duration of time spent on a topic.
*   Video auto-advance triggers (progress must be marked by clicking the button or passing the quiz).
