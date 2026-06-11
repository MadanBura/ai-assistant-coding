# Feature: User Login

## 1. Feature Overview
This feature enables registered users to log in securely. Users provide their registered email and password. The system checks credentials against the database, verifies the hashed password, and returns a JSON Web Token (JWT) containing the user's database ID and role. The token is used to authenticate all subsequent client requests.

## 2. Acceptance Criteria
*   **AC1:** Submitting valid email and password credentials returns an HTTP 200 OK status and a JSON Web Token (JWT) in the response.
*   **AC2:** Logging in with an email address not registered in the system returns an HTTP 401 Unauthorized status.
*   **AC3:** Logging in with a registered email but an incorrect password returns an HTTP 401 Unauthorized status.
*   **AC4:** Sending a login request with missing email or password fields returns an HTTP 400 Bad Request status.
*   **AC5:** The generated JWT token must contain the user's database ID and role, and must be set with an expiration duration (e.g., 24 hours).

## 3. UI/UX Requirements
*   **Form Interface:** Clean, centered Bootstrap card layout with fields for Email (text) and Password (password).
*   **Validation Alerts:** Clear error alerts (Bootstrap alert classes) displayed at the top of the card if credentials fail.
*   **Loading State:** Disable input fields and the Login button during active requests, showing a spinner on the button.
*   **Role-Based Redirect:** Upon login success, the client:
    *   Saves the JWT in memory and sets the authorization header.
    *   Decodes the token to identify the role.
    *   Redirects Learners to `/dashboard/learner`.
    *   Redirects Instructors to `/dashboard/instructor`.
*   **Session Guard:** If a logged-in user navigates directly to `/login`, they are automatically redirected to their appropriate dashboard page.

## 4. API Endpoints Required
*   **Endpoint:** `POST /api/auth/login`
*   **Description:** Authenticates credentials and returns a session token.
*   **Request Headers:** `Content-Type: application/json`
*   **Request Body:**
    ```json
    {
      "email": "jane@example.com",
      "password": "SecurePassword123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDBmZTRmNTMxMTIzNjE2OGExMDljYSIsInJvbGUiOiJMZWFybmVyIiwiaWF0IjoxNzEzMjc4Mzg4LCJleHAiOjE3MTMzNjQ3ODh9...",
      "data": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "Learner"
      }
    }
    ```
*   **Response (401 Unauthorized):**
    ```json
    {
      "success": false,
      "message": "Invalid email or password"
    }
    ```

## 5. Data Models / Schema
*   This feature consumes data from the existing **User** collection (defined in Feature 1.1: User Registration).

## 6. State Management Notes
*   **Global Context:** Saves authentication details using React's `AuthContext`.
    *   Context state properties: `user` (object containing `{ id, name, email, role }` or null) and `token` (string or null).
*   **Axios Defaults:** Inject the token automatically into all outgoing requests via an Axios request interceptor:
    `config.headers.Authorization = `Bearer ${token}`;`
*   **Session Persistence:** If persisting across reloads, the token may be cached in `localStorage` securely, but must be checked for expiration on page startup.

## 7. Edge Cases
*   **Expired JWT Token:** If a query receives a `401 Unauthorized` token-expired status, an Axios interceptor catches the response, purges the `AuthContext` state, and redirects the browser to `/login`.
*   **Malformed Token String:** The backend verifies JWT structures strictly; corrupted headers result in a clean 401 error rather than a server crash.
*   **Rapid Repeat Logins:** Button is locked during transition states to prevent generating multiple sessions.

## 8. Dependencies on Other Features
*   **Feature 1.1: User Registration:** Requires the User schema, Mongoose models, and password hashing helpers to be implemented.

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Auth/Login.test.jsx` (Checks credential form inputs, warning display, and correct role redirects).
*   **Backend API Test File:** `tests/backend/integration/auth.test.js` (Checks JWT structure payload content, invalid credential codes, missing field responses, and expiration headers).

## 10. Out of Scope for This Feature
*   Persistent session extensions ("Remember Me" checkbox).
*   OAuth / Third-party social logins.
*   Security challenge mechanisms (Captcha).
*   IP-based rate-limiting or lockout after excessive login failures.
