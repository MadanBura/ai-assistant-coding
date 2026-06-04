# Feature Detail: Registration and Role Selection

## Feature ID: FEAT-101

---

## 1. Purpose
Enable new users (Buyers, Property Owners, and Real Estate Agents) to securely register, verify their identities via a 6-digit email confirmation token, select their primary operational role, and access role-specific functionality while preventing duplicate accounts and unauthorized access.

---

## 2. User Stories
* **US-101-1 (Registration & Role Setup):** As a new user, I want to register an account choosing a default role (Buyer, Owner, Agent) so that my initial profile setup is tailored to my needs.
  * *Dependency:* None.
  * *Edge Case:* User registers as an Owner but later needs to buy/rent a property.
  * *Resolution:* The platform interface must support an "agent/buyer/owner mode toggle" in the profile settings, but core account data remains unified under a single user ID.
* **US-101-2 (Agent Onboarding & Licensing):** As a real estate agent, I want to submit my license number during onboarding so that I can apply for a "Verified Agent" status.
  * *Dependency:* US-101-1.
  * *Edge Case:* Agent submits a license number that is already registered by another user.
  * *Resolution:* System blocks registration, flags the record, and triggers an alert for manual administrator investigation.

---

## 3. Functional Requirements
1. **FR-101-1 (Onboarding Form):** The system must present a registration interface accepting: Full Name, Email, Password, Phone Number, Role Selection, and Agent License Number (conditional).
2. **FR-101-2 (Verification Token Generation):** Upon form submission, the system must create a record in state `PENDING_VERIFICATION`, generate a cryptographically secure 6-digit verification code, set its expiry to 15 minutes, and dispatch it to the user's email.
3. **FR-101-3 (Role Access Routing):** Once verified, the user must be routed to the onboarding wizard appropriate for their role (e.g., Agents to agency branding; Owners to property upload; Buyers to search).
4. **FR-101-4 (Third-Party Auth):** The system must support Google and Apple OAuth logins, matching existing email records or creating new verified accounts with a default role of "Buyer".

---

## 4. Validation Rules
* **Email:** Must match RFC 5322 regex validation. Must not use a temporary domain (blacklist check).
* **Password:** Minimum 8 characters, maximum 64 characters. Must contain at least 1 uppercase letter, 1 lowercase letter, 1 numeric digit, and 1 special character (`!@#$%^&*()_+[]{}|;:',.<>?`).
* **Phone Number:** Must match E.164 international phone number format.
* **Role Selection:** Must be restricted to values: `buyer`, `owner`, `agent`.
* **Agent License Number:** Alphabetic prefix followed by 6 to 10 digits (e.g. `RE-123456789`). Required only if role is `agent`.

---

## 5. Edge Cases
* **Edge Case 1: Verification Token Expiry**
  * *Scenario:* User enters correct token after 15-minute expiration threshold.
  * *Resolution:* System rejects submission with code `TOKEN_EXPIRED`, prompts user to click "Resend Token", and invalidates the previous token.
* **Edge Case 2: Concurrent Submissions with Same Email**
  * *Scenario:* User clicks "Submit" multiple times in rapid succession.
  * *Resolution:* Apply a unique index on the email column in the database and wrap the creation transaction in an optimistic lock. The backend will return `409 Conflict` on the duplicate requests.

---

## 6. Dependencies
* Email notification dispatch service (SMTP/SendGrid configuration).
* Session token manager (JWT service).

---

## 7. API Requirements

### Register Account
* **Method & Route:** `POST /api/auth/register`
* **Headers:** `Content-Type: application/json`
* **Request Payload:**
```json
{
  "email": "sarah.j@example.com",
  "password": "SecurePassword123!",
  "fullName": "Sarah Jenkins",
  "role": "buyer",
  "phone": "+12065550192",
  "licenseNumber": null
}
```
* **Response `201 Created`:**
```json
{
  "status": "success",
  "message": "Account created. Verification code sent.",
  "tokenReferenceId": "verification_uuid_102938"
}
```
* **Response `400 Bad Request`:**
```json
{
  "status": "error",
  "code": "VALIDATION_FAILED",
  "details": ["Password must contain at least one special character."]
}
```

### Verify Token
* **Method & Route:** `POST /api/auth/verify`
* **Request Payload:**
```json
{
  "tokenReferenceId": "verification_uuid_102938",
  "code": "582910"
}
```
* **Response `200 OK`:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_90210",
    "email": "sarah.j@example.com",
    "role": "buyer"
  }
}
```

---

## 8. Database Impact
* **Table:** `users`
  * Add fields: `is_verified` (boolean), `verification_code_hash` (varchar), `verification_expiry` (timestamp), `role` (enum: buyer, owner, agent).
* **Constraints:**
  * Unique constraint on `email`.
* **Indexes:**
  * Unique b-tree index on `email`.

---

## 9. UI Components
* **Registration Form Widget:** Responsive centered card containing text fields, role selectors (using visual card toggles instead of radio buttons), password strength indicator, and conditional agent license input field.
* **Verification Screen:** Modal displaying 6 inline input boxes for the verification code digits, a countdown timer (mm:ss), and a "Resend Code" link (disabled until countdown reaches 0).

---

## 10. Security Requirements
* Enforce password hashing using `bcrypt` with salt cost 12 on backend storage.
* Pass verification code in hashed format in the database to prevent database-read leaks.
* Rate limit register endpoint to 5 requests per 10 minutes per IP to prevent DDoS or account creation spam.

---

## 11. Acceptance Criteria
* **AC-101-1:**
  * *Given* a new user is filling the registration form with valid input,
  * *When* they click "Register",
  * *Then* the system saves user data in database, returns `201 Created`, and dispatches the 6-digit code.
* **AC-101-2:**
  * *Given* a user has received a verification code,
  * *When* they input the code on the validation screen within 15 minutes,
  * *Then* their database record changes to `is_verified: true` and they are logged in with a JWT cookie.

---

## 12. Definition of Done
* Backend validators and endpoints written and unit-tested (min 80% coverage).
* Database migration created and run against staging.
* UI component matches mobile and desktop mockups.
* Rate-limiting verified via stress tests.
