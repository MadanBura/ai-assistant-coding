# Feature Specification: Role-Based Authentication & Registration
## 1. Goal & Description
Build a secure, role-based authentication and registration system to onboard two distinct user classes: Candidates (Job Seekers) and Employers (Recruiters/Hiring Managers). The system must verify email addresses before granting access to dashboard features.

---

## 2. Scope
### In Scope
* User registration (Email, Password, Name) with role selection (Candidate or Employer).
* Secure login with JWT or Session tokens.
* Password strength validation & hashing (bcrypt).
* Email verification code/link generation and expiration (24-hour limit).
* Route protection based on user role (Candidate vs Employer dashboards).
* Password reset flow via secure email tokens.

### Out of Scope
* Third-party OAuth (Google, LinkedIn, GitHub login) - reserved for Phase 2.
* Multi-factor authentication (MFA/2FA).

---

## 3. User Flow & UI/UX Requirements
1. **Onboarding Page:** User enters the portal and selects "Sign Up".
2. **Role Selection:** A toggle or card interface prompts: "Are you a Job Seeker?" or "Are you an Employer?".
3. **Registration Form:** User enters name, email, and password. System performs front-end validation (password complexity, email structure).
4. **Verification Pending:** After submitting, user is redirected to a "Check Your Email" page. A verification link is sent to the registered email.
5. **Email Action:** Clicking the link verifies the email, updates the database status, and redirects the user to a "Verification Successful" page.
6. **Login & Redirection:** Verified users log in and are routed automatically based on their role:
   - Candidate -> `/candidate/dashboard`
   - Employer -> `/employer/dashboard`

---

## 4. Technical Specifications & API Design

### Database Model Updates (Users)
* `id` (UUID, Primary Key)
* `email` (VARCHAR, Unique, Indexed)
* `password_hash` (VARCHAR)
* `role` (ENUM: `'CANDIDATE'`, `'EMPLOYER'`)
* `is_verified` (BOOLEAN, Default: `false`)
* `verification_token` (VARCHAR, Nullable)
* `verification_token_expires` (TIMESTAMP)
* `created_at` (TIMESTAMP)

### API Endpoints
* `POST /api/auth/register`
  - Body: `{ email, password, role, name }`
  - Response: `201 Created` with message `"Verification email sent."`
* `GET /api/auth/verify?token=<token_string>`
  - Response: `200 OK` (updates `is_verified = true`), redirects to login.
* `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `200 OK` with token (JWT) and user object `{ id, role, is_verified }`.
* `POST /api/auth/forgot-password`
  - Body: `{ email }`
* `POST /api/auth/reset-password`
  - Body: `{ token, new_password }`

---

## 5. Acceptance Criteria (AC)
* **AC-1:** Verification link must expire precisely 24 hours after generation.
* **AC-2:** Unverified users attempting to access dashboards must be redirected to a warning page prompt to verify email.
* **AC-3:** Candidate accounts must NOT be able to access routes prefix `/employer/*`, returning a `403 Forbidden` response.
* **AC-4:** Passwords must require a minimum of 8 characters, containing at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
