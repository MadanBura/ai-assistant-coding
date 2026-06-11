# Feature: User Profile Management

## 1. Feature Overview
This feature allows logged-in users to manage their profile details. Users can retrieve their active account info (name, email, role) and modify their name or email address. The system enforces strict access validations: it requires a valid JWT token, prevents learners from changing their role parameter, and ensures profile name changes propagate directly to all future certificates.

## 2. Acceptance Criteria
*   **AC1:** Accessing the profile endpoint (`GET /api/auth/profile`) without a valid JWT token returns an HTTP 401 Unauthorized status.
*   **AC2:** The profile endpoint returns the user's name, email, and role on a valid token with an HTTP 200 OK status.
*   **AC3:** Updating user profile details updates the user's document in MongoDB immediately and returns an HTTP 200 OK status.
*   **AC4:** A learner profile name update must update all future generated certificates of completion with the new name.
*   **AC5:** Learners are prevented from changing their role parameter (e.g., from Learner to Instructor) during profile updates, returning an HTTP 403 Forbidden status if attempted.

## 3. UI/UX Requirements
*   **Profile Page Layout:** Responsive card layout inside the learner or instructor dashboard environment.
*   **Editable Inputs:** Fields for Name (text) and Email (text/email) are populated with current user state.
*   **Role Display:** The Role field is styled as a read-only badge or text container and cannot be modified by the user.
*   **Save Action:** "Save Profile" button with loading spinner indicator.
*   **Visual Feedback:** Displays a green success banner upon a successful update, and updates the profile display instantly.

## 4. API Endpoints Required
*   **Endpoint:** `GET /api/auth/profile`
    *   **Description:** Retrieves profile info of the authenticated user.
    *   **Request Headers:** `Authorization: Bearer <token>`
    *   **Response (200 OK):**
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
*   **Endpoint:** `PUT /api/auth/profile`
    *   **Description:** Updates profile info.
    *   **Request Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
    *   **Request Body:**
        ```json
        {
          "name": "Jane Smith",
          "email": "janesmith@example.com"
        }
        ```
    *   **Response (200 OK):**
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

## 5. Data Models / Schema
*   Consumes the **User** schema defined in Feature 1.1.
*   Updates the User document's `name` and `email` properties.
*   **Certificate Synchronization Note:** Future certificates are generated dynamically by querying the User model by ID at the time of issuance, naturally incorporating any name changes.

## 6. State Management Notes
*   **Local UI State:** Controls form field values and validation indicators.
*   **Global Auth Context:** Upon a successful profile update, updates the local context `user` state:
    `setAuthUser({ ...authUser, name: res.data.name, email: res.data.email })`
    This ensures that dashboards and navigation bars update instantly without needing a full-page reload.

## 7. Edge Cases
*   **Role Elevation Attempt:** An attacker bypasses UI limitations and sends `role: "Instructor"` in the body payload to `PUT /api/auth/profile`. The controller must explicitly whitelist and extract only `name` and `email` from `req.body`, returning an HTTP 403 Forbidden or simply ignoring/preventing modifications of the role parameter.
*   **Conflicting Email Address:** A user attempts to update their email to an address that is already registered by a different account. The database validation fails, and the endpoint returns an HTTP 400 Bad Request status.
*   **Token Expiration Mid-Edit:** If the session expires while the user is on the profile page, the request returns a 401 status, prompting the client interceptor to redirect to `/login`.

## 8. Dependencies on Other Features
*   **Feature 1.1: User Registration:** Requires the User Mongoose schema.
*   **Feature 1.2: User Login:** Requires the JWT token auth pipeline and `AuthContext` state.

## 9. Testing Requirements
*   **Frontend UI Test File:** `tests/frontend/Auth/Profile.test.jsx` (Verifies input populating, saving actions, and disabling/read-only behavior of role fields).
*   **Backend API Test File:** `tests/backend/integration/auth.test.js` (Verifies unauthenticated endpoint rejection, role modification prevention, unique email conflicts, and data updates).

## 10. Out of Scope for This Feature
*   Avatar or profile image uploads.
*   Password reset or change mechanisms.
*   Email update verification loops (sending confirm emails before changing).
