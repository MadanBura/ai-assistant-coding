# Feature Specification: Social Account OAuth Integration
## Feature ID: FEAT-102

---

## 1. Purpose
Provide secure integration with major social networks (LinkedIn, Twitter/X, Instagram, and Facebook) using industry-standard OAuth 2.0. Enable the platform to capture long-lived access and refresh tokens, store them using strong encryption, and publish media/text posts automatically on behalf of connected workspace profiles.

---

## 2. User Stories
* **US-103:** As a Workspace Admin, I want to link our workspace to LinkedIn, Facebook, Instagram, and Twitter/X using secure OAuth consent flows so that CreatorSuite can publish posts on our behalf.

---

## 3. Functional Requirements
1. **FR-102-1:** The platform MUST support separate OAuth 2.0 authorization request loops for:
   * LinkedIn (OAuth 2.0)
   * Meta (Facebook Pages and Instagram Professional accounts via Facebook Login API)
   * Twitter/X (OAuth 2.0 Authorization Code Flow with PKCE)
2. **FR-102-2:** The initiation endpoint MUST generate a unique state parameter (cryptographic nonce) and store it in session storage to protect against CSRF.
3. **FR-102-3:** Upon receiving authorization codes at the callback URL, the backend MUST exchange codes for access tokens (and refresh tokens where applicable).
4. **FR-102-4:** The backend MUST extract profile details (e.g. username, avatar image, platform account ID) from the social API immediately after auth success.
5. **FR-102-5:** Social access and refresh tokens MUST be encrypted before they are stored in the database using `AES-256-GCM` with a system-wide master key.
6. **FR-102-6:** Workspace admins MUST be able to view all active integrations on the Settings page, showing the username, platform, connection date, and active/disconnected status indicators.
7. **FR-102-7:** Admin MUST be able to delete a connection, which immediately drops the access tokens, wipes the credentials database record, and invalidates the session keys where supported.

---

## 4. Validation Rules
* **State Verification:** The callback state parameter MUST exactly match the state parameter generated at initiation. If there is a mismatch, the login attempt MUST fail with a `400 Bad Request` code.
* **Scope Consent:** Ensure users grant required publishing permissions (e.g., `w_member_social` for LinkedIn, `pages_manage_posts` & `instagram_basic` & `instagram_content_publish` for Meta). If scopes are not granted, return an error indicating permissions are incomplete.

---

## 5. Edge Cases
* **Declined Permissions:** If a user completes OAuth but unchecks essential permissions on the provider platform, catch this state in callback, display a screen instructing the user: *"CreatorSuite requires publishing permissions to schedule posts. Please try again and accept all permissions."*, and do not store incomplete credentials.
* **Token Expired/Invalidated:** If an API call fails with a token error during background queue publication:
  1. Halt execution on that channel.
  2. Change post status to `Failed`.
  3. Mark the integration connection status in the database as `DISCONNECTED`.
  4. Dispatch email and in-app system warning to Workspace Admins.
* **Profile Already Connected:** If a user tries to connect a profile that is already linked to a different workspace, reject the link attempt and show an informative message: *"This profile is already connected to another workspace. Please disconnect it there first."*

---

## 6. Dependencies
* **Official SDKs / Direct API integrations:** Custom REST clients configured to query:
  * Meta Graph API (v20.0+)
  * LinkedIn API (v2)
  * Twitter/X API (v2)
* **Encryption Key Availability:** Relies on the environment variable `ENCRYPTION_SECRET_KEY` being configured in the production vault.

---

## 7. API Requirements

### 7.1 Initiate OAuth Integration
* **GET `/api/v1/integrations/oauth/:platform`**
* **Parameters:** `platform` must be in `['linkedin', 'twitter', 'facebook', 'instagram']`
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Response `200 OK`:**
  ```json
  {
    "redirect_url": "https://linkedin.com/oauth/v2/authorization?response_type=code&client_id=...&redirect_uri=...&state=secure_nonce"
  }
  ```

### 7.2 OAuth Redirect Callback
* **POST `/api/v1/integrations/oauth/:platform/callback`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Request Body:**
  ```json
  {
    "code": "auth_code_from_provider",
    "state": "secure_nonce"
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "channel_id": "7f8b9e6a-12a3-4b5c-8d9e-0f1e2d3c4b5a",
    "platform": "linkedin",
    "username": "Acme Brand Official",
    "status": "ACTIVE"
  }
  ```

### 7.3 Disconnect Channel
* **DELETE `/api/v1/integrations/channels/:channel_id`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Response `204 No Content`**

---

## 8. Database Impact
Direct writes to `SOCIAL_CHANNEL` table:

```sql
-- Schema representation:
CREATE TABLE social_channel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('LINKEDIN', 'TWITTER', 'FACEBOOK', 'INSTAGRAM')),
    platform_user_id VARCHAR(255) NOT NULL,
    platform_username VARCHAR(255) NOT NULL,
    platform_avatar_url TEXT,
    encrypted_access_token TEXT NOT NULL,
    encrypted_refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    connection_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (connection_status IN ('ACTIVE', 'DISCONNECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (workspace_id, platform, platform_user_id)
);
```

### Encryption Helper Example (Node.js)
```javascript
const crypto = require('crypto');
const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_SECRET_KEY, 'hex'); // 32 bytes

function encrypt(text) {
    const iv = crypto.randomBytes(12); // 96 bits for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
```

---

## 9. UI Components
* **Integrations Control Panel:** List of card elements representing each supported social network platform. Each card features:
  * Platform logo and helper description.
  * Status badge (`Connected as @Username` or `Not connected`).
  * Action button (`Connect Channel` or `Disconnect`).
* **Disconnect Confirmation Modal:** Warns user of implications: *"Disconnecting will cancel all pending queued posts scheduled for this channel. Are you sure?"*

---

## 10. Security Requirements
1. **Token Protection:** Tokens MUST NEVER be logged to file systems or displayed in plaintext in developer console tools.
2. **Key Rotation Readiness:** The token encryption controller code must support processing decryption using both current and previous validation keys to allow seamless key rotation.
3. **Admin Check:** Only workspace users possessing `ADMIN` roles can read/edit/delete integration configurations.

---

## 11. Acceptance Criteria
* **AC-102-1:** Completing the OAuth loop creates a record in the database containing valid encrypted tokens and platform attributes.
* **AC-102-2:** Encrypted database strings cannot be decrypted without the correct system-wide `ENCRYPTION_SECRET_KEY`.
* **AC-102-3:** API requests targeting channel deletion drop database credentials cleanly and immediately return `204 No Content`.
* **AC-102-4:** Session state parameter verification prevents replay CSRF login attacks.

---

## 12. Definition of Done (DoD)
1. **Security Review:** Cryptographic libraries and helper algorithms reviewed for standards alignment.
2. **Integration Tests:** Completed integration tests mock external OAuth redirects and verify error branches.
3. **Secrets Setup:** Deployment configuration instructions include mandatory encryption keys variables checklist.
