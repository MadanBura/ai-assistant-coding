# Feature Specification: Passwordless Magic-Link Access

---

## 1. Metadata
* **Feature Name:** Passwordless Magic-Link Access
* **Feature ID:** `FEAT-PORT-01`
* **Priority:** 07 (User Experience & Portal Path)
* **Status:** Implementation Ready

---

## 2. Purpose
Provide passwordless, highly secure access to the hosted Customer Portal. By generating temporary, cryptographically secure magic links sent via email, users log in to manage cards and downloads instantly without creating username/password sets.

---

## 3. User Stories
* **US-PORT-01-01:** As a Subscriber, I want to click a button on the SaaS merchant app that sends a login link to my email, so that I can access my invoices without remembering another password.
* **US-PORT-01-02:** As a Subscriber, I want the login link to work only once and expire quickly, so that my account access remains secure if my email is compromised later.

---

## 4. Functional Requirements
* **FR-PORT-01-01:** Offer a login endpoint that takes a customer email address and validates whether a Customer profile exists.
* **FR-PORT-01-02:** If customer is found, generate a high-entropy random token (e.g., 32 cryptographically secure bytes encoded as hex/base64).
* **FR-PORT-01-03:** Store the hash of the token in a short-lived cache (e.g., Redis or database) mapped to the customer identifier, with an expiry timer of 15 minutes.
* **FR-PORT-01-04:** Send an HTML email via SMTP/SendGrid containing a link format:
  `https://billing.aurabilling.com/portal/auth?token=TOKEN_VALUE`
* **FR-PORT-01-05:** Upon token submission at the auth endpoint, verify the token hash. If valid:
  * Revoke the token immediately (delete token record).
  * Issue a secure, HTTP-only JWT cookie to authorize subsequent portal actions.
  * Redirect client to the Customer Portal dashboard.

---

## 5. Validation Rules
* **VAL-PORT-01-01:** Emails submitted for login requests must match a standard regex email pattern.
* **VAL-PORT-01-02:** Magic link token parameters must have the exact length and character set expected (e.g., 64 hex characters).

---

## 6. Edge Cases
* **Edge Case 1: Multiple requests in short successions.** If a user clicks "send link" 3 times in 2 minutes:
  * Invalidate any previous token generated. Only the most recently dispatched link must work.
* **Edge Case 2: Email delivery delays.** If the email gateway takes 20 minutes to deliver, the token will have expired when the user opens it.
  * *Resolution:* Display a friendly screen explaining the expiration and provide an immediate, one-click [Resend Login Link] button.
* **Edge Case 3: Token accessed by bots.** Many corporate email servers scan incoming links automatically for malware, which can accidentally consume the single-use token before the user clicks it.
  * *Resolution:* The `/portal/auth` endpoint must return a landing page with a `[Confirm Login]` button. The token must only be consumed and validated when the user clicks this physical button (sending a `POST` request to `/portal/session/confirm`), never on the initial HTTP `GET` request.

---

## 7. Dependencies
* **Upstream:** None.
* **Downstream:** `FEAT-PORT-02` (Card & Plan Management) - relies on the portal session to authorize actions.

---

## 8. API Requirements

### 8.1 Request Magic Link
* **Endpoint:** `POST /v1/portal/session/request`
* **Request Body:**
```json
{
  "email": "customer@company.com",
  "merchant_id": "merch_19f38f9024"
}
```
* **Response (202 Accepted):**
```json
{
  "status": "sent",
  "message": "If this email is registered, a magic link has been sent."
}
```

### 8.2 Confirm Magic Link Token
* **Endpoint:** `POST /v1/portal/session/confirm`
* **Request Body:**
```json
{
  "token": "d7a4f9104bce38290192e..."
}
```
* **Response (200 OK):**
* **Headers:** `Set-Cookie: portal_session=JWT_TOKEN; HttpOnly; Secure; SameSite=Strict; Max-Age=7200`
```json
{
  "status": "authenticated",
  "customer_id": "cust_8f9024j94j",
  "redirect_url": "/portal/dashboard"
}
```

---

## 9. Database Impact
* **Table:** `PORTAL_SESSION_TOKEN` (Or equivalent Redis keys)
  * Fields: `token_hash` (String, PK), `customer_id` (UUID, FK), `expires_at` (Timestamp), `created_at` (Timestamp).

---

## 10. UI Components
* **Login Form Screen:**
  * Clean, single-input card: "Enter your billing email to manage your account." Button: `[Send Magic Link]`. Shows confirmation status on submit.
* **Confirm Auth Landing Screen:**
  * Clean, minimalist layout with loading indicator or a simple `[Verify Access]` confirmation button to prevent email-bot clicks from consuming links.

---

## 11. Security Requirements
* **SEC-PORT-01-01 (Token Hashing):** Do not store raw tokens in databases. Store the SHA-256 hash of the token to prevent database leak escalations.
* **SEC-PORT-01-02 (IP Rate Limiting):** Limit requests to 3 magic link requests per IP address per hour to prevent spamming email integrations.
* **SEC-PORT-01-03 (Session Lifespan):** JWT cookies for the portal must expire after 2 hours of inactivity.

---

## 12. Acceptance Criteria
* **AC-PORT-01-01:** Verify magic link confirms identity and issues JWT cookie.
* **AC-PORT-01-02:** Verify token is immediately revoked upon first click confirmation.
* **AC-PORT-01-03:** Verify token expires and rejects auth after 15 minutes.

---

## 13. Definition of Done
* Cypress tests verify complete login lifecycle.
* Rate limiters verified under attack simulation tools.
* Pen-testing reviews session hijacking vulnerabilities.
