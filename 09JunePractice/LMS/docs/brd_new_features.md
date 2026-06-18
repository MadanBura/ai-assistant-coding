# Business Requirement Document (BRD) — LMS Feature Enhancements

This document specifies the business and functional requirements for five interactive features designed to enhance cross-module collaboration between the **Instructor (Teacher) Side** and the **Learner (Student) Side**.

These features will integrate directly with existing models such as [Course.js](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/backend/src/models/Course.js), [Progress.js](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/backend/src/models/Progress.js), and [Quiz.js](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/backend/src/models/Quiz.js).

---

## 1. Unified Course Announcement System

### Problem Statement
Instructors lack a standardized, prominent channel to broadcast real-time announcements or alerts regarding schedule updates, syllabus changes, or critical deadlines directly to students.

### Functional Requirements
* **Instructor Side:**
  * **Dashboard:** A dedicated creation panel inside the Course Dashboard allowing instructors to compose rich-text announcements.
  * **Priority Levels:** Ability to assign a priority status:
    * `Info` (Standard updates, blue indicator)
    * `Warning` (Important notes, yellow/orange indicator)
    * `Urgent` (Critical action required, red flashing indicator)
  * **Audience Targeting:** By default, broadcasts to all students enrolled in the specific course.
* **Learner (Student) Side:**
  * **Notifications Panel:** A global bell icon in the navigation header displaying a list of recent course announcements.
  * **Alert Banners:** Active announcements tagged as `Urgent` must render as prominent top-level alert banners at the top of the course details or progress page until dismissed by the student.

---

## 2. Assignment Grading & Feedback Portal

### Problem Statement
The system needs a formal feedback mechanism beyond quizzes. Instructors need a way to assign hands-on tasks and review individual file uploads.

### Functional Requirements
* **Instructor Side:**
  * **Assignment Creation:** Ability to create assignments within any topic/module. Fields include Title, Description, Due Date, Max Score, Rubric description, and optional attachment of reference files (PDFs, instruction sheets).
  * **Grading Interface:** A grading dashboard listing all student submissions filterable by course and assignment.
  * **Evaluations:** Inputs for Grade/Score, Text Feedback, and ability to attach an evaluated/annotated file response.
* **Learner (Student) Side:**
  * **Submission Portal:** A file-uploader interface on the specific topic page where students upload assignment files (restricted to PDF, ZIP, or document files up to 10MB) before the specified deadline.
  * **Grades Center:** A page showing all submitted assignments, grading status, final scores, text comments, and files returned by the instructor.

---

## 3. Topic-Specific Q&A & Doubt Resolver

### Problem Statement
Students often hit roadblocks when watching content or reading notes. Instructors need a streamlined way to see and answer these doubts in context.

### Functional Requirements
* **Instructor Side:**
  * **Doubt Alert Center:** A central dashboard listing unresolved doubts, sorted by submission timestamp.
  * **Responses:** Ability to respond to student doubts. Instructors can mark a peer's or their own answer as an "Official Response" or "Pinned Answer".
* **Learner (Student) Side:**
  * **In-Context Ask:** An collapsible side drawer (e.g., "Doubt Solver") positioned next to video lessons and topics where students can write and post doubts.
  * **Peer Search:** A search bar to browse previously asked questions and official resolutions within that topic.

---

## 4. Interactive Quiz Feedback & Explanations

### Problem Statement
Quizzes are currently static evaluations. Students do not learn from their incorrect answers, and instructors cannot explain the logical rationale behind test scores.

### Functional Requirements
* **Instructor Side:**
  * **Quiz Creator Updates:** Add an optional "Explanation/Rationale" text field to each question in the [Quiz](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/backend/src/models/Quiz.js) editing screen.
  * **Release Rules:** Toggle to control when feedback is displayed (e.g., `Always show on submission`, `Show only on passing attempt`, or `Show only after final deadline`).
* **Learner (Student) Side:**
  * **Interactive Assessment Review:** After submitting a [QuizAttempt](file:///Users/apple/ai-assistant-coding/09JunePractice/LMS/backend/src/models/QuizAttempt.js), the feedback screen highlights missed questions alongside the instructor-curated logical explanations.

---

## 5. Gamification and Custom Badges

### Problem Statement
Student engagement decreases over long courses. Gamifying milestones provides motivational targets for course completion.

### Functional Requirements
* **Instructor Side:**
  * **Badge Designer:** Instructors can define custom badges for courses with conditions (e.g., Badge: "Speed Runner" for completing all modules within 7 days, or "Quiz Genius" for scoring 100% on the final exam).
* **Learner (Student) Side:**
  * **Unlocked Achievements:** Toast notifications appear immediately when a student meets a badge criteria.
  * **Student Profile Badges:** A grid showing unlocked badges on the user profile page.

---

## Proposed Schema Extensions

### 1. Announcement Model
```javascript
const AnnouncementSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  priority: { type: String, enum: ['Info', 'Warning', 'Urgent'], default: 'Info' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});
```

### 2. Assignment & Submission Models
```javascript
const AssignmentSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  title: { type: String, required: true },
  description: { type: String },
  maxScore: { type: Number, default: 100 },
  dueDate: { type: Date },
  referenceFileUrl: { type: String }
});

const SubmissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submittedFileUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number },
  feedback: { type: String },
  feedbackFileUrl: { type: String },
  status: { type: String, enum: ['Submitted', 'Graded'], default: 'Submitted' }
});
```

### 3. Topic Question & Answer (Doubt) Model
```javascript
const DoubtSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answers: [{
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isOfficial: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
```

### 4. Custom Badges Model
```javascript
const BadgeSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String },
  iconUrl: { type: String },
  triggerType: { type: String, enum: ['CourseCompletion', 'PerfectQuizzes', 'FastTrack'], required: true }
});
```
