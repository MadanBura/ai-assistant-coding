# Feature: Course Creation and Management

## 1. Feature Overview
This feature allows Instructors/Admins to create and edit high-level courses. A Course acts as the parent container for modules, topics, resources, and assessments. It records general metadata including Title, Description, and Category. The feature restricts creation, editing, and deletion authorities to authorized Instructor accounts and cascades deletion events to delete associated student enrollment tracking records.

## 2. Acceptance Criteria
*   **AC1:** Attempting to create a course without an Instructor/Admin token returns an HTTP 403 Forbidden status.
*   **AC2:** Submitting course creation without Title, Description, or Category returns an HTTP 400 Bad Request status.
*   **AC3:** Successful course creation by an authorized user returns an HTTP 201 Created status and the course object with a unique course ID.
*   **AC4:** Instructors can update course metadata via `PUT /api/courses/:id`, returning an HTTP 200 OK status.
*   **AC5:** Deleting a course via `DELETE /api/courses/:id` removes the course metadata and cascades to delete all associated enrollment tracking data.

## 3. UI/UX Requirements
*   **Instructor Dashboard Portal:** An "Instructor Portal" view showing a table/grid of courses created by the active user with action buttons (Edit, Delete, View Analytics).
*   **Course Creator Form:** Clean Bootstrap card form containing Name/Title (input text), Category (select option dropdown), and Description (textarea).
*   **Submit Feedback:** Form checks for empty inputs and highlights fields. Disables the submit button while loading.
*   **Delete Confirmation:** Deleting a course prompts a Bootstrap confirmation modal warning the instructor that this action cannot be undone and will delete student enrollments.

## 4. API Endpoints Required
*   **Endpoint:** `POST /api/courses`
    *   **Description:** Creates a new course. Restricted to Instructors.
    *   **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
    *   **Request Body:**
        ```json
        {
          "title": "Introduction to React 19",
          "description": "Learn the fundamentals of React 19.",
          "category": "Software Engineering"
        }
        ```
    *   **Response (201 Created):**
        ```json
        {
          "success": true,
          "data": {
            "id": "60d1fe4f5311236168a109cb",
            "title": "Introduction to React 19",
            "description": "Learn the fundamentals of React 19.",
            "category": "Software Engineering",
            "instructorId": "60d0fe4f5311236168a109ca"
          }
        }
        ```
*   **Endpoint:** `PUT /api/courses/:id`
    *   **Description:** Updates course metadata. Restricted to owning Instructor.
    *   **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
    *   **Request Body:**
        ```json
        {
          "title": "Advanced React 19 Guide",
          "description": "Mastering concurrent UI render patterns."
        }
        ```
    *   **Response (200 OK):**
        ```json
        {
          "success": true,
          "data": {
            "id": "60d1fe4f5311236168a109cb",
            "title": "Advanced React 19 Guide",
            "description": "Mastering concurrent UI render patterns.",
            "category": "Software Engineering"
          }
        }
        ```
*   **Endpoint:** `DELETE /api/courses/:id`
    *   **Description:** Deletes a course and cascades to erase progress documents. Restricted to owning Instructor.
    *   **Headers:** `Authorization: Bearer <token>`
    *   **Response (200 OK):**
        ```json
        {
          "success": true,
          "message": "Course and associated progress records deleted successfully"
        }
        ```

## 5. Data Models / Schema
### Course Schema (Mongoose)
```javascript
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });
```

## 6. State Management Notes
*   **Local UI Form State:** Manages input text values and validations.
*   **Instructor Courses State:** Loaded on course dashboard mount; stored in local component state as an array of courses. Remounting or saving triggers an API refetch.

## 7. Edge Cases
*   **Unauthorized Access Hack:** A Learner attempts to hit `POST /api/courses` directly via Postman. The backend validation middleware (`verifyRole('Instructor')`) intercepts and returns a 403 Forbidden error.
*   **Cross-Instructor Modification:** Instructor A tries to modify a course owned by Instructor B. The backend course controllers verify `course.instructorId.toString() === req.user.id`, returning a 403 status if they differ.
*   **Cascading Orphan Data:** When a course is deleted, orphaned enrollments and progress documents must be deleted in a database transaction or bulk execution to prevent DB memory leaks.

## 8. Dependencies on Other Features
*   **Feature 1.1 & 1.2: Authentication & User Login:** Requires active token logic and role validation parameters.

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Course/CourseCreator.test.jsx` (Checks metadata input rendering, submit validation alerts, and confirmation dialog triggers).
*   **Backend API Test File:** `tests/backend/integration/course.test.js` (Checks creation role guards, missing field rejections, course record modifications, and cascade deletion executions).

## 10. Out of Scope for This Feature
*   Designing course curricula (Modules/Topics) or uploading files (handled in 2.2 and 2.3).
*   Course publishing toggles (draft vs active states).
*   Assigning co-instructors or teaching assistants to courses.
