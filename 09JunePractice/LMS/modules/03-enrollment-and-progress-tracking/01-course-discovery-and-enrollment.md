# Feature: Course Discovery and Enrollment

## 1. Feature Overview
This feature allows learners to browse all active courses on the platform (Course Discovery) and enroll in them. Enrolling in a course creates a corresponding progress tracking document in MongoDB Atlas, initializing their completion progress to 0% and marking all modules and topics as incomplete. The API prevents unauthenticated enrollments and duplicate enrollments.

## 2. Acceptance Criteria
*   **AC1:** A learner can browse all active courses via `GET /api/courses` and receive an array of courses with an HTTP 200 OK status.
*   **AC2:** Attempting to enroll in a course (`POST /api/courses/:id/enroll`) without authentication returns an HTTP 401 Unauthorized status.
*   **AC3:** Enrolling in a course creates a progress tracker document in MongoDB with progress initialized to 0% and all topics marked as incomplete.
*   **AC4:** Enrolling in a course returns an HTTP 200 OK or 201 Created status with the newly created progress tracker object.
*   **AC5:** Enrolling in an already enrolled course returns an HTTP 400 Bad Request or 409 Conflict status.

## 3. UI/UX Requirements
*   **Course Catalog View:** A responsive grid interface displaying course cards (Title, Category, Description snippet). Contains a search bar or filter dropdown to sort by category.
*   **Course Detail Card:** Clicking a course card opens a detail view summarizing the curriculum (list of modules and topic titles).
*   **Enrollment Button:** Displays a prominent "Enroll in Course" button. If the learner is already enrolled, the button is disabled or changes to "Resume Course".
*   **Access Guards:** Clicking "Enroll" redirects unauthenticated users to `/login`. Registered instructors see the page but the "Enroll" action is disabled for them.

## 4. API Endpoints Required
*   **Endpoint:** `GET /api/courses`
    *   **Description:** Public endpoint to list all active courses.
    *   **Response (200 OK):**
        ```json
        {
          "success": true,
          "data": [
            {
              "id": "60d1fe4f5311236168a109cb",
              "title": "Introduction to React 19",
              "description": "Learn React fundamentals.",
              "category": "Software Engineering"
            }
          ]
        }
        ```
*   **Endpoint:** `POST /api/courses/:id/enroll`
    *   **Description:** Enrolls the logged-in learner.
    *   **Headers:** `Authorization: Bearer <token>`
    *   **Response (201 Created):**
        ```json
        {
          "success": true,
          "data": {
            "id": "60d5ae4f5311236168a109d1",
            "userId": "60d0fe4f5311236168a109ca",
            "courseId": "60d1fe4f5311236168a109cb",
            "progressPercent": 0,
            "completedTopics": [],
            "completedQuizzes": [],
            "finalExamStatus": "Locked"
          }
        }
        ```
    *   **Response (409 Conflict):**
        ```json
        {
          "success": false,
          "message": "Already enrolled in this course"
        }
        ```

## 5. Data Models / Schema
### Progress Schema (Mongoose)
```javascript
const progressSchema = new mongoose.Schema({
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
  progressPercent: {
    type: Number,
    required: true,
    default: 0
  },
  completedTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  completedQuizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic' // Refers to the topic containing the quiz
  }],
  finalExamPassed: {
    type: Boolean,
    required: true,
    default: false
  }
}, { timestamps: true });

// Compound unique index to prevent duplicate enrollments
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
```

## 6. State Management Notes
*   **Catalog Filtering:** React state captures search queries and active category selections, filtering the local courses array.
*   **Dashboard Sync:** When a user enrolls, the new course is added to their enrolled list in the local state, triggering a redirect to the `/dashboard/learner` portal.

## 7. Edge Cases
*   **Race Condition Double-Enrollment:** Clicking "Enroll" twice rapidly could trigger parallel mongo writes. The compound unique index `userId_1_courseId_1` on the Progress collection prevents duplicate records at the database level.
*   **Instructor Enrollment Attempt:** Instructors attempting to enroll in their own (or others') courses is blocked at the API layer with an HTTP 403 Forbidden status.

## 8. Dependencies on Other Features
*   **Feature 1.2: User Login:** Requires a valid JWT token to authenticate the enrollment request.
*   **Feature 2.1: Course Creation and Management:** Requires active course records to be present in MongoDB.

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Course/CourseCatalog.test.jsx` (Validates catalog list rendering, filter clicks, and enrollment button visibility/guards).
*   **Backend API Test File:** `tests/backend/integration/progress.test.js` (Asserts anonymous endpoint blocks, progress document instantiation details, and duplicate enrollment conflict handling).

## 10. Out of Scope for This Feature
*   E-commerce payment handling (all courses are free to join).
*   Un-enrollment or course cancellation triggers.
*   Course rating/reviews from enrolled learners.
