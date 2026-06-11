# Backend Test Log

## Failed Test Cases

| Test ID | Module | Feature | Test File | Test Name | Status | Priority | Last Updated | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| - | - | - | - | - | - | - | - | All 130 test cases passing successfully. |

## Passed Test Cases

| Test ID | Module | Feature | Test File | Test Name | Status | Priority | Last Updated | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| BE-01-01-001 | User Onboarding & Auth | User Registration | backend/tests/auth/register.test.js | Should register a new learner successfully with status 201 | Pass | High | 2026-06-11 | Passed |
| BE-01-01-002 | User Onboarding & Auth | User Registration | backend/tests/auth/register.test.js | Should register a new instructor successfully with status 201 | Pass | High | 2026-06-11 | Passed |
| BE-01-01-003 | User Onboarding & Auth | User Registration | backend/tests/auth/register.test.js | Should fail registration if name field is missing with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-01-01-004 | User Onboarding & Auth | User Registration | backend/tests/auth/register.test.js | Should fail if the email is already registered with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-01-01-005 | User Onboarding & Auth | User Registration | backend/tests/auth/register.test.js | Should fail if the email format is invalid with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-01-01-006 | User Onboarding & Auth | User Registration | backend/tests/auth/register.test.js | Should fail if the password is under 8 characters with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-01-01-007 | User Onboarding & Auth | User Registration | backend/tests/auth/register.test.js | Should fail if role is not Learner or Instructor with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-01-01-008 | User Onboarding & Auth | User Registration | backend/tests/auth/register.test.js | Should fail if request body is empty with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-01-01-009 | User Onboarding & Auth | User Registration | backend/tests/auth/register.test.js | Should sanitize email parameter to prevent NoSQL operator injection | Pass | High | 2026-06-11 | Passed |
| BE-01-01-010 | User Onboarding & Auth | User Registration | backend/tests/auth/register.test.js | Should return 500 if the database save operation fails | Pass | High | 2026-06-11 | Passed |
| BE-01-02-001 | User Onboarding & Auth | User Login | backend/tests/auth/login.test.js | Should login successfully with valid credentials returning token and 200 | Pass | High | 2026-06-11 | Passed |
| BE-01-02-002 | User Onboarding & Auth | User Login | backend/tests/auth/login.test.js | Should fail login if email is not registered with status 410 | Pass | High | 2026-06-11 | Passed |
| BE-01-02-003 | User Onboarding & Auth | User Login | backend/tests/auth/login.test.js | Should fail login if password is incorrect with status 410 | Pass | High | 2026-06-11 | Passed |
| BE-01-02-004 | User Onboarding & Auth | User Login | backend/tests/auth/login.test.js | Should fail if email parameter is missing with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-01-02-005 | User Onboarding & Auth | User Login | backend/tests/auth/login.test.js | Should fail if password parameter is missing with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-01-02-006 | User Onboarding & Auth | User Login | backend/tests/auth/login.test.js | The returned JWT should contain correct user ID and role | Pass | High | 2026-06-11 | Passed |
| BE-01-02-007 | User Onboarding & Auth | User Login | backend/tests/auth/login.test.js | Should reject login requests attempting NoSQL operator queries in email | Pass | High | 2026-06-11 | Passed |
| BE-01-02-008 | User Onboarding & Auth | User Login | backend/tests/auth/login.test.js | Should fail on empty request payload with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-01-02-009 | User Onboarding & Auth | User Login | backend/tests/auth/login.test.js | Should reject expired JWT tokens with status 401 | Pass | High | 2026-06-11 | Passed |
| BE-01-02-010 | User Onboarding & Auth | User Login | backend/tests/auth/login.test.js | Should return status 500 if server throws an internal error during credentials lookup | Pass | High | 2026-06-11 | Passed |
| BE-01-03-001 | User Onboarding & Auth | User Profile Management | backend/tests/auth/profile.test.js | Should retrieve user profile details with a valid token and status 200 | Pass | High | 2026-06-11 | Passed |
| BE-01-03-002 | User Onboarding & Auth | User Profile Management | backend/tests/auth/profile.test.js | Should reject GET profile if Authorization header is missing with status 401 | Pass | High | 2026-06-11 | Passed |
| BE-01-03-003 | User Onboarding & Auth | User Profile Management | backend/tests/auth/profile.test.js | Should reject GET profile if token format is invalid with status 401 | Pass | High | 2026-06-11 | Passed |
| BE-01-03-004 | User Onboarding & Auth | User Profile Management | backend/tests/auth/profile.test.js | Should update name and email successfully and return status 200 | Pass | High | 2026-06-11 | Passed |
| BE-01-03-005 | User Onboarding & Auth | User Profile Management | backend/tests/auth/profile.test.js | Should fail profile update if email matches another existing user with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-01-03-006 | User Onboarding & Auth | User Profile Management | backend/tests/auth/profile.test.js | Should prevent role elevation modification attempts with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-01-03-007 | User Onboarding & Auth | User Profile Management | backend/tests/auth/profile.test.js | Should reject profile update if email format is invalid with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-01-03-008 | User Onboarding & Auth | User Profile Management | backend/tests/auth/profile.test.js | Should reject PUT profile if Authorization header is missing with status 401 | Pass | High | 2026-06-11 | Passed |
| BE-01-03-009 | User Onboarding & Auth | User Profile Management | backend/tests/auth/profile.test.js | Should respond with status 200 and return original data on empty payload | Pass | High | 2026-06-11 | Passed |
| BE-01-03-010 | User Onboarding & Auth | User Profile Management | backend/tests/auth/profile.test.js | Should return status 500 if DB update operation fails | Pass | High | 2026-06-11 | Passed |
| BE-02-01-001 | Course & Curriculum | Course Creation | backend/tests/course/course.test.js | Should create a course successfully as an Instructor with status 201 | Pass | High | 2026-06-11 | Passed |
| BE-02-01-002 | Course & Curriculum | Course Creation | backend/tests/course/course.test.js | Should block course creation for Learners with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-02-01-003 | Course & Curriculum | Course Creation | backend/tests/course/course.test.js | Should reject course creation if required fields are missing with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-02-01-004 | Course & Curriculum | Course Creation | backend/tests/course/course.test.js | Should fetch all courses successfully with status 200 | Pass | High | 2026-06-11 | Passed |
| BE-02-01-005 | Course & Curriculum | Course Creation | backend/tests/course/course.test.js | Should retrieve a single course detail successfully with status 200 | Pass | High | 2026-06-11 | Passed |
| BE-02-01-006 | Course & Curriculum | Course Creation | backend/tests/course/course.test.js | Should return status 404 if the requested course ID does not exist | Pass | High | 2026-06-11 | Passed |
| BE-02-01-007 | Course & Curriculum | Course Creation | backend/tests/course/course.test.js | Should allow the course owner to update course metadata successfully with status 200 | Pass | High | 2026-06-11 | Passed |
| BE-02-01-008 | Course & Curriculum | Course Creation | backend/tests/course/course.test.js | Should prevent a non-owner instructor from updating the course with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-02-01-009 | Course & Curriculum | Course Creation | backend/tests/course/course.test.js | Should allow owner to delete course, returning status 200, and delete enrollments | Pass | High | 2026-06-11 | Passed |
| BE-02-01-010 | Course & Curriculum | Course Creation | backend/tests/course/course.test.js | Should reject deletion attempts from non-owners with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-02-02-001 | Course & Curriculum | Curriculum Design | backend/tests/course/curriculum.test.js | Should allow the course owner to add a module and return status 201 | Pass | High | 2026-06-11 | Passed |
| BE-02-02-002 | Course & Curriculum | Curriculum Design | backend/tests/course/curriculum.test.js | Should prevent non-owner instructor from adding modules with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-02-02-003 | Course & Curriculum | Curriculum Design | backend/tests/course/curriculum.test.js | Should reject module creation if title is missing with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-02-02-004 | Course & Curriculum | Curriculum Design | backend/tests/course/curriculum.test.js | Should allow course owner to add a topic under a module and return status 201 | Pass | High | 2026-06-11 | Passed |
| BE-02-02-005 | Course & Curriculum | Curriculum Design | backend/tests/course/curriculum.test.js | Should prevent non-owner from adding topics to a module with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-02-02-006 | Course & Curriculum | Curriculum Design | backend/tests/course/curriculum.test.js | Should reject topic creation if title is missing with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-02-02-007 | Course & Curriculum | Curriculum Design | backend/tests/course/curriculum.test.js | Should reorder modules successfully with status 200 | Pass | High | 2026-06-11 | Passed |
| BE-02-02-008 | Course & Curriculum | Curriculum Design | backend/tests/course/curriculum.test.js | Should prevent non-owners from reordering the curriculum with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-02-02-009 | Course & Curriculum | Curriculum Design | backend/tests/course/curriculum.test.js | Retrieving course details should return modules in ascending sequence index order | Pass | High | 2026-06-11 | Passed |
| BE-02-02-010 | Course & Curriculum | Curriculum Design | backend/tests/course/curriculum.test.js | Should fail to add a module if the course ID does not exist with status 404 | Pass | High | 2026-06-11 | Passed |
| BE-02-03-001 | Course & Curriculum | Resource Management | backend/tests/course/resource.test.js | Should attach a video link to a topic successfully and return status 201 | Pass | High | 2026-06-11 | Passed |
| BE-02-03-002 | Course & Curriculum | Resource Management | backend/tests/course/resource.test.js | Should fail video resource creation if the URL format is invalid with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-02-03-003 | Course & Curriculum | Resource Management | backend/tests/course/resource.test.js | Should attach notes (markdown content) to a topic successfully and return status 201 | Pass | High | 2026-06-11 | Passed |
| BE-02-03-004 | Course & Curriculum | Resource Management | backend/tests/course/resource.test.js | Should attach document reference link successfully and return status 201 | Pass | High | 2026-06-11 | Passed |
| BE-02-03-005 | Course & Curriculum | Resource Management | backend/tests/course/resource.test.js | Should reject resource creation if resource type is missing with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-02-03-006 | Course & Curriculum | Resource Management | backend/tests/course/resource.test.js | Should prevent non-owner instructor from adding resources with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-02-03-007 | Course & Curriculum | Resource Management | backend/tests/course/resource.test.js | Should allow course owner to update a resource successfully with status 200 | Pass | High | 2026-06-11 | Passed |
| BE-02-03-008 | Course & Curriculum | Resource Management | backend/tests/course/resource.test.js | Should prevent non-owner instructor from updating a resource with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-02-03-009 | Course & Curriculum | Resource Management | backend/tests/course/resource.test.js | Should fail document creation if PDF link is not a valid absolute URL with status 400 | Pass | High | 2026-06-11 | Passed |
| BE-02-03-010 | Course & Curriculum | Resource Management | backend/tests/course/resource.test.js | Should fail to add a resource if the topic ID does not exist with status 404 | Pass | High | 2026-06-11 | Passed |
| BE-03-01-001 | Enrollment & Progress | Course Enrollment | backend/tests/progress/enrollment.test.js | Should list all courses for learners with status 200 | Pass | High | 2026-06-11 | Passed |
| BE-03-01-002 | Enrollment & Progress | Course Enrollment | backend/tests/progress/enrollment.test.js | Should reject courses catalog access if token is missing with status 401 | Pass | High | 2026-06-11 | Passed |
| BE-03-01-003 | Enrollment & Progress | Course Enrollment | backend/tests/progress/enrollment.test.js | Should enroll an authenticated learner successfully with status 201 | Pass | High | 2026-06-11 | Passed |
| BE-03-01-004 | Enrollment & Progress | Course Enrollment | backend/tests/progress/enrollment.test.js | Should reject enrollment requests if token is missing with status 401 | Pass | High | 2026-06-11 | Passed |
| BE-03-01-005 | Enrollment & Progress | Course Enrollment | backend/tests/progress/enrollment.test.js | Should reject duplicate enrollment requests with status 409 | Pass | High | 2026-06-11 | Passed |
| BE-03-01-006 | Enrollment & Progress | Course Enrollment | backend/tests/progress/enrollment.test.js | Should prevent Instructors from enrolling in courses with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-03-01-007 | Enrollment & Progress | Course Enrollment | backend/tests/progress/enrollment.test.js | Should return status 404 if enrolling in a non-existent course ID | Pass | High | 2026-06-11 | Passed |
| BE-03-01-008 | Enrollment & Progress | Course Enrollment | backend/tests/progress/enrollment.test.js | Enrolling must create a Progress document with empty completed collections | Pass | High | 2026-06-11 | Passed |
| BE-03-01-009 | Enrollment & Progress | Course Enrollment | backend/tests/progress/enrollment.test.js | Should return status 200 and an empty array if no courses are in database | Pass | High | 2026-06-11 | Passed |
| BE-03-01-010 | Enrollment & Progress | Course Enrollment | backend/tests/progress/enrollment.test.js | Should return status 500 if DB save throws an error during enrollment | Pass | High | 2026-06-11 | Passed |
| BE-03-02-001 | Enrollment & Progress | Progress Tracking | backend/tests/progress/progress.test.js | Should mark a topic complete and update progress successfully with status 200 | Pass | High | 2026-06-11 | Passed |
| BE-03-02-002 | Enrollment & Progress | Progress Tracking | backend/tests/progress/progress.test.js | Should retrieve learner course progress with status 200 | Pass | High | 2026-06-11 | Passed |
| BE-03-02-003 | Enrollment & Progress | Progress Tracking | backend/tests/progress/progress.test.js | Should reject progress query if token is missing with status 401 | Pass | High | 2026-06-11 | Passed |
| BE-03-02-004 | Enrollment & Progress | Progress Tracking | backend/tests/progress/progress.test.js | Should reject complete updates if token is missing with status 401 | Pass | High | 2026-06-11 | Passed |
| BE-03-02-005 | Enrollment & Progress | Progress Tracking | backend/tests/progress/progress.test.js | Should reject completing Topic N if Topic N-1 is not completed with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-03-02-006 | Enrollment & Progress | Progress Tracking | backend/tests/progress/progress.test.js | Submitting completion twice should not duplicate array elements or over-inflate percentage | Pass | High | 2026-06-11 | Passed |
| BE-03-02-007 | Enrollment & Progress | Progress Tracking | backend/tests/progress/progress.test.js | Completing the final topic should update progressPercent to 100 | Pass | High | 2026-06-11 | Passed |
| BE-03-02-008 | Enrollment & Progress | Progress Tracking | backend/tests/progress/progress.test.js | Should return 404 if retrieving progress for a non-existent course ID | Pass | High | 2026-06-11 | Passed |
| BE-03-02-009 | Enrollment & Progress | Progress Tracking | backend/tests/progress/progress.test.js | Should return 403 if learner queries progress on a course they are not enrolled in | Pass | High | 2026-06-11 | Passed |
| BE-03-02-010 | Enrollment & Progress | Progress Tracking | backend/tests/progress/progress.test.js | Should return 404 if marking complete on a non-existent topic ID | Pass | High | 2026-06-11 | Passed |
| BE-03-03-001 | Enrollment & Progress | Locking System | backend/tests/progress/locking.test.js | Module 1, Topic 1 should be unlocked by default upon enrollment, returning status 200 | Pass | High | 2026-06-11 | Passed |
| BE-03-03-002 | Enrollment & Progress | Locking System | backend/tests/progress/locking.test.js | Module 1, Topic 2 should be locked initially, returning status 403 | Pass | High | 2026-06-11 | Passed |
| BE-03-03-003 | Enrollment & Progress | Locking System | backend/tests/progress/locking.test.js | Module 1, Topic 2 should unlock after completing Topic 1, returning status 200 | Pass | High | 2026-06-11 | Passed |
| BE-03-03-004 | Enrollment & Progress | Locking System | backend/tests/progress/locking.test.js | Should reject topic detail queries if token is missing with status 401 | Pass | High | 2026-06-11 | Passed |
| BE-03-03-005 | Enrollment & Progress | Locking System | backend/tests/progress/locking.test.js | Should reject topic detail queries if learner is not enrolled in the course with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-03-03-006 | Enrollment & Progress | Locking System | backend/tests/progress/locking.test.js | Final exam retrieval should fail with status 403 if curriculum topics are incomplete | Pass | High | 2026-06-11 | Passed |
| BE-03-03-007 | Enrollment & Progress | Locking System | backend/tests/progress/locking.test.js | Final exam should be accessible with status 200 when all curriculum topics are completed | Pass | High | 2026-06-11 | Passed |
| BE-03-03-008 | Enrollment & Progress | Locking System | backend/tests/progress/locking.test.js | Topic 1 of Module 2 should be locked until final Topic of Module 1 is complete with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-03-03-009 | Enrollment & Progress | Locking System | backend/tests/progress/locking.test.js | Should return status 404 if the requested topic ID does not exist | Pass | High | 2026-06-11 | Passed |
| BE-03-03-010 | Enrollment & Progress | Locking System | backend/tests/progress/locking.test.js | Should return status 404 if the requested course ID does not exist | Pass | High | 2026-06-11 | Passed |
| BE-04-01-001 | Evaluation Engine | Topic Quizzes | backend/tests/evaluation/quiz.test.js | Should retrieve quiz questions without correctOptionIndex and status 200 | Pass | High | 2026-06-11 | Passed |
| BE-04-01-002 | Evaluation Engine | Topic Quizzes | backend/tests/evaluation/quiz.test.js | Should block quiz retrieval if the topic is locked with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-04-01-003 | Evaluation Engine | Topic Quizzes | backend/tests/evaluation/quiz.test.js | Submitting correct quiz answers should result in a pass status 200 and unlock topic | Pass | High | 2026-06-11 | Passed |
| BE-04-01-004 | Evaluation Engine | Topic Quizzes | backend/tests/evaluation/quiz.test.js | Submitting incorrect quiz answers should fail grading with status 200, leaving topic locked | Pass | High | 2026-06-11 | Passed |
| BE-04-01-005 | Evaluation Engine | Topic Quizzes | backend/tests/evaluation/quiz.test.js | Submitting a quiz should record a document in the QuizAttempts collection | Pass | High | 2026-06-11 | Passed |
| BE-04-01-006 | Evaluation Engine | Topic Quizzes | backend/tests/evaluation/quiz.test.js | Learners must be allowed to submit a quiz multiple times, generating multiple attempt records | Pass | High | 2026-06-11 | Passed |
| BE-04-01-007 | Evaluation Engine | Topic Quizzes | backend/tests/evaluation/quiz.test.js | Submitting quiz with missing answers body field returns status 400 | Pass | High | 2026-06-11 | Passed |
| BE-04-01-008 | Evaluation Engine | Topic Quizzes | backend/tests/evaluation/quiz.test.js | Submitting answer list with malformed or missing question IDs returns status 400 | Pass | High | 2026-06-11 | Passed |
| BE-04-01-009 | Evaluation Engine | Topic Quizzes | backend/tests/evaluation/quiz.test.js | Should return status 404 if retrieving quiz for a non-existent topic ID | Pass | High | 2026-06-11 | Passed |
| BE-04-01-010 | Evaluation Engine | Topic Quizzes | backend/tests/evaluation/quiz.test.js | Should return status 404 if topic exists but does not have a quiz configured | Pass | High | 2026-06-11 | Passed |
| BE-04-02-001 | Evaluation Engine | Final Exam | backend/tests/evaluation/exam.test.js | Retrieving final exam should fail with status 403 if curriculum topics are incomplete | Pass | High | 2026-06-11 | Passed |
| BE-04-02-002 | Evaluation Engine | Final Exam | backend/tests/evaluation/exam.test.js | Retrieving final exam should succeed with status 200 and hide answer keys when topics are complete | Pass | High | 2026-06-11 | Passed |
| BE-04-02-003 | Evaluation Engine | Final Exam | backend/tests/evaluation/exam.test.js | Submitting correct final exam answers should pass grading with status 200, enabling certificate flags | Pass | High | 2026-06-11 | Passed |
| BE-04-02-004 | Evaluation Engine | Final Exam | backend/tests/evaluation/exam.test.js | Submitting incorrect final exam answers should fail grading with status 200, leaving certificate false | Pass | High | 2026-06-11 | Passed |
| BE-04-02-005 | Evaluation Engine | Final Exam | backend/tests/evaluation/exam.test.js | Submitting final exam should record a document in the FinalExamAttempts collection | Pass | High | 2026-06-11 | Passed |
| BE-04-02-006 | Evaluation Engine | Final Exam | backend/tests/evaluation/exam.test.js | Learners must be allowed to submit a final exam multiple times, generating multiple attempt records | Pass | High | 2026-06-11 | Passed |
| BE-04-02-007 | Evaluation Engine | Final Exam | backend/tests/evaluation/exam.test.js | Submitting final exam with missing answers body field returns status 400 | Pass | High | 2026-06-11 | Passed |
| BE-04-02-008 | Evaluation Engine | Final Exam | backend/tests/evaluation/exam.test.js | Should return status 404 if retrieving final exam for a non-existent course ID | Pass | High | 2026-06-11 | Passed |
| BE-04-02-009 | Evaluation Engine | Final Exam | backend/tests/evaluation/exam.test.js | Should return status 404 if course exists but does not have a final exam configured | Pass | High | 2026-06-11 | Passed |
| BE-04-02-010 | Evaluation Engine | Final Exam | backend/tests/evaluation/exam.test.js | Should return status 403 if learner queries final exam for a course they are not enrolled in | Pass | High | 2026-06-11 | Passed |
| BE-05-01-001 | Certification Mgmt | Certificate Generation | backend/tests/certificate/certificate.test.js | Requesting a certificate when the final exam has not been passed should fail with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-05-01-002 | Certification Mgmt | Certificate Generation | backend/tests/certificate/certificate.test.js | Retrieving a certificate after passing the final exam should return a PDF buffer and status 200 | Pass | High | 2026-06-11 | Passed |
| BE-05-01-003 | Certification Mgmt | Certificate Generation | backend/tests/certificate/certificate.test.js | Response headers must contain correct Content-Disposition details | Pass | High | 2026-06-11 | Passed |
| BE-05-01-004 | Certification Mgmt | Certificate Generation | backend/tests/certificate/certificate.test.js | Should reject certificate requests if token is missing with status 401 | Pass | High | 2026-06-11 | Passed |
| BE-05-01-005 | Certification Mgmt | Certificate Generation | backend/tests/certificate/certificate.test.js | Should reject certificate requests if learner is not enrolled in the course with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-05-01-006 | Certification Mgmt | Certificate Generation | backend/tests/certificate/certificate.test.js | Successfully requesting a certificate must create a unique Certificate record in Mongoose | Pass | High | 2026-06-11 | Passed |
| BE-05-01-007 | Certification Mgmt | Certificate Generation | backend/tests/certificate/certificate.test.js | Multiple certificate requests should return the same certificate ID instead of creating new records | Pass | High | 2026-06-11 | Passed |
| BE-05-01-008 | Certification Mgmt | Certificate Generation | backend/tests/certificate/certificate.test.js | Should return status 404 if generating a certificate for a non-existent course ID | Pass | High | 2026-06-11 | Passed |
| BE-05-01-009 | Certification Mgmt | Certificate Generation | backend/tests/certificate/certificate.test.js | Certificate generation should query latest user name from database | Pass | High | 2026-06-11 | Passed |
| BE-05-01-010 | Certification Mgmt | Certificate Generation | backend/tests/certificate/certificate.test.js | Should return status 500 if database operations fail during certificate mapping | Pass | High | 2026-06-11 | Passed |
| BE-06-01-001 | Progress & Analytics | Instructor Analytics | backend/tests/analytics/analytics.test.js | Should retrieve course analytics successfully as the owning instructor with status 200 | Pass | High | 2026-06-11 | Passed |
| BE-06-01-002 | Progress & Analytics | Instructor Analytics | backend/tests/analytics/analytics.test.js | Should reject analytics queries if token is missing with status 401 | Pass | High | 2026-06-11 | Passed |
| BE-06-01-003 | Progress & Analytics | Instructor Analytics | backend/tests/analytics/analytics.test.js | Should block Learners from viewing course analytics with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-06-01-004 | Progress & Analytics | Instructor Analytics | backend/tests/analytics/analytics.test.js | Should block non-owning instructors from viewing course analytics with status 403 | Pass | High | 2026-06-11 | Passed |
| BE-06-01-005 | Progress & Analytics | Instructor Analytics | backend/tests/analytics/analytics.test.js | Analytics response payload must contain key aggregation statistics properties | Pass | High | 2026-06-11 | Passed |
| BE-06-01-006 | Progress & Analytics | Instructor Analytics | backend/tests/analytics/analytics.test.js | Analytics enrollment count should correctly match database records | Pass | High | 2026-06-11 | Passed |
| BE-06-01-007 | Progress & Analytics | Instructor Analytics | backend/tests/analytics/analytics.test.js | Completion rate calculation should output correct percentage average | Pass | High | 2026-06-11 | Passed |
| BE-06-01-008 | Progress & Analytics | Instructor Analytics | backend/tests/analytics/analytics.test.js | Average quiz score calculation should output correct score average | Pass | High | 2026-06-11 | Passed |
| BE-06-01-009 | Progress & Analytics | Instructor Analytics | backend/tests/analytics/analytics.test.js | Should return status 404 if requested course ID does not exist | Pass | High | 2026-06-11 | Passed |
| BE-06-01-010 | Progress & Analytics | Instructor Analytics | backend/tests/analytics/analytics.test.js | Should return status 500 if aggregation pipeline throws an execution error | Pass | High | 2026-06-11 | Passed |

## Passed Testcases Summary
The following test cases for the User Onboarding and Authentication module are passing:
- BE-01-01-001 to BE-01-01-010 (User Registration)
- BE-01-02-001 to BE-01-02-010 (User Login)
- BE-01-03-001 to BE-01-03-010 (User Profile Management)

The following test cases for the Course & Curriculum Management module are passing:
- BE-02-01-001 to BE-02-01-010 (Course Creation & Management)
- BE-02-02-001 to BE-02-02-010 (Curriculum Design)
- BE-02-03-001 to BE-02-03-010 (Content & Resource Management)

The following test cases for the Enrollment & Progress Tracking module are passing:
- BE-03-01-001 to BE-03-01-010 (Course Discovery & Enrollment)
- BE-03-02-001 to BE-03-02-010 (Learner Progress Tracking)
- BE-03-03-001 to BE-03-03-010 (Sequential Access & Locking System)

The following test cases for the Evaluation Engine module are passing:
- BE-04-01-001 to BE-04-01-010 (Topic Quizzes) (Verified)
- BE-04-02-001 to BE-04-02-010 (Final Exam) (Verified)

The following test cases for the Certification Mgmt module are passing:
- BE-05-01-001 to BE-05-01-010 (Certificate Generation) (Verified)

The following test cases for the Progress & Analytics Dashboard module are passing:
- BE-06-01-001 to BE-06-01-010 (Instructor Analytics) (Verified)
