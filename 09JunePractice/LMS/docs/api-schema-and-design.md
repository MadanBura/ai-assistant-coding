# API Schema and Design Document

This document serves as the single source of truth for the backend API schemas, database layouts, authentication structures, and endpoint signatures of the Learning Management System (LMS).

## 1. Overview

*   **Base URL:**
    *   Development: `http://localhost:5000/api`
    *   Production: `https://lms-backend.render.com/api`
*   **API Versioning:** Versioning is controlled via routes mapping under the `/api` prefix (no version-prefix needed for the initial release).
*   **Auth Mechanism:** JSON Web Tokens (JWT) passed in the HTTP Authorization header.
*   **Standard Response Format:** All endpoints return JSON objects (except the binary certificate downloader) conforming to this envelope:
    ```json
    {
      "success": true,
      "data": {}
    }
    ```
    Errors follow this structure:
    ```json
    {
      "success": false,
      "message": "Error details go here"
    }
    ```

## 2. Authentication & Authorization

### Auth Flow
1.  **Register:** User submits credentials via `POST /api/auth/register`.
2.  **Login:** User submits credentials via `POST /api/auth/login`. On success, the server returns a JWT.
3.  **Authentication:** The client stores the JWT in memory and attaches it to subsequent requests.
4.  **Authorization:** Backend custom middleware (`verifyToken` and `verifyRole`) checks the token signature and verifies role permissions before invoking routing controllers.

### Token Structure
*   **Headers:** `{"alg": "HS256", "typ": "JWT"}`
*   **Payload:**
    *   `id`: Mongoose ObjectId string (representing the User record).
    *   `role`: String (`Learner` or `Instructor`).
    *   `exp`: UNIX expiration timestamp (set to 24 hours from issuance).
*   **Transmission:** Handled via standard HTTP Headers:
    `Authorization: Bearer <JWT_Token_String>`

### Route Security Matrix
| Route Pattern | HTTP Verb | Authentication Required | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `/auth/register` | POST | No | Anyone |
| `/auth/login` | POST | No | Anyone |
| `/auth/profile` | GET, PUT | Yes | Learner, Instructor |
| `/courses` | GET | Yes | Learner, Instructor |
| `/courses` | POST | Yes | Instructor |
| `/courses/:id` | GET | Yes | Learner, Instructor |
| `/courses/:id` | PUT, DELETE | Yes | Instructor (Owner only) |
| `/courses/:id/modules` | POST | Yes | Instructor (Owner only) |
| `/modules/:moduleId/topics` | POST | Yes | Instructor (Owner only) |
| `/courses/:id/curriculum/reorder`| PUT | Yes | Instructor (Owner only) |
| `/topics/:topicId/resources` | POST | Yes | Instructor (Owner only) |
| `/resources/:id` | PUT | Yes | Instructor (Owner only) |
| `/courses/:id/enroll` | POST | Yes | Learner |
| `/courses/:id/progress` | GET | Yes | Learner |
| `/topics/:topicId/complete` | POST | Yes | Learner |
| `/courses/:id/topics/:topicId` | GET | Yes | Learner (Enrolled/Unlocked) |
| `/topics/:topicId/assessment` | GET | Yes | Learner (Unlocked) |
| `/topics/:topicId/assessment/submit`| POST | Yes | Learner (Unlocked) |
| `/courses/:id/final-exam` | GET | Yes | Learner (100% complete) |
| `/courses/:id/final-exam/submit` | POST | Yes | Learner (100% complete) |
| `/courses/:id/certificate` | GET | Yes | Learner (Exam Passed) |
| `/courses/:id/analytics` | GET | Yes | Instructor (Owner only) |

## 3. Database Schema

All schemas are defined using Mongoose for MongoDB Atlas.

### Users Collection
*   `_id`: ObjectId (Primary Key, Auto-generated)
*   `name`: String (Required, trimmed)
*   `email`: String (Required, unique, lowercase, validated format)
*   `password`: String (Required, hashed via bcrypt)
*   `role`: String (Required, Enum: `['Learner', 'Instructor']`)
*   `createdAt`: Date (Auto-populated)
*   `updatedAt`: Date (Auto-populated)

### Courses Collection
*   `_id`: ObjectId (Primary Key, Auto-generated)
*   `title`: String (Required, trimmed)
*   `description`: String (Required, trimmed)
*   `category`: String (Required, trimmed)
*   `instructorId`: ObjectId (Required, ref: `Users`, Indexed)
*   `createdAt`: Date (Auto-populated)
*   `updatedAt`: Date (Auto-populated)

### Modules Collection
*   `_id`: ObjectId (Primary Key)
*   `courseId`: ObjectId (Required, ref: `Courses`, Indexed)
*   `title`: String (Required, trimmed)
*   `sequenceIndex`: Number (Required)
*   `createdAt`: Date
*   `updatedAt`: Date

### Topics Collection
*   `_id`: ObjectId (Primary Key)
*   `moduleId`: ObjectId (Required, ref: `Modules`, Indexed)
*   `title`: String (Required, trimmed)
*   `sequenceIndex`: Number (Required)
*   `createdAt`: Date
*   `updatedAt`: Date

### Resources Collection
*   `_id`: ObjectId (Primary Key)
*   `topicId`: ObjectId (Required, ref: `Topics`, Indexed)
*   `type`: String (Required, Enum: `['Video', 'Notes', 'Document', 'Reference']`)
*   `url`: String (Required if type != 'Notes'; must pass standard URL regex check)
*   `content`: String (Required if type == 'Notes'; holds Markdown string)
*   `createdAt`: Date
*   `updatedAt`: Date

### Progress Collection
*   `_id`: ObjectId (Primary Key)
*   `userId`: ObjectId (Required, ref: `Users`, Indexed)
*   `courseId`: ObjectId (Required, ref: `Courses`, Indexed)
*   `progressPercent`: Number (Required, Default: `0`, range: 0-100)
*   `completedTopics`: Array of ObjectIds (ref: `Topics`)
*   `completedQuizzes`: Array of ObjectIds (ref: `Topics`)
*   `finalExamPassed`: Boolean (Required, Default: `false`)
*   `createdAt`: Date
*   `updatedAt`: Date
*   *Constraint:* Unique compound index on `userId` + `courseId`.

### Quizzes Collection
*   `_id`: ObjectId (Primary Key)
*   `topicId`: ObjectId (Required, ref: `Topics`, unique, Indexed)
*   `passingThreshold`: Number (Required, Default: `70`, range: 0-100)
*   `questions`: Array of Objects:
    *   `questionText`: String (Required)
    *   `options`: Array of Strings (Required, minimum 2 options)
    *   `correctOptionIndex`: Number (Required, zero-indexed integer)
*   `createdAt`: Date
*   `updatedAt`: Date

### QuizAttempts Collection
*   `_id`: ObjectId (Primary Key)
*   `userId`: ObjectId (Required, ref: `Users`, Indexed)
*   `topicId`: ObjectId (Required, ref: `Topics`, Indexed)
*   `score`: Number (Required, range: 0-100)
*   `passed`: Boolean (Required)
*   `createdAt`: Date

### FinalExams Collection
*   `_id`: ObjectId (Primary Key)
*   `courseId`: ObjectId (Required, ref: `Courses`, unique, Indexed)
*   `passingThreshold`: Number (Required, Default: `75`, range: 0-100)
*   `questions`: Array of Objects:
    *   `questionText`: String (Required)
    *   `options`: Array of Strings (Required)
    *   `correctOptionIndex`: Number (Required, zero-indexed)
*   `createdAt`: Date
*   `updatedAt`: Date

### FinalExamAttempts Collection
*   `_id`: ObjectId (Primary Key)
*   `userId`: ObjectId (Required, ref: `Users`, Indexed)
*   `courseId`: ObjectId (Required, ref: `Courses`, Indexed)
*   `score`: Number (Required, range: 0-100)
*   `passed`: Boolean (Required)
*   `createdAt`: Date

### Certificates Collection
*   `_id`: ObjectId (Primary Key)
*   `certificateId`: String (Required, unique, formatted uuid or custom string)
*   `userId`: ObjectId (Required, ref: `Users`, Indexed)
*   `courseId`: ObjectId (Required, ref: `Courses`, Indexed)
*   `issuedAt`: Date (Required, Default: `Date.now`)
*   `createdAt`: Date
*   *Constraint:* Unique compound index on `userId` + `courseId`.

---

## 4. API Endpoints

### Module 1: User Onboarding and Authentication

#### Endpoint: POST /auth/register
*   **Description:** Creates a new Learner or Instructor account.
*   **Auth required:** No
*   **Request Headers:** `Content-Type: application/json`
*   **Request Body:**
    *   `name` (String, required)
    *   `email` (String, required)
    *   `password` (String, required, min 8 characters)
    *   `role` (String, required, must be `Learner` or `Instructor`)
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "Learner"
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request` (Payload validation failed or missing parameters): `{"success": false, "message": "Name, email, password, and role are required."}`
    *   `400 Bad Request` (Email already exists): `{"success": false, "message": "Email already in use."}`
*   **Business/Validation Rules:** Email must match regex `^\S+@\S+\.\S+$`. Password must be hashed.

#### Endpoint: POST /auth/login
*   **Description:** Authenticates credentials and returns JWT.
*   **Auth required:** No
*   **Request Headers:** `Content-Type: application/json`
*   **Request Body:**
    *   `email` (String, required)
    *   `password` (String, required)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "data": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "Learner"
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request` (Missing fields): `{"success": false, "message": "Email and password are required."}`
    *   `410 Unauthorized` (Incorrect email or password): `{"success": false, "message": "Invalid email or password."}`

#### Endpoint: GET /auth/profile
*   **Description:** Retrieves profile of the logged-in user.
*   **Auth required:** Yes
*   **Request Headers:** `Authorization: Bearer <JWT>`
*   **Request Body:** None
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "Learner"
      }
    }
    ```
*   **Error Responses:**
    *   `401 Unauthorized` (Token missing or expired): `{"success": false, "message": "Access token is missing or expired."}`

#### Endpoint: PUT /auth/profile
*   **Description:** Modifies name and email parameters.
*   **Auth required:** Yes
*   **Request Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
*   **Request Body:**
    *   `name` (String, optional)
    *   `email` (String, optional)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Jane Smith",
        "email": "janesmith@example.com",
        "role": "Learner"
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request` (Email collision): `{"success": false, "message": "Email already in use."}`
    *   `403 Forbidden` (Role manipulation attempt): `{"success": false, "message": "Modifying user role is prohibited."}`
*   **Business Rules:** Controller must explicitly strip any `role` or `password` parameters sent in `req.body`, processing only `name` and `email` properties.

---

### Module 2: Course & Curriculum Management

#### Endpoint: GET /courses
*   **Description:** Returns lists of active courses.
*   **Auth required:** Yes
*   **Request Headers:** `Authorization: Bearer <JWT>`
*   **Request Body:** None
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "60d1fe4f5311236168a109cb",
          "title": "React 19 Basics",
          "description": "Fundamental course.",
          "category": "Software Development",
          "instructorId": "60d0fe4f5311236168a109cb"
        }
      ]
    }
    ```

#### Endpoint: POST /courses
*   **Description:** Creates a course metadata container.
*   **Auth required:** Yes (Instructor only)
*   **Request Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
*   **Request Body:**
    *   `title` (String, required)
    *   `description` (String, required)
    *   `category` (String, required)
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "60d1fe4f5311236168a109cb",
        "title": "React 19 Basics",
        "description": "Fundamental course.",
        "category": "Software Development",
        "instructorId": "60d0fe4f5311236168a109cb"
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request` (Missing fields): `{"success": false, "message": "Title, description, and category are required."}`
    *   `403 Forbidden` (Role is Learner): `{"success": false, "message": "Access restricted to instructors only."}`

#### Endpoint: GET /courses/:id
*   **Description:** Returns full course hierarchy details (Modules, Topics, and resource keys).
*   **Auth required:** Yes
*   **Request Headers:** `Authorization: Bearer <JWT>`
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "60d1fe4f5311236168a109cb",
        "title": "React 19 Basics",
        "modules": [
          {
            "id": "60d2ae4f5311236168a109cc",
            "title": "Introduction",
            "sequenceIndex": 0,
            "topics": [
              {
                "id": "60d3ae4f5311236168a109cd",
                "title": "Welcome topic",
                "sequenceIndex": 0
              }
            ]
          }
        ]
      }
    }
    ```

#### Endpoint: PUT /courses/:id
*   **Description:** Updates course metadata details.
*   **Auth required:** Yes (Instructor, Course Owner only)
*   **Request Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
*   **Request Body:**
    *   `title` (String, optional)
    *   `description` (String, optional)
    *   `category` (String, optional)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": { "id": "60d1fe4f5311236168a109cb", "title": "New Title" }
    }
    ```
*   **Error Responses:**
    *   `403 Forbidden` (Not Owner): `{"success": false, "message": "Only the owning instructor can modify this course."}`

#### Endpoint: DELETE /courses/:id
*   **Description:** Deletes a course.
*   **Auth required:** Yes (Instructor, Course Owner only)
*   **Request Headers:** `Authorization: Bearer <JWT>`
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Course and associated progress records deleted successfully."
    }
    ```

#### Endpoint: POST /courses/:id/modules
*   **Description:** Creates a module inside a course.
*   **Auth required:** Yes (Instructor, Course Owner only)
*   **Request Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
*   **Request Body:**
    *   `title` (String, required)
    *   `sequenceIndex` (Number, required)
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "60d2ae4f5311236168a109cc",
        "courseId": "60d1fe4f5311236168a109cb",
        "title": "Module Title",
        "sequenceIndex": 0
      }
    }
    ```

#### Endpoint: POST /modules/:moduleId/topics
*   **Description:** Creates a topic inside a module.
*   **Auth required:** Yes (Instructor, Owner of course containing module)
*   **Request Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
*   **Request Body:**
    *   `title` (String, required)
    *   `sequenceIndex` (Number, required)
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "60d3ae4f5311236168a109cd",
        "moduleId": "60d2ae4f5311236168a109cc",
        "title": "Topic Title",
        "sequenceIndex": 0
      }
    }
    ```

#### Endpoint: PUT /courses/:id/curriculum/reorder
*   **Description:** Batched sequence update for modules or topics.
*   **Auth required:** Yes (Instructor, Owner only)
*   **Request Body:**
    *   `modules` (Array of objects containing `{ id: String, sequenceIndex: Number }`)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Curriculum sequence updated successfully."
    }
    ```

#### Endpoint: POST /topics/:topicId/resources
*   **Description:** Attaches a resource (Video, Notes, PDF link) to a topic.
*   **Auth required:** Yes (Instructor, Owner only)
*   **Request Body:**
    *   `type` (String, required, values: `Video`, `Notes`, `Document`, `Reference`)
    *   `url` (String, required if type != `Notes`)
    *   `content` (String, required if type == `Notes`)
*   **Success Response (201 Created):**
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
*   **Business Rules:** URL format is validated server-side for `Video`, `Document`, `Reference`.

#### Endpoint: PUT /resources/:id
*   **Description:** Modifies content or URL of a resource.
*   **Auth required:** Yes (Instructor, Owner only)
*   **Request Body:** Same properties as POST.
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": { "id": "60d4ae4f5311236168a109cf", "url": "https://newurl.com" }
    }
    ```

---

### Module 3: Enrollment & Progress Tracking

#### Endpoint: POST /courses/:id/enroll
*   **Description:** Enrolls a learner.
*   **Auth required:** Yes (Learner only)
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "60d5ae4f5311236168a109d1",
        "userId": "60d0fe4f5311236168a109ca",
        "courseId": "60d1fe4f5311236168a109cb",
        "progressPercent": 0,
        "completedTopics": [],
        "finalExamPassed": false
      }
    }
    ```
*   **Error Responses:**
    *   `409 Conflict` (Already Enrolled): `{"success": false, "message": "Already enrolled in this course."}`

#### Endpoint: GET /courses/:id/progress
*   **Description:** Retrieves completion statistics for the enrolled student.
*   **Auth required:** Yes (Learner enrolled only)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "progressPercent": 50,
        "completedTopics": ["60d3ae4f5311236168a109cd"],
        "totalTopics": 2
      }
    }
    ```

#### Endpoint: POST /topics/:topicId/complete
*   **Description:** Marks a topic complete and increments progress percentage.
*   **Auth required:** Yes (Learner enrolled only)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": { "progressPercent": 100 }
    }
    ```
*   **Error Responses:**
    *   `403 Forbidden` (Locked sequence): `{"success": false, "message": "Pre-requisite topics are not completed."}`

#### Endpoint: GET /courses/:id/topics/:topicId
*   **Description:** Retrieves topic details and resources. Enforces sequential locks.
*   **Auth required:** Yes (Learner enrolled only)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "60d3ae4f5311236168a109cd",
        "title": "Welcome Topic",
        "resources": [
          { "type": "Video", "url": "https://youtube.com/embed/dQw4w9WgXcQ" }
        ]
      }
    }
    ```
*   **Error Responses:**
    *   `403 Forbidden` (Topic is locked): `{"success": false, "message": "Topic is locked."}`

---

### Module 4: Evaluation Engine

#### Endpoint: GET /topics/:topicId/assessment
*   **Description:** Retrieves quiz details. Excludes answer keys.
*   **Auth required:** Yes (Learner, Topic must be unlocked)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "passingThreshold": 70,
        "questions": [
          {
            "id": "q1",
            "questionText": "What hook is used for effects?",
            "options": ["useState", "useEffect", "useMemo"]
          }
        ]
      }
    }
    ```

#### Endpoint: POST /topics/:topicId/assessment/submit
*   **Description:** Submits student answers, grades server-side, and logs result.
*   **Auth required:** Yes
*   **Request Body:**
    *   `answers` (Array of objects: `[{ "questionId": "q1", "selectedOptionIndex": 1 }]`)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "score": 100,
      "passed": true,
      "passingThreshold": 70,
      "progressPercent": 75
    }
    ```

#### Endpoint: GET /courses/:id/final-exam
*   **Description:** Retrieves course final exam questions. Excludes answers.
*   **Auth required:** Yes (Enrolled learner, progress must be 100%)
*   **Success Response (200 OK):** Same structure as quiz questions.
*   **Error Responses:**
    *   `403 Forbidden` (Locked exam): `{"success": false, "message": "Final exam is locked until all curriculum topics are completed."}`

#### Endpoint: POST /courses/:id/final-exam/submit
*   **Description:** Submits final exam answers, grades them, and marks course completed on success.
*   **Auth required:** Yes (Progress must be 100%)
*   **Request Body:** Same structure as quiz submission.
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "score": 90,
      "passed": true,
      "passingThreshold": 75,
      "certificateEligible": true
    }
    ```

---

### Module 5: Certification Management

#### Endpoint: GET /courses/:id/certificate
*   **Description:** Compiles and streams a dynamically generated completion PDF.
*   **Auth required:** Yes (Enrolled learner, final exam passed only)
*   **Response Headers:** `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="..."`
*   **Success Response (200 OK):**
    *   Binary application/pdf Stream.
*   **Error Responses:**
    *   `403 Forbidden` (Not eligible): `{"success": false, "message": "Certificate unavailable. You must pass the final examination first."}`

---

### Module 6: Progress & Analytics Dashboard

#### Endpoint: GET /courses/:id/analytics
*   **Description:** Returns course analytics logs.
*   **Auth required:** Yes (Instructor, Course Owner only)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "totalEnrolled": 150,
        "completionRate": 65.5,
        "averageQuizScore": 82.3,
        "averageFinalExamScore": 79.1,
        "learners": [
          {
            "id": "60d0fe4f5311236168a109ca",
            "name": "Jane Doe",
            "email": "jane@example.com",
            "progressPercent": 100,
            "completedAt": "2026-06-11T12:00:00Z"
          }
        ]
      }
    }
    ```
*   **Error Responses:**
    *   `403 Forbidden` (Unauthorized role or not owner): `{"success": false, "message": "Access denied. Only the course instructor can view analytics."}`

---

## 5. Shared/Common Schemas

### UserResponse
```json
{
  "id": "ObjectId String",
  "name": "String",
  "email": "String",
  "role": "Learner | Instructor"
}
```

### CourseResponse
```json
{
  "id": "ObjectId String",
  "title": "String",
  "description": "String",
  "category": "String",
  "instructorId": "ObjectId String"
}
```

### ProgressResponse
```json
{
  "id": "ObjectId String",
  "userId": "ObjectId String",
  "courseId": "ObjectId String",
  "progressPercent": "Number",
  "completedTopics": ["ObjectId String"],
  "finalExamPassed": "Boolean"
}
```

---

## 6. Error Code Reference Table

| HTTP Status | Error Message String | Cause / Triggering Condition |
| :--- | :--- | :--- |
| `400` | "Name, email, password, and role are required." | Registration payload contains empty fields. |
| `400` | "Email already in use." | Registration/Profile update email already exists. |
| `400` | "Email and password are required." | Login payload missing arguments. |
| `401` | "Invalid email or password." | Incorrect credentials on login route. |
| `401` | "Access token is missing or expired." | Token decryption validation failure. |
| `403` | "Access restricted to instructors only." | Learner attempting to hit Instructor CRUD endpoints. |
| `403` | "Only the owning instructor can modify this course." | Course edits triggered by an instructor other than creator. |
| `403` | "Modifying user role is prohibited." | User profile update body overrides role parameter. |
| `403` | "Topic is locked." | Sequential path lock validation failure. |
| `403` | "Pre-requisite topics are not completed." | Progress mark complete endpoint bypass attempt. |
| `403` | "Final exam is locked until all curriculum topics are completed." | Exam query before progress percent reaches 100%. |
| `403` | "Certificate unavailable. You must pass the final examination first." | Claiming PDF buffer before passing final assessment. |
| `409` | "Already enrolled in this course." | Learner duplicate enrollment endpoint hit. |
| `500` | "Internal Server Error." | Unexpected runtime code or DB timeout exception. |

---

## 7. Rate Limiting & Security Notes

1.  **Rate Limiting:**
    *   Endpoints `/auth/login` and `/auth/register` are limited to **5 requests per minute per IP** to prevent brute-force attacks.
    *   Standard resource APIs are limited to **100 requests per minute per user ID**.
2.  **Helmet Integration:** Standard Helmet configuration is loaded on Express startup to set key HTTP headers (e.g. `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, hiding `X-Powered-By`).
3.  **Strict CORS Configuration:** The middleware allows browser requests only from whitelisted frontend Vercel subdomains.
4.  **NoSQL Injection Sanitization:** Backend sanitizes request payloads, query arrays, and route arguments to verify they conform strictly to expected Mongoose Types and strings, blocking operator characters (like `$gt`, `$ne`).
