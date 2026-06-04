# Feature Specification: Role-Based Access Control (RBAC)
## Feature ID: FE-TAS-2 (Priority 01)

---

## 1. Purpose
To establish a secure, tenant-isolated authentication and authorization system that restricts user permissions and data visibility according to designated roles (Admin, Sales Manager, Sales Representative).

---

## 2. User Stories
* **US-TAS-001:** As a System Admin, I want to manage security roles and assign users to specific roles so that I can control access to the application data.
* **US-TAS-002:** As a Sales Manager, I want to view my team members' records and deals but prevent Sales Representatives of other teams from viewing them.
* **US-TAS-003:** As a Sales Representative, I want to access only the Leads, Contacts, and Deals assigned to me so that I can focus on my queue and protect confidential client data.

---

## 3. Functional Requirements
1. **FR-RBAC-001:** The system shall authenticate users using email and password credentials over HTTPS.
2. **FR-RBAC-002:** The system shall issue JSON Web Tokens (JWT) upon successful authentication.
3. **FR-RBAC-003:** The system must intercept every API request to check the user's role before processing the database operation.
4. **FR-RBAC-004:** The system shall enforce data ownership filters:
   - **Admin:** Complete access (CRUD) to all records.
   - **Sales Manager:** CRUD access to records owned by users on their Team.
   - **Sales Representative:** CRUD access only to records where `owner_id` equals the representative's `user_id`.
5. **FR-RBAC-005:** The system shall support a temporary account assignment rule allowing managers to delegate Read-Write permissions of a specific deal to another representative.

---

## 4. Validation Rules
1. Password strength rules during user creation:
   - Minimum 12 characters.
   - At least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (`!@#$%^&*`).
2. The JWT token must include a payload containing `user_id`, `tenant_id`, `role`, and `exp` (expiration timestamp).
3. The token expiration (`exp`) must be set to 1 hour from issuance. Refresh tokens must expire in 24 hours.

---

## 5. Edge Cases
* **Edge Case 1 (User is Deactivated):** If a user is deactivated by an Admin, all their active sessions must be invalidated immediately by dropping matching refresh tokens in the cache database (Redis).
* **Edge Case 2 (User Changes Teams):** When a user is transferred to a new team, historical records (e.g., deals) must retain their original team assignments unless the Admin explicitly selects "Reassign Historical Records" during the transfer.
* **Edge Case 3 (Simultaneous Roles):** The system must reject configuration changes that assign multiple roles to a single user. A user must have exactly one role.

---

## 6. Dependencies
* None (Core bootstrap feature).

---

## 7. API Requirements

### 7.1 Authentication (Login)
* **URL:** `/api/v1/auth/login`
* **Method:** `POST`
* **Payload:**
  ```json
  {
    "email": "user@apexsales.com",
    "password": "Password123!"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "d7410468-b78f...",
    "user": {
      "id": "e67d268a-6b45-4b07-a3f2-c7f8a7be8e70",
      "email": "user@apexsales.com",
      "role": "Sales Representative",
      "tenant_id": "c16d558a-442a-43d9-a299-66bf8aee20ee"
    }
  }
  ```

### 7.2 Session Refresh
* **URL:** `/api/v1/auth/refresh`
* **Method:** `POST`
* **Payload:**
  ```json
  {
    "refresh_token": "d7410468-b78f..."
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "token": "new_jwt_token_string",
    "refresh_token": "new_refresh_token_string"
  }
  ```

---

## 8. Database Impact
* **Table:** `USERS`
  - Adds fields: `role` (ENUM: `Admin`, `Manager`, `Rep`), `is_active` (BOOLEAN), `password_hash` (VARCHAR), `tenant_id` (UUID FK).
* **Table:** `TENANTS`
  - Columns: `id` (UUID PK), `company_name` (VARCHAR), `created_at` (TIMESTAMP).
* **Redis Store:**
  - Key format: `session:refresh_token:<refresh_token>` -> value: `user_id` (TTL: 86400 seconds).

---

## 9. UI Components
* **Login Card:** Clean form fields with client-side regex validations, password toggle visibility, and error message banners.
* **Navigation Sidebar:** Renders navigation links conditionally using user context roles.
* **Access Denied Page:** A `403 Forbidden` screen with a "Return to Dashboard" action block.

---

## 10. Security Requirements
* All communications must use HTTPS with TLS 1.3.
* Password encryption using `bcrypt` (12 rounds).
* Store JWT in local memory (React state) and the Refresh Token in a `HttpOnly`, `Secure`, `SameSite=Strict` cookie.

---

## 11. Acceptance Criteria (AC)
* **AC-RBAC-001:** Given a user provides incorrect credentials, when they attempt to log in, the system must return a `401 Unauthorized` status and a generic error message "Invalid email or password".
* **AC-RBAC-002:** Given a Sales Representative attempts to fetch lead details assigned to another representative, when the request is processed, the system must return `403 Forbidden`.
* **AC-RBAC-003:** Given a user token expires, when they make an API request, the system must intercept the request and return `401 Unauthorized` with token-expired flags, triggering a client-side refresh workflow.

---

## 12. Definition of Done (DoD)
1. Unit test coverage of JWT generation, encryption, and authorization middleware is 100%.
2. Audit logs generate correct records for both successful logins and blocked attempts.
3. Access boundaries validated using automated API testing scripts (Supertest).
4. Code passes security vulnerability scanner checks (e.g. Snyk/npm audit).
