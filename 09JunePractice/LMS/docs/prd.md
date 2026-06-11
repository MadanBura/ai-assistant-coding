## Problem Statement

Organizations, educational institutes, training centers, and self-learning professionals face significant challenges in managing and delivering structured learning content. Learning materials such as videos, notes, presentations, and assessments are frequently fragmented across disparate platforms (e.g., cloud storage, email, chat applications, and video sharing platforms). This fragmentation results in:
- The absence of a clear, sequential, and structured learning path for students.
- Difficulty for instructors and administrators in tracking learner progress, completion rates, and performance analytics.
- A lack of centralized assessment and automatic, verified certification tools to evaluate understanding.

There is a critical need for a centralized, web-based Learning Management System (LMS) that streamlines course creation, content delivery, sequential learning, assessment conduction, and automated certification.

## Solution Overview

The web-based Learning Management System provides a unified platform to manage and deliver structured education. The solution accommodates three main roles: Administrators, Instructors, and Learners.

- **Course Management:** Instructors/Administrators can build structured courses composed of multiple Modules, which are further divided into Topics.
- **Resource Repository:** Each Topic can store structured resources, including video links/embeds, notes, documents, and reference materials.
- **Sequential Learning:** Learners must consume materials in a predefined chronological sequence, unlocking subsequent topics only after completing current requirements.
- **Evaluation Engine:** The system hosts topic-level quizzes and course-level final examinations to test learner comprehension.
- **Automated Certification:** Upon completing all topics and passing the final exam, the platform automatically generates and issues a downloadable PDF certificate of completion.
- **Analytics & Tracking:** Learners can track their progress, while Instructors can monitor enrollment numbers, progression status, and assessment scores via an analytics dashboard.

## User Flow

### Instructor / Administrator Flow
1. **Authentication:** Log in to the administrator/instructor portal.
2. **Course Creation:** Navigate to the Course Creator and enter course details (Title, Description, Category).
3. **Curriculum Design:** Add Modules to the course. Within each module, add multiple Topics.
4. **Content Upload:** For each Topic, upload or link resources (video URLs, notes text, PDF documents, external references).
5. **Assessment Setup:** Create topic-wise quizzes and a comprehensive final course-level exam, setting passing thresholds (e.g., 70%).
6. **Analytics Review:** View the enrollment dashboard to track learner progress, completion rates, and average assessment scores.

### Learner Flow
1. **Onboarding:** Register an account and log in.
2. **Course Discovery:** Browse the course catalog and select a course.
3. **Enrollment:** Click "Enroll" to join the course.
4. **Learning Journey:**
   - Access Module 1, Topic 1 (subsequent topics/modules are locked).
   - View video/document resources for Topic 1.
   - Click "Mark as Complete" or take the required Topic 1 quiz.
5. **Sequential Unlock:** Upon successful completion of Topic 1, Topic 2 unlocks automatically.
6. **Course Assessment:** After completing all topics in all modules, the Final Exam is unlocked.
7. **Certification:** Pass the Final Exam to unlock the "Download Certificate" button. Download the system-generated certificate.

## API Design

### Authentication & User Management
- `POST /api/auth/register` - Create a new user account (Learner or Instructor/Admin).
- `POST /api/auth/login` - Authenticate user credentials and return a session token/JWT.
- `GET /api/auth/profile` - Retrieve current user profile details.

### Course & Curriculum Management
- `GET /api/courses` - Fetch list of all available courses (with filters).
- `POST /api/courses` - Create a new course (Instructor/Admin only).
- `GET /api/courses/:id` - Fetch full structure of a specific course (Modules, Topics, and Resource list).
- `PUT /api/courses/:id` - Update course details, modules, or topics (Instructor/Admin only).
- `DELETE /api/courses/:id` - Delete a course (Instructor/Admin only).

### Enrollment & Progress Tracking
- `POST /api/courses/:id/enroll` - Enroll the authenticated learner in a course.
- `GET /api/courses/:id/progress` - Get current completion percentage and unlock status of modules/topics for the enrolled learner.
- `POST /api/topics/:topicId/complete` - Mark a topic as complete and trigger unlocking of the next sequential topic.

### Assessments & Certification
- `GET /api/topics/:topicId/assessment` - Retrieve quiz questions for a topic.
- `POST /api/topics/:topicId/assessment/submit` - Submit answers, grade the quiz, and return pass/fail status.
- `POST /api/courses/:id/final-exam/submit` - Submit answers for the final examination, grade, and record final score.
- `GET /api/courses/:id/certificate` - Retrieve or generate the certificate of completion if requirements are met.

## Edge Cases

- **Assessment Failure & Retakes:** A learner fails a topic quiz or final exam. The system must lock progress, prevent certificate issuance, and allow controlled retakes without breaking the sequential unlock state.
- **Concurrent Session Disruption:** The learner loses internet connectivity mid-quiz or mid-exam. The system must save the current state/draft progress locally or server-side so they can resume without losing all answers.
- **Bypassing Sequential Logic:** Users attempting to access locked modules or topics directly via URL hacking (e.g., modifying route parameters). The backend API must enforce server-side validation to ensure a topic is unlocked for the user before serving contents.
- **Name Discrepancies on Certificates:** A learner changes their profile name after enrolling but before certificate generation. The certificate must fetch the latest confirmed profile name at the exact moment of issuance and lock that name from future changes on that specific certificate.
- **Media File Availability:** Embedded video links (e.g., YouTube/Vimeo) or external documents becoming corrupted or deleted. The system must handle broken resource links gracefully without crashing the UI.

## KPIs (Success Metrics / Acceptance Criteria)

- **Course Completion Rate:** Track the percentage of enrolled users who complete all topics and final examinations.
- **Assessment Pass Rate:** Measure the percentage of students passing quizzes on their first, second, and third attempts to analyze assessment difficulty.
- **Certificate Issuance Speed:** Automatic certificate generation must complete within 3 seconds of a learner passing the final exam.
- **Zero Lockout Errors:** 100% reliability in sequential unlocks—no learner should be locked out of a valid next topic once the previous topic is successfully marked complete.
- **API Response Latency:** 95% of API requests resolved in under 200ms (excluding large report generations or certificate PDFs).

## Limitations

- **No Native Video Hosting:** The platform does not host raw video files directly; instructors must embed/link external video resources (e.g., YouTube, Vimeo, AWS S3).
- **No Built-in Payment Gateway:** Course enrollment is free/open; paid transactions, coupon codes, and subscription billing are outside the scope of this system.
- **Offline Access:** The system requires an active internet connection; content cannot be cached or consumed in offline mode.
- **No Live Virtual Classrooms:** No synchronous tools (like Zoom integrations, chat rooms, or live streams) are supported; all learning is asynchronous.

## Tech Stack

Frontend: React 19 + Bootstrap 5.3
Backend: Node.js 22 LTS + Express.js 5
Database: MongoDB Atlas (Cloud)
Testing: Jest + Supertest + React Testing Library
Frontend Hosting: Vercel
Backend Hosting: Render
Database Hosting: MongoDB Atlas
