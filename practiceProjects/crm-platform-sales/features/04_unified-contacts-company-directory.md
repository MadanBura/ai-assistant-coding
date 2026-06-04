# Feature Specification: Unified Contacts & Company Directory
## Feature ID: FE-LCM-2 (Priority 04)

---

## 1. Purpose
To manage a clean corporate directory of Companies (Accounts) and their individual employees (Contacts), enabling sales representatives to navigate parent-subsidiary company relationships and map out corporate hierarchies.

---

## 2. User Stories
* **US-LCM-004:** As a Sales Representative, I want to create a Company profile page and associate multiple Contacts with it so that I can see who works there and track their individual details.
* **US-LCM-005:** As a Sales Representative, I want to define parent-subsidiary links between companies so that I can see the organizational relationships of enterprise clients.
* **US-LCM-006:** As a Sales Manager, I want to view a centralized contact index to monitor which contacts are being actively targeted by my team.

---

## 3. Functional Requirements
1. **FR-DIR-001:** The system shall maintain an `ACCOUNTS` directory containing attributes: Company Name (required), Website, Industry, Owner ID, Parent Account ID (nullable), and Creation Timestamp.
2. **FR-DIR-002:** The system shall maintain a `CONTACTS` directory containing attributes: First Name, Last Name (required), Email (required), Phone, Job Title, Account ID (required), Owner ID, and Creation Timestamp.
3. **FR-DIR-003:** The system must support nested Account structures, permitting multiple child accounts (subsidiaries) under one parent account.
4. **FR-DIR-004:** Deleting a parent account must not delete associated child accounts or contacts; the system must nullify their Parent Account IDs or reassign them based on user input.

---

## 4. Validation Rules
1. Every Contact Email must be unique per tenant space.
2. Account Website URLs must be validated for format correctness (e.g. `https://domain.com`).
3. System must run validation to prevent circular reference trees (e.g. Account A cannot set Account B as parent if Account B is already a child of Account A).

---

## 5. Edge Cases
* **Edge Case 1 (Recursive Circular Hierarchy):** When setting or modifying `parent_account_id` on an Account, the API must perform a recursive depth search (up to 10 levels) to verify that the target parent ID does not appear in the current Account's children list. If circularity is detected, return `422 Unprocessable Entity` with details.
* **Edge Case 2 (Orphaned Contacts on Account Delete):** If an Account is deleted, the system must trigger a dialog asking the user to either:
  - *Option A:* Delete all associated Contacts.
  - *Option B:* Keep Contacts in the database but mark their `account_id` as Null.
  - *Option C:* Reassign Contacts to a different designated Account.

---

## 6. Dependencies
* **FE-TAS-2 (RBAC):** Restricts Contact and Account modifications to owners or managers.

---

## 7. API Requirements

### 7.1 Create Account
* **URL:** `/api/v1/accounts`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <Token>`
* **Payload:**
  ```json
  {
    "name": "Acme Subsidiaries Ltd",
    "industry": "Manufacturing",
    "website": "https://acmesub.com",
    "parent_account_id": "778d2b6b-43d9-482a-a299-88bf8aee20ee"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "account": {
      "id": "c1f72922-a9b0-466d-888e-17ef367ba4f3",
      "name": "Acme Subsidiaries Ltd",
      "parent_account_id": "778d2b6b-43d9-482a-a299-88bf8aee20ee"
    }
  }
  ```

### 7.2 Create Contact
* **URL:** `/api/v1/contacts`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <Token>`
* **Payload:**
  ```json
  {
    "first_name": "Marcus",
    "last_name": "Aurelius",
    "email": "marcus@acmesub.com",
    "phone": "+15550300",
    "job_title": "Procurement Director",
    "account_id": "c1f72922-a9b0-466d-888e-17ef367ba4f3"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "contact_id": "e67d268a-6b45-4b07-a3f2-c7f8a7be8e70"
  }
  ```

---

## 8. Database Impact
* **Table:** `ACCOUNTS`
  - Columns: `id` (UUID PK), `name` (VARCHAR), `industry` (VARCHAR), `website` (VARCHAR), `parent_account_id` (UUID FK to `ACCOUNTS`, Nullable), `owner_id` (UUID FK to `USERS`), `created_at` (TIMESTAMP).
* **Table:** `CONTACTS`
  - Columns: `id` (UUID PK), `first_name` (VARCHAR), `last_name` (VARCHAR), `email` (VARCHAR), `phone` (VARCHAR), `job_title` (VARCHAR), `account_id` (UUID FK to `ACCOUNTS`, Nullable), `owner_id` (UUID FK to `USERS`), `created_at` (TIMESTAMP).
* **Indexes:** Non-clustered index on `contacts.email` and `accounts.parent_account_id`.

---

## 9. UI Components
* **Account Detail View:** Double-column panel displaying company metadata and an accordion folder list showing child subsidiaries.
* **Contacts Index Grid:** Filtering panel listing contact names, job roles, company associations, emails, and direct phone link buttons.
* **Hierarchy Tree component:** Dynamic interactive nested node tree demonstrating the relationship diagram of parent-subsidiary corporations.

---

## 10. Security Requirements
* Enforce tenant separation key query scopes: `WHERE tenant_id = current_user.tenant_id`.
* Sanitization of website parameters to block XSS vector inputs (e.g. block input containing `javascript:` strings).

---

## 11. Acceptance Criteria (AC)
* **AC-LCM-004:** Given an Admin modifies Account A's parent to Account B, when Account B is already a child of Account A, the transaction must fail and return code `422`.
* **AC-LCM-005:** Given a user deletes an Account, when there are active Contacts, then the system must prompt choices for contact cascades and prevent accidental orphaned databases.
* **AC-LCM-006:** Given a user creates a contact, when they input a duplicate email, then the system must prompt showing the duplicate contact details and halt saving.

---

## 12. Definition of Done (DoD)
1. Recursive check validation module passes complete unit testing runs.
2. PostgreSQL database indexes optimized, verifying query duration stays under 100ms for parent-child listings.
3. Frontend directories verified to load paginated lists correctly (50 records per fetch).
