# Feature: Curriculum Design (Modules & Topics)

## 1. Feature Overview
This feature allows instructors to construct a hierarchical course curriculum composed of Modules, which contain individual Topics. The modules and topics are structured in a defined sequential order. Instructors can insert modules, append topics within those modules, and adjust their order. The system stores chronological ordering index parameters for both modules and topics, enabling learners to retrieve curriculum elements in ascending chronological order.

## 2. Acceptance Criteria
*   **AC1:** Adding a module to an existing course requires a course ID and a Module Title; if successful, returns an HTTP 201 Created status.
*   **AC2:** Adding a topic under a module requires a Topic Title; if successful, returns an HTTP 201 Created status.
*   **AC3:** Attempting to add a module or topic to a course not owned by the requesting instructor returns an HTTP 403 Forbidden status.
*   **AC4:** Rearranging the order of topics or modules must update their chronological sequence indices in MongoDB and return an HTTP 200 OK status.
*   **AC5:** Retrieving course curriculum details (`GET /api/courses/:id`) returns modules and topics sorted in ascending order of their sequence indices.

## 3. UI/UX Requirements
*   **Course Builder Panel:** Drag-and-drop or button-controlled list builder within the Course Editor interface displaying Modules and their nested Topics.
*   **Add Module Action:** A button/modal to quickly input a Module Title and insert it at the end of the module sequence.
*   **Add Topic Action:** A form field within each Module card to quickly type and append a new Topic Title.
*   **Reordering Controls:** Interactive arrows (Up/Down buttons) beside each module and topic to increment/decrement their position index, instantly updating the layout structure.
*   **Chronological Order Rendering:** Ensures the course curriculum list displays modules and topics strictly according to their chronological index order.

## 4. API Endpoints Required
*   **Endpoint:** `POST /api/courses/:id/modules`
    *   **Description:** Creates a new module within a course.
    *   **Request Body:**
        ```json
        {
          "title": "Module 1: Getting Started",
          "sequenceIndex": 0
        }
        ```
    *   **Response (201 Created):**
        ```json
        {
          "success": true,
          "data": {
            "id": "60d2ae4f5311236168a109cc",
            "courseId": "60d1fe4f5311236168a109cb",
            "title": "Module 1: Getting Started",
            "sequenceIndex": 0
          }
        }
        ```
*   **Endpoint:** `POST /api/modules/:moduleId/topics`
    *   **Description:** Creates a new topic inside a module.
    *   **Request Body:**
        ```json
        {
          "title": "Topic 1.1: Environment Setup",
          "sequenceIndex": 0
        }
        ```
    *   **Response (201 Created):**
        ```json
        {
          "success": true,
          "data": {
            "id": "60d3ae4f5311236168a109cd",
            "moduleId": "60d2ae4f5311236168a109cc",
            "title": "Topic 1.1: Environment Setup",
            "sequenceIndex": 0
          }
        }
        ```
*   **Endpoint:** `PUT /api/courses/:id/curriculum/reorder`
    *   **Description:** Reorders modules and topics by updating sequence indices.
    *   **Request Body:**
        ```json
        {
          "modules": [
            { "id": "60d2ae4f5311236168a109cc", "sequenceIndex": 1 },
            { "id": "60d2be4f5311236168a109ce", "sequenceIndex": 0 }
          ]
        }
        ```
    *   **Response (200 OK):**
        ```json
        {
          "success": true,
          "message": "Curriculum sequence updated successfully"
        }
        ```

## 5. Data Models / Schema
### Module Schema (Mongoose)
```javascript
const moduleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  sequenceIndex: {
    type: Number,
    required: true
  }
}, { timestamps: true });
```

### Topic Schema (Mongoose)
```javascript
const topicSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  sequenceIndex: {
    type: Number,
    required: true
  }
}, { timestamps: true });
```

## 6. State Management Notes
*   **Local Component State:** The builder component holds a copy of the active curriculum state as a nested array.
*   **Optimistic Updates:** The UI can swap elements locally and trigger reordering requests in the background. If the request fails, the local state reverts and shows a Bootstrap warning message.

## 7. Edge Cases
*   **Curriculum Modification Ownership Guard:** Instructors are blocked from editing modules or topics on courses they do not own. The backend checks ownership of the course resource before permitting POST/PUT requests.
*   **Duplicate Sequence Indices:** If two topics end up with the same `sequenceIndex` due to network lag, secondary sorting by DB creation time is used, and the backend automatically recalculates indices sequentially.

## 8. Dependencies on Other Features
*   **Feature 2.1: Course Creation and Management:** Requires Course documents to map modules to a course container.

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Course/CourseBuilder.test.jsx` (Checks rendering sequence, insertion of modules/topics, and reordering clicks).
*   **Backend API Test File:** `tests/backend/integration/course.test.js` (Checks creation constraints, ownership validations, reordering index updates, and sorted retrieval validations).

## 10. Out of Scope for This Feature
*   Attaching video files, text resources, or quiz questions to topics (handled in 2.3 and Module 4).
*   Configuring complex conditional unlocking trees (only linear sequence is supported).
