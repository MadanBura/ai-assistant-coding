# Feature: Content & Resource Management (Videos, Notes, PDFs)

## 1. Feature Overview
This feature allows instructors to populate topics with learning resources. Supported resource types include video URLs (YouTube, Vimeo, AWS S3), text-based markdown notes, and document/reference URLs (e.g. PDFs). The backend validates URL formats before saving. Resource edits update the database immediately, refreshing live views on the learner's dashboard.

## 2. Acceptance Criteria
*   **AC1:** Adding a resource to a topic requires a Resource Type (Video, Notes, Document, Reference) and the resource content or URL; otherwise, returns an HTTP 400 Bad Request status.
*   **AC2:** Video resources must validate that the provided link is a valid URL format (e.g., YouTube, Vimeo, S3), returning an HTTP 400 Bad Request status on failure.
*   **AC3:** Notes content supports rich markdown text, and retrieving the topic content returns the exact markdown string.
*   **AC4:** Document links (like PDFs) must validate as a valid absolute URL, returning an HTTP 400 Bad Request status on failure.
*   **AC5:** Changing or updating a resource URL updates the database immediately and reflects on the learner's dashboard upon page refresh.

## 3. UI/UX Requirements
*   **Topic Content Panel:** The course catalog/viewer interface displays resources according to their type:
    *   **Videos:** Renders an HTML5 iframe/embed player (YouTube/Vimeo) or HTML5 `<video>` player.
    *   **Notes:** Renders compiled Markdown content directly.
    *   **Documents / References:** Displays a descriptive card with an external link button labeled "Open PDF" or "View Resource".
*   **Resource Editor Form:** Inside the Instructor portal, clicking a topic opens a form containing:
    *   Resource Type dropdown selection (Video, Notes, Document, Reference).
    *   Dynamic Input field: Textarea for Notes, or single-line URL input for Video/Document.
*   **Validation warnings:** Highlights URL inputs red and displays an warning text if the URL format does not match validation rules.

## 4. API Endpoints Required
*   **Endpoint:** `POST /api/topics/:topicId/resources`
    *   **Description:** Creates and attaches a resource to a topic.
    *   **Request Body:**
        ```json
        {
          "type": "Video",
          "url": "https://www.youtube.com/embed/dQw4w9WgXcQ"
        }
        ```
    *   **Response (201 Created):**
        ```json
        {
          "success": true,
          "data": {
            "id": "60d4ae4f5311236168a109cf",
            "topicId": "60d3ae4f5311236168a109cd",
            "type": "Video",
            "url": "https://www.youtube.com/embed/dQw4w9WgXcQ"
          }
        }
        ```
*   **Endpoint:** `PUT /api/resources/:id`
    *   **Description:** Updates an existing resource URL or notes content body.
    *   **Request Body (Markdown Update):**
        ```json
        {
          "type": "Notes",
          "content": "# Getting Started\nThis is basic markdown documentation."
        }
        ```
    *   **Response (200 OK):**
        ```json
        {
          "success": true,
          "data": {
            "id": "60d4be4f5311236168a109d0",
            "topicId": "60d3ae4f5311236168a109cd",
            "type": "Notes",
            "content": "# Getting Started\nThis is basic markdown documentation."
          }
        }
        ```

## 5. Data Models / Schema
### Resource Schema (Mongoose)
```javascript
const resourceSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Video', 'Notes', 'Document', 'Reference']
  },
  url: {
    type: String,
    // Required only for Video, Document, and Reference
    validate: {
      validator: function(v) {
        if (this.type === 'Notes') return true;
        // Standard URL check
        return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
      },
      message: 'Must be a valid URL format'
    }
  },
  content: {
    type: String
    // Holds Markdown text; required only if type === 'Notes'
  }
}, { timestamps: true });
```

## 6. State Management Notes
*   **Active Course View Context:** Frontend loads resource data inside the `CourseViewer` view. Clicking a topic fetches the topic resources and stores them in local component state.
*   **Markdown Rendering Helper:** The frontend uses a standard markdown rendering library (e.g. `react-markdown`) to render text blocks.

## 7. Edge Cases
*   **Malformed Embedded Links:** If an instructor provides a standard watch URL instead of an embed URL (e.g. `youtube.com/watch?v=id` vs `youtube.com/embed/id`), the backend or frontend sanitizes and formats the link to prevent rendering failures inside the iframe.
*   **Empty Notes Content:** If Type is set to "Notes", the database enforces that the `content` field cannot be null or empty, returning a 400 validation error.

## 8. Dependencies on Other Features
*   **Feature 2.2: Curriculum Design (Modules & Topics):** Requires Topic records to exist to bind resources.

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Course/CourseViewer.test.jsx` (Checks rendering of iframes, markdown conversion boxes, and external resource link tags).
*   **Backend API Test File:** `tests/backend/integration/course.test.js` (Checks resource validation codes, URL regex filters, notes validation constraints, and immediate DB save results).

## 10. Out of Scope for This Feature
*   Accepting raw media file uploads (no MP4/PDF files saved directly to server local directories or MongoDB Atlas).
*   Video completion percentage tracking (only marking the topic complete is handled in Module 3).
