# Feature: Sequential Access & Locking System

## 1. Feature Overview
This feature implements sequential learning path constraints. In any course, Module 1, Topic 1 is unlocked by default upon enrollment. Subsequent topics (Topic N) remain locked until the immediate predecessor (Topic N-1) is marked complete. The locking system is applied to modules as well, and is enforced at both the client UI layer (rendering lock icons and disabling navigation) and the backend API layer (blocking endpoint requests to retrieve resource data for locked topics).

## 2. Acceptance Criteria
*   **AC1:** Attempting to access topic details or resources for a locked topic returns an HTTP 403 Forbidden status with a "Topic is locked" message.
*   **AC2:** In any course, Module 1, Topic 1 is unlocked by default immediately upon enrollment.
*   **AC3:** Topic N is unlocked if and only if Topic N-1 is completed.
*   **AC4:** Modules are unlocked sequentially; Topic 1 of Module M is locked until the final Topic/Assessment of Module M-1 is completed.
*   **AC5:** Accessing a course's final examination page returns an HTTP 403 Forbidden status if any topic or quiz in the course is not marked as complete.

## 3. UI/UX Requirements
*   **Visual Locks:** Locked topics and modules inside the Course Viewer navigation sidebar display a lock icon (Bootstrap icons) and are styled gray. Hovering over a locked item displays a locked cursor.
*   **Route Protection:** Clicking a locked topic in the sidebar does not trigger route navigation.
*   **Direct URL Guards:** If a learner attempts to access a locked route via direct URL entry (e.g. `/course/:id/topic/:topicId`), the page renders a clean full-screen error state stating "This topic is locked. Please complete previous topics first."
*   **Final Exam Lock:** The final exam access block is styled with lock metrics and remains un-clickable until progress reaches 100% of topics.

## 4. API Endpoints Required
*   There are no dedicated endpoints for locks. Instead, sequential locking logic is built as database verification checks inside the resource retrieval endpoints:
    *   `GET /api/courses/:id/topics/:topicId`
        *   **Description:** Retrieves topic details. Enforces sequential check.
        *   **Headers:** `Authorization: Bearer <token>`
        *   **Response (403 Forbidden - Topic Locked):**
            ```json
            {
              "success": false,
              "message": "Topic is locked"
            }
            ```
    *   `GET /api/courses/:id/final-exam`
        *   **Description:** Retrieves final exam questions. Enforces 100% curriculum completion check.
        *   **Headers:** `Authorization: Bearer <token>`
        *   **Response (403 Forbidden - Course Incomplete):**
            ```json
            {
              "success": false,
              "message": "Final exam is locked until all curriculum topics are completed"
            }
            ```

## 5. Data Models / Schema
*   Queries the **Progress** schema (Feature 3.1) and **Topic / Module** sequence indices (Feature 2.2) to evaluate sequential eligibility:
    1.  Fetch the target topic's sequence index and module's sequence index.
    2.  Find all topics belonging to the course that have an index smaller than the target topic.
    3.  Assert that all of these preceding topic IDs are present in the user's `completedTopics` array.

## 6. State Management Notes
*   **Progress Context Integration:** The frontend uses the list of completed topics from the global `ProgressContext` to compute which topic IDs are unlocked, updating UI class names and click handlers dynamically.

## 7. Edge Cases
*   **Direct API Hacking:** A learner queries `/api/courses/:id/topics/:topicId` via custom scripts to fetch notes or video links of locked advanced topics. The backend controller must execute the sequential database check on every request, blocking data transmission and returning a 403 status.
*   **Course Structure Alteration:** If an instructor adds a new topic to Module 1 while a learner is in Module 2, the learner's progress percent drops, and subsequent items lock again until the new topic is completed. The locking system handles this structural consistency.

## 8. Dependencies on Other Features
*   **Feature 2.2: Curriculum Design:** Requires sequence indices on modules and topics.
*   **Feature 3.2: Learner Progress Tracking:** Requires the completed topics tracking database records.

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Course/CourseViewer.test.jsx` (Validates sidebar navigation clicks, locked error renders, and UI locks).
*   **Backend API Test File:** `tests/backend/integration/progress.test.js` (Checks endpoint access blocks, first topic initialization exception, module boundaries, and exam locking validation).

## 10. Out of Scope for This Feature
*   Allowing instructors to bypass locks for individual students (e.g. manually unlocking a topic).
*   Supporting branch learning trees (non-linear tracks).
