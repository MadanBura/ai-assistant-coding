# Feature Specification: Workspace Setup & Invitations
## Feature ID: FEAT-101

---

## 1. Purpose
Enable users to create distinct workspaces (tenants) to isolate content and accounts for different projects or brands. Additionally, allow Workspace Administrators to invite team members via email and assign role-based permissions (`ADMIN`, `EDITOR`, `APPROVER`, `VIEW_CLIENT`).

---

## 2. User Stories
* **US-101:** As a registered user, I want to create multiple workspaces so that I can keep different client projects separated.
* **US-102:** As a Workspace Admin, I want to invite team members via email and assign them roles so that they can collaborate with appropriate permissions.

---

## 3. Functional Requirements
1. **FR-101-1:** When a user registers a new account, the system MUST automatically prompt them to create their first workspace.
2. **FR-101-2:** The workspace creation interface MUST require a workspace `name` (string, 3-50 characters) and generate a unique `uuid` in the database.
3. **FR-101-3:** The creator of the workspace MUST be assigned the role of `ADMIN` in the `USER_WORKSPACE_ROLE` mapping table.
4. **FR-101-4:** Admins MUST have a settings page to invite members by entering an email address and selecting one of the workspace roles.
5. **FR-101-5:** The system MUST generate a secure cryptographic token associated with the invitation and send an email containing a link: `https://creatorsuite.com/accept-invite?token=<cryptographic_token>`.
6. **FR-101-6:** The invitation token MUST expire after 48 hours.
7. **FR-101-7:** When the invitee clicks the invitation link, they must log in (or register) to accept the invite. Upon acceptance, the user is joined to the workspace and the token is invalidated.

---

## 4. Validation Rules
* **Workspace Name:** Must be between 3 and 50 characters, containing only letters, numbers, spaces, and hyphens. No special characters or leading/trailing whitespace.
* **Email Input:** Must pass standard RFC 5322 regex validation.
* **Role Selection:** Must belong to the enum: `['ADMIN', 'EDITOR', 'APPROVER', 'VIEW_CLIENT']`.

---

## 5. Edge Cases
* **Invite Already Accepted:** If a user clicks a token that has already been marked as accepted, show a warning page: *"This invitation has already been accepted. Redirecting to your dashboard..."* and redirect after 3 seconds.
* **Expired Token:** If the token has expired (>48 hours since generation), show a message: *"This invitation has expired. Please ask your administrator to send a new invite."*
* **Already a Member:** If the invited user is already a member of the workspace, auto-resolve the invite as accepted, and redirect them directly to the active workspace.
* **Simultaneous Pending Invites:** Prevent sending multiple pending invites to the same email address for the same workspace. If an invite is already pending, allow the Admin to click "Resend", which updates the expiry time and token value without creating a duplicate record.

---

## 6. Dependencies
* **Mailer Service Integration:** Requires AWS SES, SendGrid, or Nodemailer configuration to dispatch invitation links.
* **Auth System:** Relies on authentication endpoints (`/api/v1/auth/signup`, `/api/v1/auth/login`) being operational to verify user identity before accepting invitations.

---

## 7. API Requirements

### 7.1 Create Workspace
* **POST `/api/v1/workspaces`**
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
  ```json
  {
    "name": "Acme Agency"
  }
  ```
* **Response `201 Created`:**
  ```json
  {
    "workspace_id": "8c3b6d27-6f68-4ad0-b2f7-ec87b415a7ee",
    "name": "Acme Agency",
    "created_at": "2026-06-04T16:00:00Z"
  }
  ```

### 7.2 Send Invitation
* **POST `/api/v1/workspaces/:workspace_id/invitations`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Request Body:**
  ```json
  {
    "email": "editor@acme.com",
    "role": "EDITOR"
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "invitation_id": "f58d927a-cc2e-4b6a-8b83-a75d1f8876c1",
    "email": "editor@acme.com",
    "role": "EDITOR",
    "expires_at": "2026-06-06T16:00:00Z",
    "status": "PENDING"
  }
  ```

### 7.3 Accept Invitation
* **POST `/api/v1/invitations/accept`**
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
  ```json
  {
    "token": "a1b2c3d4e5f6g7h8i9j0..."
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "message": "Invitation accepted successfully",
    "workspace_id": "8c3b6d27-6f68-4ad0-b2f7-ec87b415a7ee",
    "role": "EDITOR"
  }
  ```

---

## 8. Database Impact
Direct writes to `WORKSPACE`, `USER_WORKSPACE_ROLE`, and creation of a new table `WORKSPACE_INVITATION`:

```sql
CREATE TABLE workspace_invitation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'EDITOR', 'APPROVER', 'VIEW_CLIENT')),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
    invited_by UUID NOT NULL REFERENCES "user"(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invitation_token ON workspace_invitation(token);
CREATE INDEX idx_invitation_workspace ON workspace_invitation(workspace_id);
```

---

## 9. UI Components
* **Workspace Creation Modal:** Input text field, loading button state, success toast.
* **Team Invite Drawer:** Standard text form containing email address field, roles dropdown list, and dynamic data-table displaying all pending/active team members and their roles.
* **Invitation Acceptance Splash Page:** Landing layout showing workspace logo, message: *"You've been invited to join Acme Agency as an Editor"*, and button for *"Accept & Open Workspace"*.

---

## 10. Security Requirements
1. **Access Authorization:** Only users with `ADMIN` role in `USER_WORKSPACE_ROLE` for the target `workspace_id` can hit the `/api/v1/workspaces/:workspace_id/invitations` POST endpoint.
2. **Cryptographic Token Verification:** Tokens must be high-entropy cryptographically secure random bytes (e.g. Hex string generated with Node's `crypto.randomBytes(32)`). Plaintext passwords or predictable UUIDs are prohibited.
3. **Double Verification:** Upon accepting the invitation, verify that the logged-in user's email matches the email address defined on the invitation record. If they differ, display a confirmation warning allowing the user to select whether to proceed.

---

## 11. Acceptance Criteria
* **AC-101-1:** Creating a workspace with valid parameters successfully updates `workspace` and `user_workspace_role` tables.
* **AC-101-2:** Attempting to invite a user with an invalid role or email formatting fails on client-side and server-side validation.
* **AC-101-3:** Invitation tokens expire exactly 48 hours after generation, and any acceptance call using an expired token yields a `400 Bad Request`.
* **AC-101-4:** Accepted tokens are marked `status = 'ACCEPTED'` and cannot be reused.

---

## 12. Definition of Done (DoD)
1. **Tests:** All unit tests for workspace validation and role authorization gates must achieve 90% code coverage.
2. **Security:** Invitation token logic reviewed for timing attacks and replay safety.
3. **CI/CD:** Automatic deploy scripts function correctly, and database migrations for the new `workspace_invitation` table compile cleanly in staging environments.
