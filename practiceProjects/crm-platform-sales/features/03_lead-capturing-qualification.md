# Feature Specification: Lead Capturing & Qualification
## Feature ID: FE-LCM-1 (Priority 03)

---

## 1. Purpose
To provide capabilities for capturing sales leads manually or via bulk CSV imports, tracking their progress, scoring them dynamically, and converting qualified leads into Contacts, Accounts, and Deals in a single transaction.

---

## 2. User Stories
* **US-LCM-001:** As a Sales Representative, I want to manually create a new Lead in the CRM so that I can track a new prospect I met.
* **US-LCM-002:** As a Sales Representative, I want to upload a CSV file of leads so that I can import a large prospecting list quickly.
* **US-LCM-003:** As a Sales Representative, I want to convert a qualified lead into a Contact, Account, and Deal with a single click so that I can begin managing their sales pipeline.

---

## 3. Functional Requirements
1. **FR-LEAD-001:** The system shall store Lead attributes: First Name, Last Name (required), Email (required), Company Name (required), Phone, Status, Lead Score, Owner ID, and Creation Timestamp.
2. **FR-LEAD-002:** The system must accept CSV file uploads for lead ingestion (Max size: 10MB).
3. **FR-LEAD-003:** The CSV parser must map columns dynamically using headers: "First Name", "Last Name", "Email", "Company", "Phone".
4. **FR-LEAD-004:** The system shall calculate an initial Lead Score based on data completeness (+5 per completed field).
5. **FR-LEAD-005:** The Lead Conversion process must execute in a database transaction block containing:
   - Create an `ACCOUNT` record if the Company does not match an existing Account name.
   - Create a `CONTACT` linked to the Account.
   - Create a `DEAL` in the "Discovery" stage linked to the Account and Contact.
   - Mark the source `LEAD` status as "Converted" and populate `converted_at` timestamp.

---

## 4. Validation Rules
1. Email fields must conform to RFC 5322 regex validation rules.
2. Import files must contain valid UTF-8 text formats.
3. Deal fields created during lead conversion must require a positive Deal Name and default closed-probability percentages.

---

## 5. Edge Cases
* **Edge Case 1 (Duplicate Email Import):** If the imported CSV contains an email address already registered to an active Lead or Contact, the system must skip the row, proceed with valid records, and output a downloadable de-duplication error log.
* **Edge Case 2 (Convert Lead to Existing Company):** If the company name matches an existing Account (e.g. "Google"), the system must prompt the user to link the new contact to the existing Account or create a duplicate company entry.
* **Edge Case 3 (Missing Headers in CSV):** If mandatory columns (Last Name, Email) are missing from the headers, the parser must halt execution and return a descriptive validation error: "Missing required column mapping".

---

## 6. Dependencies
* **FE-TAS-2 (RBAC):** To ensure leads are assigned to correct representatives and visibility scope checks are active.

---

## 7. API Requirements

### 7.1 Manual Lead Creation
* **URL:** `/api/v1/leads`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <Token>`
* **Payload:**
  ```json
  {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane.doe@acme.com",
    "company_name": "Acme Corp",
    "phone": "+15550299"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "lead_id": "b3c9d74a-251f-44de-9e2d-e7dcf5a415ff",
    "lead_score": 20
  }
  ```

### 7.2 Lead Conversion
* **URL:** `/api/v1/leads/:lead_id/convert`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <Token>`
* **Payload:**
  ```json
  {
    "deal_name": "Acme Corp - Enterprise Suite",
    "pipeline_stage_id": "e67d268a-6b45-4b07-a3f2-c7f8a7be8e70",
    "existing_account_id": null
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "account_id": "778d2b6b-43d9-482a-a299-88bf8aee20ee",
    "contact_id": "888d2b6b-43d9-482a-a299-88bf8aee20ff",
    "deal_id": "999d2b6b-43d9-482a-a299-88bf8aee20gg"
  }
  ```

---

## 8. Database Impact
* **Table:** `LEADS`
  - Columns: `id` (UUID PK), `first_name` (VARCHAR), `last_name` (VARCHAR), `email` (VARCHAR), `company_name` (VARCHAR), `phone` (VARCHAR), `status` (VARCHAR), `lead_score` (INT), `owner_id` (UUID FK to `USERS`), `converted_at` (TIMESTAMP), `created_at` (TIMESTAMP).
* **Triggers:** Database check index on `email` inside `LEADS` to guarantee uniqueness per tenant space.

---

## 9. UI Components
* **Lead List Dashboard:** Tabular index displaying lead name, score, email, company, and conversion buttons.
* **Import Modal:** Upload box drag-and-drop targeting CSV files, detailing progress bars, mapping configurations, and failure audit links.
* **Convert Modal:** Interactive wizard proposing existing Account associations or prompt forms for deal creation parameters.

---

## 10. Security Requirements
* Sanitize CSV contents against formula-injection scripts (e.g. block lines starting with `=`, `+`, `-`, or `@`).
* Limit payload post uploads to 10MB to mitigate denial of service attacks (DoS).

---

## 11. Acceptance Criteria (AC)
* **AC-LCM-001:** Given a user uploads a valid CSV lead template file, when parsed, then the system must create matching Lead database records and report progress.
* **AC-LCM-002:** Given a lead with status "Converted", when an API request attempts to edit its company name, then the request must fail with a `400 Bad Request` block.
* **AC-LCM-003:** Given a database conversion fail event during deal entry, when the database transaction rolls back, then no orphaned Accounts or Contacts are left behind.

---

## 12. Definition of Done (DoD)
1. CSV parsing package code passes memory leakage testing under 1,000 parallel imports.
2. Complete test suite for the lead conversion transaction handler (validating rollback states).
3. Visual validation warnings checked for responsiveness on smaller tablet viewports.
4. OpenAPI endpoints mapped out in API documentation files.
