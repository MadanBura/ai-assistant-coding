# Project Scope

This document defines the boundaries of the Learning Management System (LMS) development project, detailing what is included in the initial release (In Scope) and what is excluded (Out of Scope), along with assumptions, dependencies, and constraints.

## In Scope

The development team will implement only the following components, mapped to the features in the PRD and KPI documents:

### 1. User Onboarding and Authentication
*   **Feature 1.1: User Registration:** Sign-up endpoint and form supporting fields: name, email, password, and selection between two user roles (Learner, Instructor). Passwords must be hashed using a library like `bcrypt` before database storage.
*   **Feature 1.2: User Login:** Authentication via email and password, generating a JWT containing the user ID and role, valid for 24 hours.
*   **Feature 1.3: User Profile Management:** Private user profile endpoint (`GET /api/auth/profile`) and update endpoint (`PUT /api/auth/profile`) allowing name and email edits. Enforces role security, preventing learners from elevating their privileges.

### 2. Course & Curriculum Management
*   **Feature 2.1: Course Creation and Management:** Full CRUD endpoints and interface for course creation (Title, Description, Category) restricted to users with the Instructor role.
*   **Feature 2.2: Curriculum Design:** Creation of hierarchical Modules and Topics within a course. Features chronological sequence index editing for instructors.
*   **Feature 2.3: Content & Resource Management:** Supporting external resource links/embeds within topics, including video URLs (YouTube, Vimeo, AWS S3), text-based markdown notes, and document/reference URLs (PDFs).

### 3. Enrollment & Progress Tracking
*   **Feature 3.1: Course Discovery and Enrollment:** Public/authenticated course browsing API and interface. Enrolling in a course instantiates a progress document initialized to 0% complete.
*   **Feature 3.2: Learner Progress Tracking:** Completing a topic recalculates course completion percentage (Completed Topics / Total Topics * 100) and saves the progress state.
*   **Feature 3.3: Sequential Access & Locking System:** Enforcing sequential access logic where Topic N is locked unless Topic N-1 is completed. The final exam remains locked until all course topics are completed. Enforced at both the client UI and server API layer.

### 4. Evaluation Engine
*   **Feature 4.1: Topic-Level Quiz Assessments:** Quizzes for specific topics, supporting question submission, server-side grading, passing score verification, and score tracking with multiple attempts (retakes) allowed.
*   **Feature 4.2: Course-Level Final Examination:** Comprehensive exam at the end of a course. Reaching the passing threshold marks the course status as complete and flags the learner's profile as eligible for certification.

### 5. Certification Management
*   **Feature 5.1: Automatic Certificate Generation and Download:** Server-side PDF generation triggered only upon passing the final exam. Generates a PDF containing the learner's name (at the time of completion), course title, completion date, and a uniquely generated certificate ID.

### 6. Progress & Analytics Dashboard
*   **Feature 6.1: Instructor Progress & Performance Analytics:** A dashboard for instructors showing aggregated course statistics (enrolled learner count, completion rates, average exam/quiz scores) and a list of enrolled learners with their individual progress percentages.

---

## Out of Scope

To prevent scope creep, the following features are excluded from this project:

1.  **Native Video Hosting and Streaming:** The system will not accept direct video file uploads (e.g., `.mp4` files) or stream video files from the application backend. All video resources must be externally hosted (YouTube, Vimeo, AWS S3, etc.) and linked via URL.
2.  **E-commerce & Payments:** No payment gateway integrations (e.g., Stripe, PayPal), paid course structures, shopping carts, discount coupons, or subscription billing models.
3.  **Synchronous & Live Classrooms:** No live streaming, webinar interfaces, or integrations with third-party tools like Zoom, Google Meet, or Microsoft Teams. All learning is strictly asynchronous.
4.  **Social & Interactive Communication:** No discussion forums, comment sections, direct messaging systems between users, or peer review boards.
5.  **Offline Learning Support:** No offline mode, client-side offline database caching, or local download of resource packages. A persistent internet connection is required to interact with the application.
6.  **Native Mobile Applications:** No development of iOS, Android, or desktop applications. The platform is strictly a responsive web application optimized for desktop and mobile browsers.
7.  **Advanced Document Editor / Note-taking:** No internal text-editor for learners to write notes or annotate materials inside the LMS platform.

---

## Assumptions

1.  **Resource Persistence:** External video links and document links provided by instructors will remain active and public. The LMS will not monitor or repair broken third-party links automatically.
2.  **Environment Availability:** Node.js version 22 LTS is available in both local development and Render production environments.
3.  **Third-Party Availability:** MongoDB Atlas (database cloud), Render (backend hosting), and Vercel (frontend hosting) maintain an active, high-uptime service status.
4.  **Client Browsers:** Users access the application using evergreen web browsers supporting standard ES6+, CSS3, and HTML5 features.

---

## Dependencies

1.  **MongoDB Atlas Cloud Cluster:** The application relies entirely on MongoDB Atlas for data persistence, transaction handling, and document relational indexes.
2.  **PDF Compilation Library:** Server-side PDF generation relies on a Node.js-compatible PDF renderer (e.g., `PDFKit` or `html-pdf`) to package certificates into downloadable PDF buffers.
3.  **Authentication Protocols:** JWT (JSON Web Tokens) and bcrypt libraries are required to handle authorization states and password security.
4.  **Hosting Platforms:** Vercel for frontend distribution and Render for backend Express service routing are required platforms for continuous deployment.

---

## Constraints

1.  **Strict Tech Stack:** Development must be completed using React 19, Bootstrap 5.3, Node.js 22 LTS, Express.js 5, and MongoDB Atlas. No other frontend CSS frameworks (e.g. Tailwind CSS), databases, or alternative runtime environments may be used.
2.  **Server-Side Security:** Access rules (sequential learning, quiz validation, role privileges) must be enforced server-side. Relying solely on frontend UI locking is a violation of security constraints.
3.  **Serverless Execution Limits:** Automatic PDF generation and API computations must execute and return responses within the timeout thresholds of Render and Vercel hosting plans (typically 10-30 seconds).
4.  **Database Storage Quotas:** If utilizing the MongoDB Atlas free tier (M0), database size is restricted to 512 MB and 100 concurrent connections, which limits bulk data storage.
