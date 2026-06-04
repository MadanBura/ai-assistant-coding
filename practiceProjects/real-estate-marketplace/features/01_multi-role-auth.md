# Feature Specification: Multi-role Registration & Authentication

## 1. Feature Info
* **Feature ID:** `FT-1.1`
* **Priority:** 1 (Critical Path Dependency)
* **Title:** Multi-role Registration & Authentication

---

## 2. Purpose
Enable secure signup, login, password management, and session validation across the platform while strictly assigning and verifying user roles (Buyer, Property Owner, Agent, Admin). This establishes the identity and permission base needed for all downstream listing, messaging, and admin moderation features.

---

## 3. User Stories
* **US-1.1:** As a new user, I want to register an account and select a distinct role (Buyer, Owner, Agent) so that the application configures my permissions and layout correctly.
* **US-1.1.1:** As an authenticated user, I want to log in using my email/password credentials and receive a secure, persistent session token so that I don't have to re-enter credentials repeatedly.

---

## 4. Functional Requirements

### FR-101.1: Registration Form Inputs
* **Description:** The system must present a registration form capturing Full Name, Email, Password, Phone Number, and a mandatory Role Selector.
* **Input Parameters:**
  * `email` (String, Required)
  * `password` (String, Required)
  * `fullName` (String, Required)
  * `role` (Enum: `Buyer` | `Owner` | `Agent`, Required)
  * `phoneNumber` (String, Optional)
* **Output:** JSON token and user profile record.

### FR-101.2: Password Hashing & Storage
* **Description:** Passwords must be hashed backend-side before saving to the database using `bcrypt` with a minimum cost factor of 12.
* **Input:** Raw password string.
* **Output:** String hash stored in the `password_hash` column of the database.

### FR-101.3: Token-based Session Management
* **Description:** On successful signup or login, the server must issue a JSON Web Token (JWT) containing the user’s ID and Role. The token must be returned in an HTTP-only, secure cookie with a 2-hour expiration timer.
* **Expiration Timer:** 7200 seconds.

---

## 5. Validation Rules
* **VAL-101.1 (Email Format):** Email must conform to standard RFC 5322 format (e.g., `user@domain.com`).
* **VAL-101.2 (Password Complexity):** Password must be a minimum of 8 characters and contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character (e.g., `@`, `$`, `!`, `%`, `*`, `?`, `&`).
* **VAL-101.3 (Role Bounds):** The incoming registration role must match one of the predefined enums. The role of `Admin` is excluded from registration forms and can only be set via database seeding or direct DB administrator authorization.

---

## 6. Edge Cases
* **Edge Case 1: Account Hijack via Registration Interception:** If a user registers with an email that already exists, the system must immediately reject the request with a generic error message ("An account with this email already exists") and log a security alert.
* **Edge Case 2: Concurrent Session Expulsion:** When a user logs in from a second device, the previous JWT must remain valid until expiration, but the system must limit active tokens to a maximum of 5 concurrent sessions per user.

---

## 7. Dependencies
* **Upstream:** None (foundation layer).
* **Downstream:** All other features require authentication and role resolution.

---

## 8. API Requirements

### Register User
* **Endpoint:** `POST /api/v1/auth/register`
* **Request Format:** JSON
* **Request Schema:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "John Doe",
  "role": "Buyer",
  "phoneNumber": "+15550199"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "userId": "usr_772091aef",
    "email": "user@example.com",
    "role": "Buyer",
    "fullName": "John Doe"
  }
}
```
* **Cookie Header Returned:**
```http
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsIn...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=7200
```

### Login User
* **Endpoint:** `POST /api/v1/auth/login`
* **Request Schema:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```
* **Success Response (200 OK):** Same payload layout as registration.

---

## 9. Database Impact
* **Target Table:** `USER` (Creates new records).
* **Index Requirements:**
  * Unique constraint and B-Tree Index on `email` to accelerate authentication lookups.
  * Index on `role` for role-based administrative query filters.

---

## 10. UI Components
* **Authentication Layout:** Clean side-split screen. Left: Premium background image. Right: Centered glassmorphic card container.
* **Role Select Button Group:** Customized interactive segmented controls for Buyer, Owner, and Agent with explanatory tooltips.
* **Password Strength Indicator:** Real-time visual progress bar shifting from red (weak) to green (strong) based on password regex matching.

---

## 11. Security Requirements
* **SEC-101.1 (Token Integrity):** All incoming HTTP requests to protected routes must pass the JWT cookie through validation middleware.
* **SEC-101.2 (Rate Limiting):** The `/auth/login` and `/auth/register` endpoints must be restricted to 5 attempts per 15 minutes per IP address. Exceeding this triggers a `429 Too Many Requests` status code.

---

## 12. Acceptance Criteria
* **AC-101:** Verify that registering with an existing email returns an explicit 400 validation error without leaking sensitive database structure info.
* **AC-102:** Verify that the JWT contains correct user metadata (`id`, `role`) and that editing this client-side renders the token invalid.

---

## 13. Definition of Done
* [ ] DB migrations successfully executed in staging.
* [ ] Password verification tests pass with 100% success rate under 100 iterations.
* [ ] 80%+ unit and integration testing coverage of auth controller methods.
