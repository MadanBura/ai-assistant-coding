# Feature Specification: User Profile & Target Role Configuration
## Feature Path: `features/user-profile-target-role-configuration.md`

### 1. Feature Overview
This feature manages the user lifecycle from onboarding to preference configuration. Candidates can register, authenticate, set their professional profiles, select target roles (e.g., Backend Developer, System Architect, Frontend Engineer), specify target experience levels (Junior, Mid, Senior, Lead), and adjust user experience preferences (e.g., interface theme, coding layouts).

---

### 2. User Stories
* **US-1.1 (Onboarding)**: As a new candidate, I want to sign up using standard credentials or social providers so that I can create a secure account on the platform.
* **US-1.2 (Role Configuration)**: As a registered user, I want to select my target role and expertise level so that the AI mock interviewer can adjust its difficulty and ask relevant domain questions.
* **US-1.3 (Preference Tweaking)**: As a user, I want to customize user preferences such as Dark/Light theme, default programming language, and interface layouts.

---

### 3. Functional Requirements

#### 3.1 Registration & Login
* **FR-1.1.1**: Support local email/password sign-up with password strength validation (minimum 8 characters, 1 number, 1 uppercase, 1 special character).
* **FR-1.1.2**: Support OAuth2 single-sign-on (SSO) using Google and GitHub.
* **FR-1.1.3**: Standard Session Management (JWT-based token system, cookie storage, and refresh token rotation).

#### 3.2 Profile Management
* **FR-1.2.1**: User profile page showing name, avatar upload, and email configuration.
* **FR-1.2.2**: "Delete Account" option complying with privacy requirements (GDPR/CCPA deletion request).

#### 3.3 Role Selection & Experience Levels
* **FR-1.3.1**: Dropdown selection for Target Roles:
  * *Software Engineer (Generalist)*
  * *Frontend Engineer*
  * *Backend Engineer*
  * *System Architect*
  * *DevOps / SRE*
* **FR-1.3.2**: Level configuration:
  * *Entry / Junior* ($0\text{-}2 \text{ years of experience}$)
  * *Mid-Level* ($2\text{-}5 \text{ years of experience}$)
  * *Senior* ($5\text{-}8 \text{ years of experience}$)
  * *Staff / Lead* ($8+ \text{ years of experience}$)

#### 3.4 User Preferences
* **FR-1.4.1**: Theme selector (defaulting to System Theme, with options for Dark and Light).
* **FR-1.4.2**: Default Language Choice (Python, JavaScript, Java, C++).
* **FR-1.4.3**: Notification settings (email summaries, session reminders).

---

### 4. Technical Design Notes

#### Proposed API Endpoints
* `POST /api/auth/register` — Standard email registration.
* `POST /api/auth/login` — Standard login returning Access and Refresh tokens.
* `GET /api/user/profile` — Retrieves the current user profile.
* `PUT /api/user/profile` — Updates user profile, target role, experience level, and preferences.

#### Schema Updates
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NULL, -- Null if OAuth used
    full_name VARCHAR(255),
    avatar_url VARCHAR(255),
    target_role VARCHAR(100),
    experience_level VARCHAR(50),
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### 5. Acceptance Criteria

| ID | Scenario | Given | When | Then |
| :--- | :--- | :--- | :--- | :--- |
| **AC-1.1** | Email Validation | A user fills in registration | Email is invalid or exists | Display descriptive error and block submit. |
| **AC-1.2** | Role Impact | User selects "Senior System Architect" | User starts a Technical Mock | AI interviewer asks design questions (e.g., scalability, sharding) instead of basic sorting algorithms. |
| **AC-1.3** | Account Deletion | User requests account deletion | User confirms deletion | Delete user record and scrub personal files from the system. |
