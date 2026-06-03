# Key Performance Indicators (KPIs) & Acceptance Criteria
## Project: Online Learning Management System (LMS)

This document translates the Business Requirement Document (BRD) objectives into measurable performance indicators and defines the clear acceptance criteria required to sign off on the system's release.

---

## 1. Key Performance Indicators (KPIs)

These metrics will be monitored post-launch to assess project success and system health.

### 1.1. Product & Business Metrics
| Metric ID | KPI Name | Target Threshold (Phase 1) | Measurement Interval |
|---|---|---|---|
| **KPI-B1** | Course Completion Rate | >= 40% of enrolled students | Monthly |
| **KPI-B2** | User Retention Rate | >= 50% active returning users | Monthly |
| **KPI-B3** | Average Quiz Pass Rate | 75% - 85% range (indicates balanced difficulty) | Quarterly |
| **KPI-B4** | Content Upload Success | 99.9% of uploaded files format successfully | Weekly |
| **KPI-B5** | Daily Active Users (DAU) | Target: 500+ active learners daily | Monthly |

### 1.2. Technical & Performance Metrics
| Metric ID | KPI Name | Target Threshold | Measurement Instrument |
|---|---|---|---|
| **KPI-T1** | System Uptime | >= 99.9% availability (excluding scheduled maintenance) | Uptime Monitor (e.g., Pingdom) |
| **KPI-T2** | Core Web Vitals (LCP) | Largest Contentful Paint < 2.5 seconds | Lighthouse Audits |
| **KPI-T3** | Video Playback Start Latency | < 3.0 seconds under normal network conditions | Video CDN Telemetry |
| **KPI-T4** | Database Query Latency | Median search query response < 150ms | APM Tools (e.g., New Relic) |
| **KPI-T5** | Error Rate (HTTP 5xx) | < 0.1% of total requests | Server Logs / Sentry |

---

## 2. Project Acceptance Criteria (AC)

To declare the project complete and ready for deployment, the system must satisfy the following acceptance criteria, mapped to the requirements defined in the [BRD](file:///d:/vibeCoding2026/Projects/learning-management-system-lms/brd.md).

### AC-1: User Management & Authentication (Mapped to HLBR-1)
* **AC-1.1:** Users can sign up and log in using email/password. Strong password validation must be enforced (min 8 characters, alphanumeric, special character).
* **AC-1.2:** Single-click OAuth registration (Google, GitHub) is successful, creating a profile and mapping correct user details.
* **AC-1.3:** Instructors cannot access Student dashboard metrics, and Students cannot access the Course Builder or administrative console (RBAC enforcement).

### AC-2: Course Creation & Instructor Workspace (Mapped to HLBR-2)
* **AC-2.1:** Instructors can create, edit, and delete courses. Required fields (Title, Description, Category) prevent submission if empty.
* **AC-2.2:** Instructors can upload video lectures (MP4/WebM, up to 500MB) and PDFs successfully. Progress bar displays during upload.
* **AC-2.3:** Course drafts are private and cannot be seen by students until the instructor clicks "Publish."

### AC-3: Course Browsing & Enrollment (Mapped to HLBR-3)
* **AC-3.1:** Students can search courses via a text search field and filter results by category, level, and rating. Results update in under 500ms.
* **AC-3.2:** Student dashboard displays accurate enrollment cards containing course thumbnails, completion progress percentages, and dynamic status labels ("Not Started," "In Progress," "Completed").
* **AC-3.3:** Enrolling in a course adds the user to the course roster instantly and updates the student's dashboard.

### AC-4: Learning Experience & Progress (Mapped to HLBR-4)
* **AC-4.1:** Immersive player displays active lecture video/text side-by-side with the course syllabus drawer.
* **AC-4.2:** Video player automatically marks a lecture as "Completed" when 90% of the video runtime is reached.
* **AC-4.3:** Student progress is saved in real-time. Upon logging back in or refreshing, the player resumes at the exact video position last saved.

### AC-5: Assessment & Quizzes (Mapped to HLBR-5)
* **AC-5.1:** Instructors can create quizzes with multiple-choice questions, assigning points and designating the correct answer for each question.
* **AC-5.2:** Students can submit quiz attempts. The system grades responses, displays final score, marks questions as correct/incorrect, and logs the score.
* **AC-5.3:** If a student scores below the instructor's configured passing threshold, the course remains marked "In Progress," and the student is prompted to retry.

### AC-6: Certification (Mapped to HLBR-6)
* **AC-6.1:** Immediately when progress hits 100% (all lectures completed and quizzes passed), a certificate is dynamically generated in PDF format.
* **AC-6.2:** Certificates must include: Student Name, Course Title, Completion Date, Unique Verification ID, and Instructor Name.
* **AC-6.3:** Sharing the public certificate verification URL displays a standalone, read-only web page validating the certificate authenticity.
