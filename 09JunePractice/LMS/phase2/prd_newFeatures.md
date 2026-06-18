# PRD — Learning Management System (LMS) Feature Enhancements

## 1. Problem Statement
The current Learning Management System (LMS) provides course structure, sequential unlocking, topic completions, and basic quizzes. However, it lacks collaborative, interactive, and feedback loops between instructors and learners:
1. **Inefficient Communication channels**: Instructors have no dedicated, real-time channel to broadcast course announcements (urgent changes, deadlines, or syllabus updates) directly to enrolled students.
2. **Absence of Practical Assignments**: Evaluation is limited to automated multiple-choice quizzes. Instructors cannot assign hands-on tasks, and learners cannot submit files (PDF, ZIP, DOC) for review, grading, or manual feedback.
3. **Fragmented Learning doubts**: When students hit roadblocks during notes or video lessons, they must use external channels. There is no contextual, topic-specific doubt resolution portal where instructors or peers can clarify questions in-place.
4. **Static Assessments**: Quizzes do not provide educational feedback. Learners do not see the rationale behind incorrect answers, and instructors cannot configure when answers/explanations should be released.
5. **Decreased Course Engagement**: Students lose motivation during longer courses. The platform lacks gamification rules, milestone goals, and achievements (custom badges) to drive course completion rates.

---

## 2. Solution Overview + Core Features (P0/P1/P2)
This release introduces five interactive modules built as extensions to the current system:

### P0 Features (Critical Path)
* **Unified Course Announcement System**:
  - Instructors can create rich-text announcements tagged with priority levels: `Info`, `Warning`, or `Urgent`.
  - Enrolled learners receive notifications in a global Navbar Bell tray.
  - `Urgent` announcements are pinned as flashing red banners at the top of the Course Details and Course Viewer pages until dismissed.
* **Assignment Grading & Feedback Portal**:
  - Instructors can create assignments within topics, setting description, max score, due date, and reference file attachments.
  - Learners can upload a single file (PDF, ZIP, DOC/DOCX, up to 10MB) per assignment.
  - Instructors grade submissions using a grading dashboard, recording a score, text comments, and optional annotated feedback files.

### P1 Features (High Priority)
* **Topic-Specific Q&A & Doubt Resolver**:
  - A collapsible side drawer on the Course Viewer page allowing learners to ask questions directly in context of a topic.
  - Search engine for students to browse previously resolved peer doubts.
  - Instructors can view a central dashboard of unresolved doubts, answer them, and mark select responses as "Official Responses".
* **Interactive Quiz Feedback & Explanations**:
  - Quiz and Final Exam question builders include an optional "Explanation/Rationale" field.
  - Instructors configure release rules: `Always show on submission`, `Show only on passing attempt`, or `Show only after final deadline`.
  - After submitting a QuizAttempt or FinalExamAttempt, learners review explanations next to their responses.

### P2 Features (Medium Priority)
* **Gamification and Custom Badges**:
  - Instructors can design custom badges for courses with specific criteria triggers: `CourseCompletion`, `PerfectQuizzes` (100% score on all quizzes), or `FastTrack` (complete within 7 days).
  - Unlocked achievements trigger immediate toast notifications in the user session.
  - Learners can view their earned badge collection in a grid on their User Profile page.

---

## 3. User Flows

### Flow 1: Creating and Viewing Course Announcements
```
[Instructor Course Builder] → clicks "Create Announcement" → opens [Announcement Modal]
  → enters Title, Body, selects Priority: "Urgent" → clicks "Publish" → API broadcast triggered
                                                                           ↓
[Learner Course Details Page] ← renders flashing red Urgent Alert Banner ← [Database Announcement Record Created]
                                                                           ↓
[Learner Navbar] ← Bell Icon indicators increments/flashes red
  → clicks Bell Icon → opens [Global Notifications Tray] → lists the announcement summary
  → clicks "Dismiss" on Alert Banner → hides banner for current session
```

### Flow 2: Submitting and Grading Assignments
```
[Learner Course Viewer (Topic Page)] → clicks "Assignment" Tab → displays instructions & deadline
  → drags and drops "assignment_v1.zip" (8.5MB) → clicks "Submit Assignment"
  → API validates extension/size → locks submission → state updates to "Submitted"
                                                                           ↓
[Instructor Dashboard] → navigates to "Submissions Portal" → filters by Course & Assignment
  → selects student row → clicks "Grade Submission" → opens [Grading Modal]
  → downloads student file → enters Score "92", writes Feedback, uploads "annotated_feedback.pdf"
  → clicks "Submit Evaluation" → API updates record
                                                                           ↓
[Learner Grades Center] ← receives updated status "Graded" ← [Database Submission Record Updated]
  → views numeric score, text feedback, and downloads instructor's annotated file
```

### Flow 3: Doubt Resolution Drawer
```
[Learner Course Viewer] → clicks "Doubt Solver" button → opens [Collapsible Side Drawer]
  → enters "Why does this token expire?" in input box → clicks "Ask Doubt"
  → API saves question → drawer list updates with pending state
                                                                           ↓
[Instructor Doubt Dashboard] → views sorted unresolved doubts → selects the question
  → enters reply → checks "Mark as Official Response" → clicks "Post Response"
                                                                           ↓
[Learner Course Viewer Drawer] ← Doubt status updates to "Resolved"
  → opens drawer → views the reply marked as "Official Response" pinned at the top
```

### Flow 4: Quiz Explanations Review
```
[Learner Quiz Canvas] → answers questions → clicks "Submit Attempt"
  → API grades answers → saves QuizAttempt → checks Release Rules
                                                 ↓
[Assessment Results Screen] ← receives results payload (with or without explanations)
  → if rules satisfied (e.g. Always or Passed): displays question card, highlighting incorrect selection, correct answer, and renders: "Explanation: [Instructor's text explanation]"
```

### Flow 5: Custom Badges Achievements
```
[Learner Final Exam Screen] → submits correct answers, scoring 100% → database records exam passed
  → triggers achievement checking service → detects "Quiz Genius" badge criteria met
  → records badge unlock mapping
                                                 ↓
[Learner Client Interface] ← receives websocket/polling trigger ← [Database Badge Log Entry Saved]
  → displays instant Toast Notification: "Achievement Unlocked: Quiz Genius!"
  → learner clicks Toast → redirects to [User Profile Page] → displays Badge Icon in earned gallery grid
```

---

## 4. API Design

### 1. Unified Course Announcement System
#### `POST /api/courses/:id/announcements`
* **Role**: Instructor
* **Description**: Create and broadcast a new announcement.
* **Request Header**: `Authorization: Bearer <token>`
* **Request Body**:
```json
{
  "title": "Exam Schedule Shifted",
  "content": "The final exam is pushed to next Friday at 10:00 AM UTC.",
  "priority": "Urgent"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "60d0fe4f5311236168a109cb",
    "courseId": "60d0fe4f5311236168a109ca",
    "title": "Exam Schedule Shifted",
    "content": "The final exam is pushed to next Friday at 10:00 AM UTC.",
    "priority": "Urgent",
    "creatorId": "60d0fe4f5311236168a109c9",
    "createdAt": "2026-06-17T23:39:34.000Z"
  }
}
```
* **Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Title, content, and valid priority level are required."
}
```

#### `GET /api/courses/:id/announcements`
* **Role**: Enrolled Learner or Instructor
* **Description**: Fetch all active announcements for a course.
* **Request Header**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "60d0fe4f5311236168a109cb",
      "title": "Exam Schedule Shifted",
      "content": "The final exam is pushed to next Friday at 10:00 AM UTC.",
      "priority": "Urgent",
      "createdAt": "2026-06-17T23:39:34.000Z"
    }
  ]
}
```

---

### 2. Assignment Grading & Feedback Portal
#### `POST /api/topics/:topicId/assignments`
* **Role**: Instructor
* **Description**: Create a new assignment inside a topic.
* **Request Header**: `Authorization: Bearer <token>`
* **Request Body**:
```json
{
  "title": "Build a REST API",
  "description": "Create a Node/Express app with 5 routes.",
  "maxScore": 100,
  "dueDate": "2026-06-25T18:00:00.000Z",
  "referenceFileUrl": "https://s3.amazonaws.com/lms/docs/rubric.pdf"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "60d0fe4f5311236168a109cc",
    "topicId": "60d0fe4f5311236168a109cd",
    "title": "Build a REST API",
    "description": "Create a Node/Express app with 5 routes.",
    "maxScore": 100,
    "dueDate": "2026-06-25T18:00:00.000Z",
    "referenceFileUrl": "https://s3.amazonaws.com/lms/docs/rubric.pdf"
  }
}
```

#### `POST /api/assignments/:assignmentId/submit`
* **Role**: Enrolled Learner
* **Description**: Submit a file for an assignment. Enforces size (< 10MB) and format (.pdf, .zip, .doc, .docx).
* **Request Header**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Request Body**:
```
File data (key: "submissionFile")
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "60d0fe4f5311236168a109ce",
    "assignmentId": "60d0fe4f5311236168a109cc",
    "studentId": "60d0fe4f5311236168a109cf",
    "submittedFileUrl": "/uploads/60d0fe4f5311236168a109ce_api_v1.zip",
    "submittedAt": "2026-06-18T12:00:00.000Z",
    "status": "Submitted"
  }
}
```
* **Error Response (413 Payload Too Large)**:
```json
{
  "success": false,
  "message": "File exceeds the 10MB size limit."
}
```
* **Error Response (415 Unsupported Media Type)**:
```json
{
  "success": false,
  "message": "Invalid file type. Only PDF, ZIP, and Word Documents are allowed."
}
```

#### `POST /api/submissions/:submissionId/grade`
* **Role**: Instructor
* **Description**: Submit a grade and feedback for a student submission.
* **Request Header**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Request Body (form-data)**:
```
grade: 95
feedback: "Excellent work on modular router architecture!"
feedbackFile: (optional file binary)
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "60d0fe4f5311236168a109ce",
    "status": "Graded",
    "grade": 95,
    "feedback": "Excellent work on modular router architecture!",
    "feedbackFileUrl": "/uploads/feedback_60d0fe4f5311236168a109ce.pdf"
  }
}
```

---

### 3. Topic-Specific Q&A & Doubt Resolver
#### `POST /api/topics/:topicId/doubts`
* **Role**: Enrolled Learner
* **Description**: Ask a question under a topic.
* **Request Header**: `Authorization: Bearer <token>`
* **Request Body**:
```json
{
  "question": "How do we write a Mongoose transaction hook?"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "60d0fe4f5311236168a109d0",
    "topicId": "60d0fe4f5311236168a109cd",
    "studentId": "60d0fe4f5311236168a109cf",
    "question": "How do we write a Mongoose transaction hook?",
    "answers": [],
    "isResolved": false,
    "createdAt": "2026-06-18T13:00:00.000Z"
  }
}
```

#### `POST /api/doubts/:doubtId/answers`
* **Role**: Enrolled Learner or Instructor
* **Description**: Reply to a doubt. Instructors can set `isOfficial = true`.
* **Request Header**: `Authorization: Bearer <token>`
* **Request Body**:
```json
{
  "content": "You can use connection.startSession() to execute transaction blocks.",
  "isOfficial": true
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "60d0fe4f5311236168a109d0",
    "isResolved": true,
    "answers": [
      {
        "repliedBy": "60d0fe4f5311236168a109c9",
        "content": "You can use connection.startSession() to execute transaction blocks.",
        "isOfficial": true,
        "createdAt": "2026-06-18T13:05:00.000Z"
      }
    ]
  }
}
```

---

### 4. Custom Badges Model
#### `POST /api/courses/:id/badges`
* **Role**: Instructor
* **Description**: Create a custom badge for a course.
* **Request Header**: `Authorization: Bearer <token>`
* **Request Body**:
```json
{
  "title": "Speed Demon",
  "description": "Complete all modules within 7 days of enrollment.",
  "iconUrl": "https://s3.amazonaws.com/lms/badges/speed.png",
  "triggerType": "FastTrack"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "60d0fe4f5311236168a109d1",
    "courseId": "60d0fe4f5311236168a109ca",
    "title": "Speed Demon",
    "description": "Complete all modules within 7 days of enrollment.",
    "iconUrl": "https://s3.amazonaws.com/lms/badges/speed.png",
    "triggerType": "FastTrack"
  }
}
```

#### `GET /api/users/badges`
* **Role**: Learner
* **Description**: Fetch all custom badges unlocked by the learner.
* **Request Header**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "badgeId": {
        "id": "60d0fe4f5311236168a109d1",
        "title": "Speed Demon",
        "description": "Complete all modules within 7 days of enrollment.",
        "iconUrl": "https://s3.amazonaws.com/lms/badges/speed.png"
      },
      "unlockedAt": "2026-06-18T14:00:00.000Z"
    }
  ]
}
```

---

## 5. Edge Cases

### Edge Case 1: Malicious File Upload Attacks
* **Scenario**: A student attempts to upload an executable script (`hack.sh` or `webshell.php`) disguised as a PDF or ZIP file to exploit the backend server environment.
* **Handling approach**:
  1. The API utilizes the Mongoose validate layer and multer config filtering to reject block exceptions.
  2. Implement backend-level magic byte checks (using packages like `file-type`) rather than checking file name extensions alone.
  3. Uploaded files must be mapped to random GUID names and stored on a separate static bucket (e.g. AWS S3) with CORS and execute privileges disabled.

### Edge Case 2: Post-Due-Date Late Submission Attempts
* **Scenario**: A learner loses internet connection and submits an assignment 5 minutes past the due date or tries to manipulate client timestamps.
* **Handling approach**:
  1. The backend server must act as the source of truth for timestamps.
  2. Validate request receipt time against the assignment database record's `dueDate`.
  3. If past deadline, reject upload with `403 Forbidden` unless the assignment configuration explicitly has a `lateSubmissionAllowed` flag active.

### Edge Case 3: Quiz Rationale Leaks Pre-Submission
* **Scenario**: A student queries `/api/topics/:topicId/assessment` to load quiz questions and intercepts the response network stream to extract the correct answers or rationale fields before taking the quiz.
* **Handling approach**:
  1. The GET route `/api/topics/:topicId/assessment` must explicitly run a query select projecting only `-questions.correctOptionIndex` and `-questions.explanation`.
  2. The explanations and indices are only populated on the result retrieval endpoint `/api/topics/:topicId/assessment/submit` post-grading calculations.

### Edge Case 4: Rapid Double-Click Submission Requests
* **Scenario**: A user clicks the "Submit Assignment" or "Submit Quiz" button multiple times rapidly, initiating duplicate server requests, duplicate grading logs, and database errors.
* **Handling approach**:
  1. The client-side UI must disable submission buttons instantly upon the first click and show a loading spinner.
  2. The server-side code must run submissions inside a database transaction or map a temporary API lock using Redis/in-memory tokens to reject overlapping payload submissions for the same user-resource key.

### Edge Case 5: Aggregation Crash from Null Learner Fields
* **Scenario**: A learner profile is deleted from the database but the course enrollment progress records or grading logs are preserved, causing aggregate pipelines inside the instructor's dashboard to throw null reference errors.
* **Handling approach**:
  1. Cascade delete all related records (progress, doubt threads, assignment logs, badge logs) whenever a user profile is deleted.
  2. Implement null safety fallbacks inside the database aggregation pipeline (e.g. using `$ifNull` operators or filtering out empty learner queries in pipeline stages).

---

## 6. Acceptance Criteria Matrix

| Module / Feature | Acceptance Criteria (Testable & Pass/Fail) |
| :--- | :--- |
| **Unified Course Announcement System** | 1. If an announcement is created with priority `Urgent`, a banner must render at the top of the Learner Course Details page.<br>2. Dismissing an alert banner must hide it for the rest of the learner session without deleting the database record.<br>3. Non-enrolled learners must be blocked from reading announcements, returning HTTP `403`. |
| **Assignment Submission Portal** | 1. Uploading files exceeding 10MB must return HTTP `413 Payload Too Large`.<br>2. Uploading files with extensions other than `.pdf`, `.zip`, `.doc`, or `.docx` must return HTTP `415 Unsupported Media Type`.<br>3. Once marked as "Graded" by an instructor, the student cannot re-submit the assignment, returning HTTP `403`. |
| **Topic-Specific Q&A Resolver** | 1. Doubts must render contextual to the topic where they were created. Querying doubts for Topic A must not list questions from Topic B.<br>2. Instructors must be able to flag a response as "Official Response", placing it at the top of the doubt answer list. |
| **Interactive Quiz Feedback** | 1. If a quiz release rule is set to `OnPassing`, the client review screen must hide the question rationales and correct options if the learner's score falls below the passing threshold.<br>2. The quiz questions retrieval endpoint must not contain correct options or explanations inside the JSON payload. |
| **Gamification and Custom Badges** | 1. Earning a badge must trigger a visible Toast Notification panel on the student screen within 1 second of submission grading.<br>2. Re-running final exam completions must not duplicate badge mappings in the database, returning HTTP `409` on duplicates. |

---

## 7. Out of Scope
The following specifications are excluded from this release cycle:
1. **Rich-text edit tool plugins**: Instructors will utilize basic textareas for announcements/explanations; inline image pasting, file embeds, and HTML styling are out of scope.
2. **Real-time websocket servers**: Notifications and doubt tray refreshes will run via short-polling or page-load fetch calls rather than persistent Socket.io connections.
3. **Automated AI grading**: There is no AI evaluation of submitted assignments. Grading is managed manually by the instructor.
4. **Social media badge exports**: Learners cannot export custom badges directly to third-party platforms (such as LinkedIn or Twitter).
5. **Private peer-to-peer messaging**: Learners cannot chat with each other. Q&A threads are strictly public-facing within the specific topic drawer.
6. **Offline assignment drafts**: Learners cannot save assignment file drafts locally inside the web browser offline storage.

---

## 8. Data Privacy & Compliance (GDPR/CCPA)
1. **Right to Erasure (Right to be Forgotten)**:
   - If a student requests account deletion, all personal data, submission files (and instructor evaluations), doubt logs, and badge logs must be deleted.
   - Deletion processes must remove physical submission documents from S3/storage directories.
2. **Data Minimization**:
   - The platform must not log or parse files for geolocation metadata or query additional student file structures during upload processes.
3. **Data Security**:
   - Submission files and returned feedback documents must be access-controlled. Download routes must verify learner/instructor authentication states and role permissions before serving files.

---

## 9. User Stories

#### US-001: Course Broadcast Updates
As an **Instructor**,  
I want to post course-wide announcements with different priority levels,  
So that I can quickly inform all enrolled learners about important schedule modifications or upcoming deadlines.

#### US-002: Real-time Alert Visibility
As a **Learner**,  
I want to view urgent course announcements immediately upon loading my dashboard,  
So that I don't miss critical date shifts or structural course updates.

#### US-003: Task File Submission
As a **Learner**,  
I want to upload my homework files directly within the topic page before the deadline,  
So that my work can be validated and graded by the instructor.

#### US-004: Manual Assignment Evaluation
As an **Instructor**,  
I want to access a central dashboard of student submissions to grade them, add comments, and return corrected files,  
So that I can deliver detailed, actionable feedback to my students.

#### US-005: Contextual Doubt Resolution
As a **Learner**,  
I want to submit doubt questions in a side panel next to the video lesson or reading resource,  
So that I can get clarification on complex concepts without losing my place in the course.

#### US-006: Explanation-based Assessment Review
As a **Learner**,  
I want to view explanations and rationales behind correct and incorrect quiz answers,  
So that I can learn from my mistakes and improve my score on retakes.

#### US-007: Milestones Gamification Achievements
As a **Learner**,  
I want to earn custom visual badges when I achieve learning milestones,  
So that I feel motivated to complete course requirements.

---

## 10. Functional Requirements Matrix

| FR-ID | Module | Description | Priority | US-ID |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Announcements | The system shall allow instructors to create course announcements with Title, Content, and Priority (`Info`, `Warning`, `Urgent`). | High (P0) | US-001 |
| **FR-02** | Announcements | The system shall display `Urgent` announcements as flashing top-level banners on the learner's dashboard and course page. | High (P0) | US-002 |
| **FR-03** | Assignments | The system shall permit learners to upload PDF, ZIP, and Word Documents up to a maximum size limit of 10MB. | High (P0) | US-003 |
| **FR-04** | Assignments | The system shall provide instructors with a grading dashboard to input a score, write text feedback, and upload corrected files. | High (P0) | US-004 |
| **FR-05** | Doubt Resolver | The system shall render a collapsible doubt drawer next to learning content and allow learners to post text questions. | Medium (P1) | US-005 |
| **FR-06** | Doubt Resolver | The system shall allow instructors to reply to doubt threads and mark specific responses as "Official Responses". | Medium (P1) | US-005 |
| **FR-07** | Quiz Feedback | The system shall allow instructors to attach an optional explanation string to each question in a quiz. | Medium (P1) | US-006 |
| **FR-08** | Quiz Feedback | The system shall block or display quiz explanations to the user post-submission based on configured release rules. | Medium (P1) | US-006 |
| **FR-09** | Gamification | The system shall support custom badge definitions linked to course criteria triggers (`CourseCompletion`, `PerfectQuizzes`, `FastTrack`). | Low (P2) | US-007 |
| **FR-10** | Gamification | The system shall display earned achievements in a visual grid on the learner's User Profile page. | Low (P2) | US-007 |
