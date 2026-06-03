# Feature Specification: Rich Task/Issue Editor

## 1. Executive Summary & Value Proposition
Clear task criteria reduce miscommunication and help developers execute faster. This feature implements a detailed issue editor inside an overlay modal. The editor allows team members to write formatted Markdown descriptions, attach image/document files, track nested checklists, and adjust task metadata (priority, assignee, story points).

---

## 2. Target User Stories
* **Story 1:** As a QA Engineer, I want to describe a bug using code blocks and lists in Markdown, so developers can reproduce it easily.
* **Story 2:** As a Designer, I want to upload mockups and drag-and-drop screenshots directly into the task editor so the development team has visual references.
* **Story 3:** As a Developer, I want to create a checklist inside a task to track incremental progress, seeing the checklist completion count update dynamically.

---

## 3. Detailed Functional Scope

### 3.1. Markdown Editor
* Uses a lightweight Markdown renderer (e.g. `marked` or a visual WYSIWYG editor like Milkdown/ToastUI).
* Supports code highlighting, lists, bold/italic, header tags, blockquotes, and tables.
* Tab-switched layouts: "Edit" mode vs. "Preview" mode.

### 3.2. Checklists
* Users can add checklist items within the task scope.
* Each item has a checkbox and description text.
* Dynamically calculates progress metrics shown on the card (e.g. "3/5 subtasks").

### 3.3. File Uploads & Image Attachments
* Upload mechanism: Drag-and-drop files directly onto the editor canvas or click a dedicated upload button.
* Maximum upload limit is enforced: 15MB.
* Supported formats: Images (JPEG, PNG, WebP), PDFs, and text log files.
* Image attachments are rendered as visual thumbnails at the top of the details panel.

### 3.4. Task Details Management
* Edit sidebar panel managing issue metadata:
  * Assignee: Searchable team member list.
  * Reporter: Set to the creator by default, editable.
  * Priority: Urgent (red), High (orange), Medium (yellow), Low (blue).
  * Story Points input.

---

## 4. API Interface Design

### 4.1. Upload Attachment
* **Endpoint:** `POST /api/v1/issues/:issueId/attachments`
* **Headers:** `Content-Type: multipart/form-data`, `Authorization: Bearer <JWT>`
* **Request Body:** Form-data containing the `file` blob.
* **Response Body (201 Created):**
  ```json
  {
    "id": "e90fa820-2b1c-4b8c-811c-c9012a891b92",
    "fileName": "login-mockup.png",
    "url": "https://storage.pmtool.com/attachments/login-mockup.png",
    "sizeBytes": 2048500,
    "uploadedAt": "2026-06-03T22:11:52Z"
  }
  ```

### 4.2. Update Task Details
* **Endpoint:** `PATCH /api/v1/issues/:issueId`
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
  ```json
  {
    "title": "Fix login crash on iOS",
    "description": "Crash occurs when switching rapidly between screens.",
    "priority": "urgent",
    "assigneeId": "d748ad29-231a-4ab2-811c-b8471c26b2b9"
  }
  ```
* **Response Body (200 OK):**
  ```json
  {
    "id": "e9821c2a-928d-4ba3-81a1-9a7c88de0b18",
    "title": "Fix login crash on iOS",
    "description": "Crash occurs when switching rapidly between screens.",
    "priority": "urgent",
    "assigneeId": "d748ad29-231a-4ab2-811c-b8471c26b2b9",
    "updatedAt": "2026-06-03T22:11:52Z"
  }
  ```

---

## 5. UI/UX Specifications
* **Modal Overlay:** Large centered dialog with a dark semi-transparent background backdrop overlay. Clicking outside triggers an auto-save operation.
* **Responsive Grid:** Left column occupies 70% width for Title, description, checklists, and comments. Right sidebar column occupies 30% for task metadata dropdowns and active dates.

---

## 6. Acceptance Criteria & Verification

### Automated Verification
1. **Sanitization Test:** Input script tags into the Markdown input (e.g. `<script>alert('xss')</script>`). Assert that the parser sanitizes the DOM string and prevents execution.
2. **File Size Enforcement:** Try to send a `multipart/form-data` request with a file exceeding 15MB. Ensure the server responds with a `413 Payload Too Large` error.

### Manual Verification
1. Open a task modal, type a list and markdown code blocks in the description field, toggle to "Preview" mode, and confirm correct rendering.
2. Drag a PNG screenshot onto the modal. Confirm the upload spinner appears, and the thumbnail is added to the attachments area.
