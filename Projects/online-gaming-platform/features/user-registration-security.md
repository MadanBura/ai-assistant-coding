# Feature Specification: User Registration & Security Module (Auth Service)

---

## 1. Overview
The **User Registration & Security Module (Auth Service)** is a high-performance, secure, and distributed microservice responsible for handling identity management, authentication, and authorization across the global online gaming platform.

The service provides two primary login streams:
1. **Traditional Credentials:** Secure email and password registration and login.
2. **Third-Party Identity Providers (OAuth 2.0 / OpenID Connect):** Single sign-on (SSO) integrations supporting **Google**, **Discord**, **Apple**, and **Steam**.

Session management is built on short-lived stateless JSON Web Tokens (JWT) for authentication combined with secure, rotatable Refresh Tokens stored in encrypted HTTP-only cookies to enable seamless token rotation.

---

## 2. User Stories

### 2.1. Traditional Signup & Login
* **US-1.1:** As a new player, I want to create a platform account using my email address and a password so that I can establish a unique player identity.
* **US-1.2:** As an existing player, I want to log in using my email and password so that I can retrieve my profile, stats, and lobby state.

### 2.2. Third-Party Authentication (SSO)
* **US-2.1:** As a casual player, I want to register or log in using my Google or Discord account so that I can access the game immediately without managing another password.
* **US-2.2:** As an iOS or macOS player, I want to log in using "Sign in with Apple" to maintain consistent credentials across my devices.
* **US-2.3:** As a PC gamer, I want to link and log in via my Steam account so that I can synchronize my profile with my Steam persona and find Steam friends on the platform.

### 2.3. Session Persistence & Token Rotation
* **US-3.1:** As an active player, I want the system to silently renew my credentials in the background so that my gameplay session is not interrupted when my access token expires.
* **US-3.2:** As a security-conscious user, I want the platform to detect session hijacking or token reuse and immediately log me out of all active devices if my refresh token is compromised.

---

## 3. Functional Requirements

### 3.1. User Registration
* **FR-1.1:** The system must validate email uniqueness, password strength, and username availability before creating a record.
* **FR-1.2:** Passwords must be hashed using a computationally hard key-derivation function (Argon2id) prior to storage.
* **FR-1.3:** Upon successful registration, the system must trigger an asynchronous verification email.

### 3.2. Authentication (Traditional & OAuth)
* **FR-2.1:** Support local login returning a structured JSON response containing user profile details, an access token, and a refresh token (via cookie).
* **FR-2.2:** Support OAuth 2.0 authorization code flows for Google, Discord, Apple, and Steam.
* **FR-2.3 (Account Linking):** If a user attempts to log in via OAuth with an email that already exists via local registration, the system must securely verify ownership and merge the authentication methods under a unified user record.

### 3.3. Token & Session Management
* **FR-3.1 (Access Tokens):** Issue stateless JWT tokens signed with an asymmetric private key (RS256) with a short lifespan (15 minutes).
* **FR-3.2 (Refresh Tokens):** Issue high-entropy, database-backed refresh tokens stored inside an `HttpOnly`, `Secure`, `SameSite=Strict` cookie with a lifespan of 7 days.
* **FR-3.3 (Token Rotation):** Every refresh request must invalidate the old refresh token, rotate it, and issue a new pair of access and refresh tokens.
* **FR-3.4 (Token Reuse Detection):** If a revoked or previously used refresh token is presented, the system must assume token theft, immediately invalidate the entire token family tree, and revoke all active sessions for the user.

---

## 4. API Endpoints

### 4.1. Local Authentication
#### `POST /api/v1/auth/register`
* **Description:** Registers a new user account with credentials.
* **Request Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "username": "GamerOne",
  "email": "gamer.one@example.com",
  "password": "p@sswordStrong123!"
}
```
* **Success Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "usr_9a2b8c3d-e4f5-6a7b-8c9d-0e1f2a3b4c5d",
      "username": "GamerOne",
      "email": "gamer.one@example.com",
      "email_verified": false
    },
    "token": {
      "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 900
    }
  }
}
```
* **Set-Cookie Header:** `refresh_token=rt_xyz123...; Max-Age=604800; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict`

#### `POST /api/v1/auth/login`
* **Description:** Authenticates a user using email and password.
* **Request Body:**
```json
{
  "email": "gamer.one@example.com",
  "password": "p@sswordStrong123!"
}
```
* **Success Response (200 OK):** Identical structure to registration response.

---

### 4.2. OAuth 2.0 Authentication
#### `GET /api/v1/auth/oauth/{provider}`
* **Description:** Initiates OAuth flow (where `{provider}` is `google`, `discord`, `apple`, or `steam`).
* **Response (302 Redirect):** Redirects client to the provider's authorization consent screen with target query parameters (client_id, scope, redirect_uri, state, code_challenge).

#### `GET /api/v1/auth/oauth/{provider}/callback`
* **Description:** Recipient callback endpoint for authorization codes.
* **Query Parameters:** `code`, `state`
* **Success Response (302 Redirect to Client Web App):** Redirects with query parameters indicating success and containing short-lived exchange codes, or issues refresh cookies directly.

---

### 4.3. Session & Token Operations
#### `POST /api/v1/auth/token/refresh`
* **Description:** Request a new access token using a refresh token.
* **Request Headers:** (Implicit cookie transmission)
* **Cookie Content:** `refresh_token=rt_xyz123...`
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "token": {
      "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 900
    }
  }
}
```
* **Set-Cookie Header:** Rotated refresh token cookie is set.

#### `POST /api/v1/auth/logout`
* **Description:** Logs out a user and revokes their refresh token.
* **Request Headers:** `Authorization: Bearer <access_token>`
* **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Session successfully terminated."
}
```
* **Set-Cookie Header:** `refresh_token=; Max-Age=0; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict`

---

## 5. Database Schema

The database model is defined using a normalized SQL schema layout optimized for PostgreSQL:

```sql
-- Enums for authentication roles and providers
CREATE TYPE role_type AS ENUM ('USER', 'MODERATOR', 'ADMIN');
CREATE TYPE auth_provider AS ENUM ('LOCAL', 'GOOGLE', 'DISCORD', 'APPLE', 'STEAM');

-- Users Table: Core account records
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for pure OAuth signups
    role role_type NOT NULL DEFAULT 'USER',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OAuth Identities Table: Links users to multiple external SSO accounts
CREATE TABLE user_oauth_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider auth_provider NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL, -- Subject ID returned by OAuth provider
    provider_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- Refresh Tokens Table: Implements token rotation logic
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash of refresh token
    family_id UUID NOT NULL, -- Groups token rotations together
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_oauth_lookup ON user_oauth_identities(provider, provider_user_id);
```

---

## 6. Security Requirements

* **Password Hashing:** Passwords must be hashed using **Argon2id** (minimum settings: Memory = 64MB, Iterations = 3, Parallelism = 4).
* **JWT Signature Algorithm:** JWT tokens must use asymmetric signatures signed with **RS256** (2048-bit keys minimum) or **Ed256 (Ed256/Ed25519)**. The public key must be exposed via a well-known JWKS URL (`/.well-known/jwks.json`).
* **Secure Cookies:** Refresh token cookies must utilize:
  * `HttpOnly`: Prevents access via client JavaScript.
  * `Secure`: Transmitted only over HTTPS connections.
  * `SameSite=Strict`: Protects against Cross-Site Request Forgery (CSRF).
* **Rate Limiting:**
  * Login / Registration endpoints: Max 10 attempts per IP per 5 minutes.
  * Token Refresh requests: Max 20 attempts per IP per 5 minutes.
* **CORS Policy:** Restrict cross-origin headers to verified front-end domains; never reflect `Access-Control-Allow-Origin: *` for endpoints requiring session cookies.

---

## 7. Validation Rules

### 7.1. User Credentials Validation
* **Username:**
  * Min length: 3 characters, Max length: 30 characters.
  * Allowed characters: letters, numbers, underscores (`_`), hyphens (`-`).
  * Cannot start or end with non-alphanumeric characters.
* **Email:**
  * Must conform to standard RFC 5322 format.
  * Domains must contain valid TLDs.
* **Password:**
  * Min length: 8 characters, Max length: 72 characters (Argon2 limitation).
  * Must contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., `@`, `$`, `!`, `%`, `*`, `?`, `&`).

---

## 8. Error Handling

### 8.1. Standard Error Schema
All error payloads must follow the RFC 7807 problem details specification structure:

```json
{
  "status": "error",
  "code": "VALIDATION_FAILED",
  "message": "Input validation failed.",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one number."
    }
  ]
}
```

### 8.2. Error Codes Registry
* **400 Bad Request (`INVALID_INPUT`):** Request fields violate validation rules.
* **401 Unauthorized (`INVALID_CREDENTIALS`):** Invalid username, email, or password.
* **401 Unauthorized (`TOKEN_EXPIRED`):** Access token has expired.
* **401 Unauthorized (`TOKEN_INVALID`):** Access token signature verification failed.
* **403 Forbidden (`ACCOUNT_LOCKED`):** User is banned or locked out.
* **429 Too Many Requests (`RATE_LIMIT_EXCEEDED`):** Requests exceed threshold.

---

## 9. Acceptance Criteria (BDD Format)

#### Scenario 1: Password Strength Invalidation
* **Given** a user is registering on the signup screen,
* **When** they enter a password that does not contain a special character or number,
* **Then** the platform must return an validation error (`400 Bad Request`) with error code `VALIDATION_FAILED` pointing to the password field.

#### Scenario 2: Social OAuth Account Linking
* **Given** a user is logged in via their email/password account `user@domain.com`,
* **When** they visit their settings page and request to link their Discord account,
* **Then** the platform must authorize through Discord OAuth callback, match the provider ID, save the mapping to `user_oauth_identities`, and allow subsequent logins via Discord.

#### Scenario 3: Token Invalidation upon Hijacking
* **Given** an attacker steals a client's active refresh token `rt_family1_token2`,
* **When** the attacker submits `rt_family1_token2` to `/api/v1/auth/token/refresh` while the original client already updated the token to `rt_family1_token3`,
* **Then** the refresh token engine must detect that `rt_family1_token2` was already used, set `is_revoked = TRUE` for all active tokens sharing `family_id`, delete all session sessions in Redis, and return `401 Unauthorized`.

---

## 10. Edge Cases & Mitigations

### 10.1. Email Identity Conflict
* **Issue:** User registers with `email@domain.com` via Local Login, and later logs in using Google OAuth with the same email.
* **Mitigation:** If the Google account is verified, link the identity to the existing user ID. If the email on the OAuth login is unverified, reject the connection and prompt the user to log in with their password and link the provider from settings.

### 10.2. Cold-Start / JWT Asymmetric Key Rollout
* **Issue:** Key rotation occurs, and a user submits a JWT signed with an older private key.
* **Mitigation:** The token verification engine must maintain a cache of the previous public key in JWKS for 24 hours post-rotation to gracefully allow old sessions to transition.
