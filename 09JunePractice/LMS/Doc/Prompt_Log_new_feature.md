
---

## PROMPT 18 — Instructor Portal UI Fixes

**Output File:** `frontend/src/pages/Course/CourseViewer.jsx`, `frontend/src/pages/Dashboard/InstructorDashboard.jsx`

---
### Prompt Content (Rephrased)

````text
The tabs for announcements, assignments, and quiz feedback are still missing on the instructor portal. Please add them and ensure the UI reflects these updates.
````


---

## PROMPT 19 — Gamification Course Selection Fix

**Output File:** `frontend/src/pages/Course/InstructorBadgeManagement.jsx`

---
### Prompt Content (Rephrased)

````text
Fix a bug in the Gamification module where the instructor is unable to select a course from the dropdown when attempting to create a new badge.
````


---

## PROMPT 20 — Final Exam Submission Fix

**Output File:** `backend/src/services/progressService.js`, `frontend/src/pages/Course/FinalExam.jsx`

---
### Prompt Content (Rephrased)

````text
Fix a 404 API error occurring when a learner tries to submit the final exam.
````


---

## PROMPT 21 — Dashboard Completed State UI Fix

**Output File:** `frontend/src/pages/Dashboard/LearnerDashboard.jsx`

---
### Prompt Content (Rephrased)

````text
Update the learner dashboard UI so that once a user successfully completes the final exam and receives their certificate, the course card displays a "COMPLETED" badge instead of continuing to prompt them to "Take Final Exam".
````


---

## PROMPT 22 — Strict Grading & 24-Hour Exam Lockout

**Output File:** `backend/src/services/progressService.js`, `frontend/src/pages/Course/FinalExam.jsx`

---
### Prompt Content (Rephrased)

````text
Implement strict grading logic where the user must score at least 85% to receive a certificate. If they fail, display a custom message saying their marks are too low and explicitly lock them out from re-attempting the exam for 24 hours. Also, fix any remaining issues causing exam submissions to fail.
````


---

## PROMPT 23 — Complete Badge Lifecycle & Certificate Display

**Output File:** `backend/src/services/gamificationService.js`, `backend/src/routes/gamificationRoutes.js`, `frontend/src/pages/Course/InstructorBadgeManagement.jsx`, `frontend/src/pages/Course/CourseCompletion.jsx`

---
### Prompt Content (Rephrased)

````text
Fix the gamification flow: Ensure that badges created by the instructor are successfully retrieved and displayed in the instructor portal. Additionally, automatically award the badges to users when they complete the final exam/quiz, and display those earned badges clearly on the course completion/achievement card.
````


---

## PROMPT 24 — Exam Route JSON Parse Error Fix

**Output File:** `frontend/src/pages/Course/FinalExam.jsx`, `frontend/src/pages/Course/CourseViewer.jsx`, `frontend/src/pages/Course/CourseCompletion.jsx`

---
### Prompt Content (Rephrased)

````text
Resolve an issue where clicking 'Take Final Exam' results in an "Exam Locked: Failed to connect to the server" error with an "Unexpected token < in JSON" exception. Fix the API routes and proxy configurations causing this fallback behavior.
````


---

## PROMPT 25 — Dynamic Course Initials Thumbnail

**Output File:** `frontend/src/pages/Dashboard/LearnerDashboard.jsx`

---
### Prompt Content (Rephrased)

````text
Improve the learner dashboard UI by replacing the generic placeholder icons on course cards with dynamically generated initials from the course title (e.g., displaying "KM" for "Kotlin Multiplatform"). Apply this logic universally to all enrolled courses.
````

