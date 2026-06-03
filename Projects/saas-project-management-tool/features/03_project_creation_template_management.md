# Feature Specification: Project Creation & Template Management

## 1. Executive Summary & Value Proposition
Teams manage work using different methodologies. This feature allows Admins to create new projects and choose predefined workflow templates: **Kanban** (continuous flow) or **Scrum** (structured sprint cycles). It also provisions project identifiers (keys) to generate task numbers dynamically.

---

## 2. Target User Stories
* **Story 1:** As a team manager, I want to create a new project, name it, and generate a short project key (e.g., `DEV`), so all tasks are categorized.
* **Story 2:** As a Scrum Master, I want to create a project using the Scrum template so that I can immediately access Backlogs, Sprints, and Velocity reports.
* **Story 3:** As a Marketing Director, I want to create a project using the Kanban template to visualize task movements through custom workflow columns.

---

## 3. Detailed Functional Scope

### 3.1. Project Creation Dialog
* Form inputs: Project Name, Description, Template Selector, Project Key.
* Key is auto-generated (first 3-4 letters of name, capitalized, e.g. "Acme Web" -> "ACME"), editable, and validated for uniqueness in the workspace.

### 3.2. Scrum Templates Configuration
* Creates default Scrum phases: "To Do", "In Progress", "In Review", "Done".
* Enables Sprint Lifecycle features (Sprint creation, dates configuration).
* Enables "Backlog" view layout.

### 3.3. Kanban Templates Configuration
* Creates default Kanban workflow: "Backlog", "To Do", "In Progress", "Testing", "Released".
* Hides Sprint management options.
* Supports active drag-and-drop workflow updates directly.

### 3.4. Project Keys
* Validation: Keys must be 2 to 6 characters, uppercase letters only.
* Used as prefix for task identifiers (e.g., `ACME-42`).

### 3.5. Template Configuration
* Project administrators can edit project metadata and customize workflow columns later in settings.

---

## 4. API Interface Design

### 4.1. Create Project
* **Endpoint:** `POST /api/v1/projects`
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
  ```json
  {
    "name": "E-Commerce Rebuild",
    "key": "ECOMM",
    "template": "scrum",
    "description": "Redesigning the shopping cart experience."
  }
  ```
* **Response Body (201 Created):**
  ```json
  {
    "id": "c108ac20-3b21-4f1b-ba21-12cd248b11a9",
    "name": "E-Commerce Rebuild",
    "key": "ECOMM",
    "template": "scrum",
    "columns": ["To Do", "In Progress", "In Review", "Done"],
    "createdAt": "2026-06-03T22:11:52Z"
  }
  ```

---

## 5. UI/UX Specifications
* **Template Select Cards:** Visual layout comparing Scrum vs. Kanban with descriptions, helping the user make a choice.
* **Project Key Feedback:** Real-time key preview dynamically update as the user types the project name.
* **Modern Grids:** Cards list page showcasing active projects, featuring keys, descriptions, template types, and member avatars.

---

## 6. Acceptance Criteria & Verification

### Automated Verification
1. **Uniqueness Check:** Attempt to create two projects with the key `ACME` within the same workspace. Ensure the second request fails with `409 Conflict`.
2. **Setup Validation:** Verify that a newly created Scrum project returns columns and backlog arrays, whereas Kanban initializes without Sprint capabilities.

### Manual Verification
1. Open the project builder wizard. Input "Engineering Core". Verify key field defaults to "ENGI".
2. Change the template selector card. Verify that the explanation text matches Scrum or Kanban descriptions.
