## Module 1: User Onboarding and Authentication

| Feature | AC ID | Acceptance Criteria (Testable Condition) |
| :--- | :--- | :--- |
| **Feature 1.1: User Registration** | AC1 | Submitting the registration form with an email that already exists in the database returns an HTTP 400 Bad Request status. |
| | AC2 | Submitting a registration request with any required fields (name, email, role, or password) missing returns an HTTP 400 Bad Request status. |
| | AC3 | Passwords stored in MongoDB Atlas must be hashed (plain text passwords must not exist in the database). |
| | AC4 | Registering with an invalid email format (not matching regex `^\S+@\S+\.\S+$`) returns an HTTP 400 Bad Request status. |
| | AC5 | Successful registration creates a user document in MongoDB and returns an HTTP 201 Created status with the user details (excluding password). |
| **Feature 1.2: User Login** | AC1 | Submitting valid email and password credentials returns an HTTP 200 OK status and a JSON Web Token (JWT) in the response. |
| | AC2 | Logging in with an email address not registered in the system returns an HTTP 401 Unauthorized status. |
| | AC3 | Logging in with a registered email but an incorrect password returns an HTTP 401 Unauthorized status. |
| | AC4 | Sending a login request with missing email or password fields returns an HTTP 400 Bad Request status. |
| | AC5 | The generated JWT token must contain the user's database ID and role, and must be set with an expiration duration (e.g., 24 hours). |
| **Feature 1.3: User Profile Management** | AC1 | Accessing the profile endpoint (`GET /api/auth/profile`) without a valid JWT token returns an HTTP 401 Unauthorized status. |
| | AC2 | The profile endpoint returns the user's name, email, and role on a valid token with an HTTP 200 OK status. |
| | AC3 | Updating user profile details updates the user's document in MongoDB immediately and returns an HTTP 200 OK status. |
| | AC4 | A learner profile name update must update all future generated certificates of completion with the new name. |
| | AC5 | Learners are prevented from changing their role parameter (e.g., from Learner to Instructor) during profile updates, returning an HTTP 403 Forbidden status if attempted. |

## Module 2: Course & Curriculum Management

| Feature | AC ID | Acceptance Criteria (Testable Condition) |
| :--- | :--- | :--- |
| **Feature 2.1: Course Creation and Management** | AC1 | Attempting to create a course without an Instructor/Admin token returns an HTTP 403 Forbidden status. |
| | AC2 | Submitting course creation without Title, Description, or Category returns an HTTP 400 Bad Request status. |
| | AC3 | Successful course creation by an authorized user returns an HTTP 201 Created status and the course object with a unique course ID. |
| | AC4 | Instructors can update course metadata via `PUT /api/courses/:id`, returning an HTTP 200 OK status. |
| | AC5 | Deleting a course via `DELETE /api/courses/:id` removes the course metadata and cascades to delete all associated enrollment tracking data. |
| **Feature 2.2: Curriculum Design (Modules & Topics)** | AC1 | Adding a module to an existing course requires a course ID and a Module Title; if successful, returns an HTTP 201 Created status. |
| | AC2 | Adding a topic under a module requires a Topic Title; if successful, returns an HTTP 201 Created status. |
| | AC3 | Attempting to add a module or topic to a course not owned by the requesting instructor returns an HTTP 403 Forbidden status. |
| | AC4 | Rearranging the order of topics or modules must update their chronological sequence indices in MongoDB and return an HTTP 200 OK status. |
| | AC5 | Retrieving course curriculum details (`GET /api/courses/:id`) returns modules and topics sorted in ascending order of their sequence indices. |
| **Feature 2.3: Content & Resource Management (Videos, Notes, PDFs)** | AC1 | Adding a resource to a topic requires a Resource Type (Video, Notes, Document, Reference) and the resource content or URL; otherwise, returns an HTTP 400 Bad Request status. |
| | AC2 | Video resources must validate that the provided link is a valid URL format (e.g., YouTube, Vimeo, S3), returning an HTTP 400 Bad Request status on failure. |
| | AC3 | Notes content supports rich markdown text, and retrieving the topic content returns the exact markdown string. |
| | AC4 | Document links (like PDFs) must validate as a valid absolute URL, returning an HTTP 400 Bad Request status on failure. |
| | AC5 | Changing or updating a resource URL updates the database immediately and reflects on the learner's dashboard upon page refresh. |

## Module 3: Enrollment & Progress Tracking

| Feature | AC ID | Acceptance Criteria (Testable Condition) |
| :--- | :--- | :--- |
| **Feature 3.1: Course Discovery and Enrollment** | AC1 | A learner can browse all active courses via `GET /api/courses` and receive an array of courses with an HTTP 200 OK status. |
| | AC2 | Attempting to enroll in a course (`POST /api/courses/:id/enroll`) without authentication returns an HTTP 401 Unauthorized status. |
| | AC3 | Enrolling in a course creates a progress tracker document in MongoDB with progress initialized to 0% and all topics marked as incomplete. |
| | AC4 | Enrolling in a course returns an HTTP 200 OK or 201 Created status with the newly created progress tracker object. |
| | AC5 | Enrolling in an already enrolled course returns an HTTP 400 Bad Request or 409 Conflict status. |
| **Feature 3.2: Learner Progress Tracking** | AC1 | Completing a topic resource (`POST /api/topics/:topicId/complete`) marks that topic as completed in the learner's progress record. |
| | AC2 | Completing a topic recalculates the overall course progress percentage (completed topics divided by total topics) and saves it in MongoDB. |
| | AC3 | Retrieving learner course progress (`GET /api/courses/:id/progress`) returns a breakdown of completed/incomplete topics and the overall percentage. |
| | AC4 | When a topic is completed, the system returns an HTTP 200 OK status along with the updated progress object. |
| | AC5 | A learner cannot mark a topic as complete if they have not met its pre-requisite requirements (e.g. preceding topic incomplete). |
| **Feature 3.3: Sequential Access & Locking System** | AC1 | Attempting to access topic details or resources for a locked topic returns an HTTP 403 Forbidden status with a "Topic is locked" message. |
| | AC2 | In any course, Module 1, Topic 1 is unlocked by default immediately upon enrollment. |
| | AC3 | Topic N is unlocked if and only if Topic N-1 is completed. |
| | AC4 | Modules are unlocked sequentially; Topic 1 of Module M is locked until the final Topic/Assessment of Module M-1 is completed. |
| | AC5 | Accessing a course's final examination page returns an HTTP 403 Forbidden status if any topic or quiz in the course is not marked as complete. |

## Module 4: Evaluation Engine

| Feature | AC ID | Acceptance Criteria (Testable Condition) |
| :--- | :--- | :--- |
| **Feature 4.1: Topic-Level Quiz Assessments** | AC1 | Submitting a topic quiz (`POST /api/topics/:topicId/assessment/submit`) checks answers against the correct answers saved on the server. |
| | AC2 | Submitting a quiz returns a JSON response containing the learner's score, pass/fail status, and passing threshold. |
| | AC3 | If a learner achieves a score equal to or greater than the passing threshold, the topic is marked as complete, and the next topic is unlocked. |
| | AC4 | If a learner scores below the passing threshold, the topic remains incomplete, and the next topic remains locked. |
| | AC5 | Learners are allowed to submit a quiz multiple times (retakes), and each submission's score is recorded in MongoDB. |
| **Feature 4.2: Course-Level Final Examination** | AC1 | The final exam is locked and cannot be retrieved or submitted unless all course topics and quizzes are completed. |
| | AC2 | Submitting the final exam (`POST /api/courses/:id/final-exam/submit`) returns the final score and passing status. |
| | AC3 | Passing the final exam (score >= passing threshold) marks the overall course as completed and triggers certificate eligibility. |
| | AC4 | Failing the final exam keeps the course completion status as incomplete, and certificate eligibility remains false. |
| | AC5 | Final exam questions are retrieved only on request, and correct answers are never sent to the client-side browser before submission. |

## Module 5: Certification Management

| Feature | AC ID | Acceptance Criteria (Testable Condition) |
| :--- | :--- | :--- |
| **Feature 5.1: Automatic Certificate Generation and Download** | AC1 | Requesting a certificate (`GET /api/courses/:id/certificate`) when the final exam has not been passed returns an HTTP 403 Forbidden status. |
| | AC2 | When a certificate is generated, the response must include a downloadable PDF buffer or URL with an HTTP 200 OK status. |
| | AC3 | The generated certificate PDF must contain the learner's full name, the course title, date of completion, and a unique certificate ID. |
| | AC4 | The certificate ID must be uniquely generated and stored in MongoDB linked to the learner and course. |
| | AC5 | If a certificate is requested multiple times, it must retrieve the already generated certificate ID and layout rather than creating a new record. |

## Module 6: Progress & Analytics Dashboard

| Feature | AC ID | Acceptance Criteria (Testable Condition) |
| :--- | :--- | :--- |
| **Feature 6.1: Instructor Progress & Performance Analytics** | AC1 | Retrieving instructor analytics dashboard data (`GET /api/courses/:id/analytics`) without an instructor role returns an HTTP 403 Forbidden status. |
| | AC2 | The analytics payload returns the total count of enrolled learners, completion rates, and assessment pass rates. |
| | AC3 | The response must return an array of learners enrolled in the course, along with their individual progress percentages. |
| | AC4 | The response must return average quiz and final exam scores for the course. |
| | AC5 | Analytics results must dynamically update when learners complete topics or submit assessments. |
