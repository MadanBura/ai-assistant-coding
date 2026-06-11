# Feature: User Registration

## 1. Feature Overview
This feature allows new users (both Learners and Instructors) to register accounts on the LMS platform. Registration collects the user's full name, email, role, and password. The backend securely hashes the password before saving the user document to MongoDB Atlas.

## 2. Acceptance Criteria
*   **AC1:** Submitting the registration form with an email that already exists in the database returns an HTTP 400 Bad Request status.
*   **AC2:** Submitting a registration request with any required fields (name, email, role, or password) missing returns an HTTP 400 Bad Request status.
*   **AC3:** Passwords stored in MongoDB Atlas must be hashed (plain text passwords must not exist in the database).
*   **AC4:** Registering with an invalid email format (not matching regex `^\S+@\S+\.\S+$`) returns an HTTP 400 Bad Request status.
*   **AC5:** Successful registration creates a user document in MongoDB and returns an HTTP 201 Created status with the user details (excluding password).

## 3. UI/UX Requirements
*   **Form Interface:** Clean, responsive form utilizing Bootstrap 5.3 card classes. Contains inputs for Name (text), Email (email), Password (password), and Role (dropdown select).
*   **Role Selection:** Explicit dropdown option selection: "Learner" or "Instructor". Default state is unselected or prompts user to choose.
*   **Input Validation:** Displays client-side browser error styles under fields when email format is invalid or password field is empty.
*   **Loading State:** The "Register" button is disabled and displays a loading spinner during API request transmission.
*   **Success Transition:** Upon success, displays a green Bootstrap success alert and redirects the user to the Login page (`/login`) after 1.5 seconds.

## 4. API Endpoints Required
*   **Endpoint:** `POST /api/auth/register`
*   **Description:** Creates a new user account.
*   **Request Headers:** `Content-Type: application/json`
*   **Request Body:**
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "SecurePassword123",
      "role": "Learner"
    }
    ```
*   **Response (201 Created):**
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
*   **Response (400 Bad Request):**
    ```json
    {
      "success": false,
      "message": "Email already in use"
    }
    ```

## 5. Data Models / Schema
### User Model (Mongoose)
```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Learner', 'Instructor']
  }
}, { timestamps: true });
```

## 6. State Management Notes
*   **Component State:** Managed locally using React `useState` hooks for registration form parameters: `name`, `email`, `password`, `role`.
*   **API State:** `isLoading` (boolean) and `errorMessage` (string) states to handle loader display and alert popups.
*   **Global State:** Registration does not populate the global `AuthContext` since the user must log in after registering.

## 7. Edge Cases
*   **Rapid Multi-Click Submission:** The submit button must be disabled when `isLoading === true` to block redundant API requests.
*   **NoSQL Payload Injection:** Sanitization is handled server-side by checking variables via validator middleware (e.g. `Joi` or `Zod`) to prevent MongoDB operator injection.
*   **Database Sync Downtime:** Database write timeout is intercepted; returns a clean JSON error response (`503 Service Unavailable`) instead of a stack trace or server crash.

## 8. Dependencies on Other Features
*   **None** (Baseline foundational feature).

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Auth/Register.test.jsx` (Validates form rendering, input validation warnings, submission loading, and redirect triggers).
*   **Backend API Test File:** `tests/backend/integration/auth.test.js` (Validates unique constraints, missing fields, correct status codes, and database password encryption).

## 10. Out of Scope for This Feature
*   Third-party SSO authentication (e.g. Google Login, GitHub Auth).
*   Account confirmation emails or OTP validation.
*   Password recovery triggers or "Forgot Password" endpoints.
