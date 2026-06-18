# Prompt Log

## Learning Management System (LMS) — A comprehensive platform for managing courses, users, enrollments, and learning resources.

---

## PROMPT 1 — Initialize Prompt Logger

**Output File:** `Doc/Prompt_Log.md`

---

### Prompt Content (Verbatim)

````text
I am starting the Learning Management System (LMS) project. 

Please initialize the prompt logger for this project by reading and following the global instructions located at `C:\Users\md.adil\.gemini\config\skills\prompt-logger.md`
 
Establish the Role:

- Act as the AI Prompt Auditor & SDLC Log Custodian.

- Create the `Doc/Prompt_Log.md` file in the workspace root.

- Initialize it for the project: "{{Project Name}}" — "[Insert Project Description]".

- Keep this skill active and log all subsequent instructions/prompts automatically.
 
 
write this prompt for window
````

---

## PROMPT 2 — Create Product Requirement Document (PRD)

**Output File:** `docs/prd.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior product manager with 10+ years of experience
building production-grade fullstack web and mobile applications.

Format: Output a single markdown file at docs/prd.md.
Use H2 headings for each section.
No extra sections beyond the 8 listed below.

Context: I am starting a new project. I will describe the idea below.
Generate a complete PRD covering ONLY these 8 sections:
1. Problem Statement
2. Solution Overview
3. User Flow
4. API Design
5. Edge Cases
6. KPIs (Success Metrics / Acceptance Criteria)
7. Limitations
8. Tech Stack — add exactly what I give you,
   do not invent or add anything extra

Task: Based on the project idea and tech stack below,
generate docs/prd.md with exactly the 8 sections above.
Do not add any extra sections.

Project Idea: Organizations, educational institutes, training centers, and self-learning professionals require a centralized platform to manage and deliver structured learning content. Currently, learning materials such as videos, notes, presentations, and assessments are often distributed across multiple platforms, making it difficult for learners to follow a structured learning path and for instructors to monitor learner progress.
There is a need for a web-based Learning Management System that enables administrators and instructors to create and manage courses consisting of multiple modules and topics. Each topic should contain learning resources such as videos, notes, documents, and reference materials. Learners should be able to enroll in courses, access content in a predefined sequence, complete topic-wise assessments, and track their learning progress.
The system shall conduct assessments at both topic and course levels to evaluate learner understanding. Upon successful completion of all course requirements and passing the final examination, the system shall automatically generate a certificate of completion. The platform shall provide progress tracking, performance analytics, and certification management to ensure an effective learning experience and measurable outcomes.
Tech Stack: 
Frontend: React 19 + Bootstrap 5.3
Backend: Node.js 22 LTS + Express.js 5
Database: MongoDB Atlas (Cloud)
Testing: Jest + Supertest + React Testing Library
Frontend Hosting: Vercel
Backend Hosting: Render
Database Hosting: MongoDB Atlas
````

---

## PROMPT 3 — Generate Key Performance Indicators (KPIs) & Acceptance Criteria

**Output File:** `docs/kpi.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior QA architect and product analyst.

Context: Reference @[docs/prd.md]  as the single source of truth.
Read every module and every feature in the PRD carefully
before writing anything.

Format: Create docs/kpi.md with this exact structure:

---
## Module 1: [Module Name]

### Feature 1.1: [Feature Name]
- AC1: [testable, measurable condition]
- AC2: [testable, measurable condition]
- AC3: [testable, measurable condition]

### Feature 1.2: [Feature Name]
- AC1: ...

## Module 2: [Module Name]

### Feature 2.1: [Feature Name]
- AC1: ...
---

Rules:
- First output a summary list of ALL modules and features
  you found in the PRD before writing the full file
- Every module from the PRD must appear
- Every feature under each module must appear
- Every acceptance criterion must be testable
  (pass/fail — not vague like "should work well")
- No feature may be skipped
- Do not add features not present in the PRD
- Minimum 5 acceptance criteria per feature

Task: Generate the complete docs/kpi.md now.
Start by listing all modules and features as a summary,
then write the full file.
````

---

## PROMPT 4 — Update KPIs to Tabular Format

**Output File:** `docs/kpi.md`

---

### Prompt Content (Verbatim)

````text
Update kpi in tabular format
````

---

## PROMPT 5 — Create Project Scope Document

**Output File:** `docs/project-scope.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior technical project manager defining clear
boundaries for a development team before sprint planning.

Format: Output a single markdown file at docs/project-scope.md
with exactly these 5 sections:
1. In Scope
2. Out of Scope
3. Assumptions
4. Dependencies
5. Constraints

Context: @[docs/prd.md]  defines product requirements.
@[docs/kpi.md]  defines acceptance criteria.
Use both to determine what is and is not being built.

Task: Generate docs/project-scope.md.
Be specific and technical.
Every in-scope item must map to a feature in the KPI or PRD.
Out-of-scope items must be explicitly stated to prevent scope creep.
No vague statements.
````

---

## PROMPT 6 — Create Project Boundary Rules Document

**Output File:** `docs/project-boundary.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior engineering lead setting non-negotiable
working rules for an AI coding assistant on this project.

Format: Output a single markdown file at docs/project-boundary.md.
It must contain exactly these 4 rules — no more, no less,
no sub-points, no explanations:
1. Do not commit code yourself.
2. Do not run any commands without asking me first.
3. Do not write code unless you have the full picture.
   If you have any questions, ask me first.
   Let's not waste tokens building something we do not want.
4. Only create maintainable, modular code.

Context: This file governs how the AI assistant behaves
throughout the entire project lifecycle.

Task: Generate docs/project-boundary.md with exactly
the 4 rules above. Nothing else.
````

---

## PROMPT 7 — Create Token Saving Guide

**Output File:** `docs/save-token.md`

---

### Prompt Content (Verbatim)

````text
Role: You are an expert AI prompt engineer specializing in
minimizing token usage while maximizing output quality from LLMs.

Format: Output a single markdown file at docs/save-token.md
with these sections:
- Principles
- Prompt Patterns
- What to Avoid
- File Reference Strategy
- Quick Checklist

Context: This project uses an AI coding assistant.
Every prompt costs tokens. This file will be attached to every
future prompt in this project to guide the AI on communicating
efficiently without waste.

Task: Generate docs/save-token.md as a reusable token-saving guide:
- Instructs AI to ask clarifying questions before writing code
- Avoids re-reading files already in context
- Avoids restating the task back to the user
- Focuses only on the delta (what changed, not the whole file)
- Uses file references (@filename) instead of pasting full content
- Avoids unnecessary comments, logs, boilerplate unless asked
- Generic enough for any web or mobile project type
````

---

## PROMPT 8 — Create Frontend Persona Document

**Output File:** `personas/frontend-persona.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior frontend architect creating a persona
prompt file for an AI coding assistant to use throughout
the entire project.

Format: Output a single markdown file at
personas/frontend-persona.md with these sections:
- Role Definition
- Tech Stack
- Full Folder Structure (src/, components/, pages/, hooks/,
  services/, assets/, config/, .env, .gitignore,
  and all framework-specific folders)
- Coding Standards
- Component Guidelines
- State Management Rules
- API Integration Rules
- Styling Rules
- Accessibility Rules
- Performance Rules
- What NOT to Do

Context: @[docs/prd.md]  defines the project and tech stack.
@[docs/project-scope.md]  defines the boundaries.
Persona must reflect the exact tech stack from the PRD.

Task: Generate personas/frontend-persona.md as a complete
production-ready persona. Include the full frontend folder
structure. Make it specific to the tech stack in the PRD —
no generic filler.
````

---

## PROMPT 9 — Create Backend Persona Document

**Output File:** `personas/backend-persona.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior backend architect creating a persona
prompt file for an AI coding assistant to use throughout
the entire project.

Format: Output a single markdown file at
personas/backend-persona.md with these sections:
- Role Definition
- Tech Stack
- Full Folder Structure (routes/, controllers/, services/,
  models/, middlewares/, config/, utils/, .env,
  .gitignore, docker files if applicable)
- API Design Standards
- Database Guidelines
- Authentication & Authorization Rules
- Error Handling Standards
- Logging Standards
- Security Rules
- Performance Rules
- What NOT to Do

Context: @[docs/prd.md]  defines the project and tech stack.
@[docs/project-scope.md]  defines the boundaries.
Persona must reflect the exact tech stack from the PRD.

Task: Generate personas/backend-persona.md as a complete
production-ready persona. Include the full backend folder
structure. Make it specific to the tech stack in the PRD —
no generic filler.
````

---

## PROMPT 10 — Create QA Persona Document

**Output File:** `personas/qa-persona.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior QA engineer and test architect creating
a persona prompt file for an AI QA assistant covering the
entire project lifecycle.

Format: Output a single markdown file at personas/qa-persona.md
with these sections:
- Role Definition
- Testing Tech Stack (testing frameworks only, from PRD)
- Folder Structure:
    test-cases/frontend/  ← feature-wise test files
    test-cases/backend/   ← feature-wise test files
- Test File Naming Convention:
    NEVER .md — always:
    .test.jsx  → React JS
    .test.tsx  → React TS
    .test.js   → plain JS backend
    .test.ts   → TypeScript backend
    .spec.ts   → alternative TS backend
- Test Coverage Standards
- Frontend Testing Rules (unit, integration, E2E)
- Backend Testing Rules (unit, integration, API)
- Mocking & Fixture Strategy
- CI Integration Notes
- What NOT to Do

Context: @[docs/prd.md]  defines the project.
@[docs/kpi.md]  defines acceptance criteria.
Testing frameworks are from the PRD tech stack.

Task: Generate personas/qa-persona.md. All test output files
must use proper test extensions — never .md.
Make it specific to the testing stack in the PRD.
````

---

## PROMPT 11 — Create User Onboarding and Authentication Feature Breakdowns

**Output Files:** `modules/01-user-onboarding-and-authentication/01-user-registration.md`, `modules/01-user-onboarding-and-authentication/02-user-login.md`, `modules/01-user-onboarding-and-authentication/03-user-profile-management.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior full-stack tech lead breaking down a
product module into implementation-ready feature files.

Format: Output one markdown file per feature at:
modules/[NN-module-name]/[NN-feature-name].md
Example:
  modules/01-authentication/01-user-login.md
  modules/01-authentication/02-user-register.md
  modules/01-authentication/03-forgot-password.md

Each feature file must include exactly these 10 sections:
1. Feature Overview
2. Acceptance Criteria (from @[docs/kpi.md] )
3. UI/UX Requirements
4. API Endpoints Required
5. Data Models / Schema
6. State Management Notes
7. Edge Cases
8. Dependencies on Other Features
9. Testing Requirements
   (exact test file name with correct extension —
    never .md)
10. Out of Scope for This Feature

Context:
@[docs/prd.md]  — product spec
@[docs/kpi.md]  — acceptance criteria source
@[docs/project-scope.md]  — project boundaries
@[personas/frontend-persona.md]  — frontend tech constraints
@[personas/backend-persona.md]  — backend tech constraints
@[docs/save-token.md]  — follow all token-saving rules

Current Batch — Module: [User Onboarding and Authentication]
Folder: modules/[NN-module-name]/

Features in this batch:
- 1.1: User Registration
- 1.2: User Login
- 1.3: User Profile Management

Already completed modules/features (do not repeat or contradict):
None

Task: Generate only the feature files listed in this batch.
Cross-reference dependencies with already completed features.
If anything is unclear about scope, ask before writing.
````

---

## PROMPT 12 — Create Course & Curriculum Management Feature Breakdowns

**Output Files:** `modules/02-course-and-curriculum-management/01-course-creation-and-management.md`, `modules/02-course-and-curriculum-management/02-curriculum-design.md`, `modules/02-course-and-curriculum-management/03-content-and-resource-management.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior full-stack tech lead breaking down a
product module into implementation-ready feature files.

Format: Output one markdown file per feature at:
modules/[NN-module-name]/[NN-feature-name].md
Example:
  modules/01-authentication/01-user-login.md
  modules/01-authentication/02-user-register.md
  modules/01-authentication/03-forgot-password.md

Each feature file must include exactly these 10 sections:
1. Feature Overview
2. Acceptance Criteria (from @[d:\vibeCoding2026\09JunePractice\LMS\docs\kpi.md] )
3. UI/UX Requirements
4. API Endpoints Required
5. Data Models / Schema
6. State Management Notes
7. Edge Cases
8. Dependencies on Other Features
9. Testing Requirements
   (exact test file name with correct extension —
    never .md)
10. Out of Scope for This Feature

Context:
@[d:\vibeCoding2026\09JunePractice\LMS\docs\prd.md]  — product spec
@[d:\vibeCoding2026\09JunePractice\LMS\docs\kpi.md]  — acceptance criteria source
@[d:\vibeCoding2026\09JunePractice\LMS\docs\project-scope.md]  — project boundaries
@[d:\vibeCoding2026\09JunePractice\LMS\personas\frontend-persona.md]  — frontend tech constraints
@[d:\vibeCoding2026\09JunePractice\LMS\personas\backend-persona.md]  — backend tech constraints
@[d:\vibeCoding2026\09JunePractice\LMS\docs\save-token.md]  — follow all token-saving rules

Current Batch — Module: [Course & Curriculum Management]
Folder: modules/[NN-module-name]/

Features in this batch:
- 2.1: Course Creation and Management
- 2.2: Curriculum Design (Modules & Topics)
- 2.3: Content & Resource Management (Videos, Notes, PDFs)

Already completed modules/features (do not repeat or contradict):
[List previous module folders — or write "None" for first batch]

Task: Generate only the feature files listed in this batch.
Cross-reference dependencies with already completed features.
If anything is unclear about scope, ask before writing.
````

---

## PROMPT 13 — Create Enrollment & Progress Tracking Feature Breakdowns

**Output Files:** `modules/03-enrollment-and-progress-tracking/01-course-discovery-and-enrollment.md`, `modules/03-enrollment-and-progress-tracking/02-learner-progress-tracking.md`, `modules/03-enrollment-and-progress-tracking/03-sequential-access-and-locking-system.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior full-stack tech lead breaking down a
product module into implementation-ready feature files.

Format: Output one markdown file per feature at:
modules/[NN-module-name]/[NN-feature-name].md
Example:
  modules/01-authentication/01-user-login.md
  modules/01-authentication/02-user-register.md
  modules/01-authentication/03-forgot-password.md

Each feature file must include exactly these 10 sections:
1. Feature Overview
2. Acceptance Criteria (from @[d:\vibeCoding2026\09JunePractice\LMS\docs\kpi.md] )
3. UI/UX Requirements
4. API Endpoints Required
5. Data Models / Schema
6. State Management Notes
7. Edge Cases
8. Dependencies on Other Features
9. Testing Requirements
   (exact test file name with correct extension —
    never .md)
10. Out of Scope for This Feature

Context:
@[d:\vibeCoding2026\09JunePractice\LMS\docs\prd.md]  — product spec
@[d:\vibeCoding2026\09JunePractice\LMS\docs\kpi.md]  — acceptance criteria source
@[d:\vibeCoding2026\09JunePractice\LMS\docs\project-scope.md]  — project boundaries
@[d:\vibeCoding2026\09JunePractice\LMS\personas\frontend-persona.md]  — frontend tech constraints
@[d:\vibeCoding2026\09JunePractice\LMS\personas\backend-persona.md]  — backend tech constraints
@[d:\vibeCoding2026\09JunePractice\LMS\docs\save-token.md]  — follow all token-saving rules

Current Batch — Module: [Enrollment & Progress Tracking]
Folder: modules/[NN-module-name]/

Features in this batch:
- 3.1: Course Discovery and Enrollment
- 3.2: Learner Progress Tracking
- 3.3: Sequential Access & Locking System

Already completed modules/features (do not repeat or contradict):
[List previous module folders — or write "None" for first batch]

Task: Generate only the feature files listed in this batch.
Cross-reference dependencies with already completed features.
If anything is unclear about scope, ask before writing.
````

---

## PROMPT 14 — Create Evaluation Engine Feature Breakdowns

**Output Files:** `modules/04-evaluation-engine/01-topic-level-quiz-assessments.md`, `modules/04-evaluation-engine/02-course-level-final-examination.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior full-stack tech lead breaking down a
product module into implementation-ready feature files.

Format: Output one markdown file per feature at:
modules/[NN-module-name]/[NN-feature-name].md
Example:
  modules/01-authentication/01-user-login.md
  modules/01-authentication/02-user-register.md
  modules/01-authentication/03-forgot-password.md

Each feature file must include exactly these 10 sections:
1. Feature Overview
2. Acceptance Criteria (from @[d:\vibeCoding2026\09JunePractice\LMS\docs\kpi.md] )
3. UI/UX Requirements
4. API Endpoints Required
5. Data Models / Schema
6. State Management Notes
7. Edge Cases
8. Dependencies on Other Features
9. Testing Requirements
   (exact test file name with correct extension —
    never .md)
10. Out of Scope for This Feature

Context:
@[d:\vibeCoding2026\09JunePractice\LMS\docs\prd.md]  — product spec
@[d:\vibeCoding2026\09JunePractice\LMS\docs\kpi.md]  — acceptance criteria source
@[d:\vibeCoding2026\09JunePractice\LMS\docs\project-scope.md]  — project boundaries
@[d:\vibeCoding2026\09JunePractice\LMS\personas\frontend-persona.md]  — frontend tech constraints
@[d:\vibeCoding2026\09JunePractice\LMS\personas\backend-persona.md]  — backend tech constraints
@[d:\vibeCoding2026\09JunePractice\LMS\docs\save-token.md]  — follow all token-saving rules

Current Batch — Module: [Evaluation Engine]
Folder: modules/[NN-module-name]/

Features in this batch:
- 4.1: Topic-Level Quiz Assessments
- 4.2: Course-Level Final Examination

Already completed modules/features (do not repeat or contradict):
[List previous module folders — or write "None" for first batch]

Task: Generate only the feature files listed in this batch.
Cross-reference dependencies with already completed features.
If anything is unclear about scope, ask before writing.
````

---

## PROMPT 15 — Create Certification Management Feature Breakdowns

**Output Files:** `modules/05-certification-management/01-automatic-certificate-generation-and-download.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior full-stack tech lead breaking down a
product module into implementation-ready feature files.

Format: Output one markdown file per feature at:
modules/[NN-module-name]/[NN-feature-name].md
Example:
  modules/01-authentication/01-user-login.md
  modules/01-authentication/02-user-register.md
  modules/01-authentication/03-forgot-password.md

Each feature file must include exactly these 10 sections:
1. Feature Overview
2. Acceptance Criteria (from @[d:\vibeCoding2026\09JunePractice\LMS\docs\kpi.md] )
3. UI/UX Requirements
4. API Endpoints Required
5. Data Models / Schema
6. State Management Notes
7. Edge Cases
8. Dependencies on Other Features
9. Testing Requirements
   (exact test file name with correct extension —
    never .md)
10. Out of Scope for This Feature

Context:
@[d:\vibeCoding2026\09JunePractice\LMS\docs\prd.md]  — product spec
@[d:\vibeCoding2026\09JunePractice\LMS\docs\kpi.md]  — acceptance criteria source
@[d:\vibeCoding2026\09JunePractice\LMS\docs\project-scope.md]  — project boundaries
@[d:\vibeCoding2026\09JunePractice\LMS\personas\frontend-persona.md]  — frontend tech constraints
@[d:\vibeCoding2026\09JunePractice\LMS\personas\backend-persona.md]  — backend tech constraints
@[d:\vibeCoding2026\09JunePractice\LMS\docs\save-token.md]  — follow all token-saving rules

Current Batch — Module: [Certification Management]
Folder: modules/[NN-module-name]/

Features in this batch:
- 5.1: Automatic Certificate Generation and Download

Already completed modules/features (do not repeat or contradict):
[List previous module folders — or write "None" for first batch]

Task: Generate only the feature files listed in this batch.
Cross-reference dependencies with already completed features.
If anything is unclear about scope, ask before writing.
````

---

## PROMPT 16 — Create Progress & Analytics Dashboard Feature Breakdowns

**Output Files:** `modules/06-progress-and-analytics-dashboard/01-instructor-progress-and-performance-analytics.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior full-stack tech lead breaking down a
product module into implementation-ready feature files.

Format: Output one markdown file per feature at:
modules/[NN-module-name]/[NN-feature-name].md
Example:
  modules/01-authentication/01-user-login.md
  modules/01-authentication/02-user-register.md
  modules/01-authentication/03-forgot-password.md

Each feature file must include exactly these 10 sections:
1. Feature Overview
2. Acceptance Criteria (from @[d:\vibeCoding2026\09JunePractice\LMS\docs\kpi.md] )
3. UI/UX Requirements
4. API Endpoints Required
5. Data Models / Schema
6. State Management Notes
7. Edge Cases
8. Dependencies on Other Features
9. Testing Requirements
   (exact test file name with correct extension —
    never .md)
10. Out of Scope for This Feature

Context:
@[d:\vibeCoding2026\09JunePractice\LMS\docs\prd.md]  — product spec
@[d:\vibeCoding2026\09JunePractice\LMS\docs\kpi.md]  — acceptance criteria source
@[d:\vibeCoding2026\09JunePractice\LMS\docs\project-scope.md]  — project boundaries
@[d:\vibeCoding2026\09JunePractice\LMS\personas\frontend-persona.md]  — frontend tech constraints
@[d:\vibeCoding2026\09JunePractice\LMS\personas\backend-persona.md]  — backend tech constraints
@[d:\vibeCoding2026\09JunePractice\LMS\docs\save-token.md]  — follow all token-saving rules

Current Batch — Module: [Progress & Analytics Dashboard]
Folder: modules/[NN-module-name]/

Features in this batch:
- 6.1: Instructor Progress & Performance Analytics


Already completed modules/features (do not repeat or contradict):
[List previous module folders — or write "None" for first batch]

Task: Generate only the feature files listed in this batch.
Cross-reference dependencies with already completed features.
If anything is unclear about scope, ask before writing.
````

---

## PROMPT 17 — Create API Schema and Design Document

**Output File:** `docs/api-schema-and-design.md`

---

### Prompt Content (Verbatim)

````text
Role: You are a senior backend architect and API design specialist
creating a comprehensive API schema and design document that will
serve as the single source of truth for all backend and frontend
development in this project.

Format: Output a single markdown file at
docs/api-schema-and-design.md with these sections:

1. Overview (base URL, versioning, auth mechanism, response format)
2. Authentication & Authorization
   - Auth flow description
   - Token structure
   - Protected vs public routes
3. Database Schema
   - All tables/collections with every field,
     data type, constraints, and relationships
4. API Endpoints (for every module):
   ### Module Name
   #### Endpoint: METHOD /path
   - Description
   - Auth required: Yes/No
   - Request Headers
   - Request Body (with field names, types, required/optional)
   - Success Response (status code + body structure)
   - Error Responses (all possible status codes + messages)
   - Business Rules / Validation Rules
5. Shared/Common Schemas (reusable response objects)
6. Error Code Reference Table
7. Rate Limiting & Security Notes

Context:
@[docs/kpi.md]  — all modules and features
@[docs/prd.md]  — product spec and API design section
@[personas/backend-persona.md]  — backend tech constraints
@[modules]  — all generated module/feature files

Task: Generate docs/api-schema-and-design.md covering every
module and every endpoint. Every field must be documented.
Every error case must have a status code and message.
This document will be used directly by both backend and
frontend developers — make it complete and unambiguous.
````

---

## PROMPT 18 — Create TDD Test Suite and Logs

**Output Files:** Multi-file (backend/tests/ and frontend/tests/ test suites; backend/backend-test-log.md, frontend/frontend-test-log.md)

---

### Prompt Content (Verbatim)

````text
Role: You are an expert Software Architect, Senior QA Engineer,
Frontend QA Engineer, Backend QA Engineer, and Test-Driven Development
(TDD) specialist.

Your responsibility is to build the entire project by strictly following
the Red → Green → Refactor TDD cycle.

Implementation must never be written before its corresponding
failing test exists.

Context:
@[docs/prd.md]  → Product Requirements
@[docs/kpi.md]  → Acceptance Criteria (single source of truth)
@[docs/api-schema-and-design.md]  → Complete API Schema & Design
@[modules]  → Feature documents
@[personas/qa-persona.md]  → Testing standards

Objective: Analyze all available documents and generate the complete
project test suite before any implementation.
Assume no implementation exists.
Therefore every generated test must initially fail.
The generated tests will become the specification for building
the application.

---

Format: Generate exactly these 4 outputs:

─── OUTPUT 1: Backend Executable Jest Test Files ───
Framework: Jest
Location: backend/tests/

Folder structure:
backend/tests/
    [module-name]/
        [feature].test.js
        [feature].test.js
    [module-name]/
        [feature].test.js

Example:
backend/tests/
    auth/
        login.test.js
        register.test.js
    users/
        user.test.js
    products/
        product.test.js

Rules:
- Generate real, executable Jest test files
- Every test must call the actual implementation path
  (even though it does not exist yet — tests will fail as expected)
- Use describe() blocks per feature
- Use it() or test() blocks per test case
- Use beforeEach / afterEach for setup and teardown
- Mock external services and databases appropriately
- Every test must have a clear expected assertion

─── OUTPUT 2: Frontend Executable Test Files ───
Framework: Vitest + React Testing Library (Jest-compatible syntax)
Location: frontend/tests/

Folder structure:
frontend/tests/
    [ComponentName].test.tsx
    [ComponentName].test.tsx

Example:
frontend/tests/
    Login.test.tsx
    Register.test.tsx
    Dashboard.test.tsx
    ProductCard.test.tsx

Rules:
- Generate real, executable Vitest + React Testing Library test files
- Use describe() and it()/test() blocks
- Use render(), screen, fireEvent, userEvent from
  @testing-library/react
- Mock API calls using vi.mock() or jest.mock()
- Every test must have a clear expected assertion

─── OUTPUT 3: backend/backend-test-log.md ───
Tabular format — one row per test case:

| Test ID | Module | Feature | Test File | Test Name | Status | Priority | Last Updated | Remarks |

Rules:
- Test ID format: BE-[ModuleNum]-[FeatureNum]-[TestNum]
  e.g. BE-01-02-003
- Test File: relative path e.g. backend/tests/auth/login.test.js
- Initial Status for ALL rows: Fail
- Priority: High / Medium / Low
- Never delete rows — only update Status Fail → Pass later

─── OUTPUT 4: frontend/frontend-test-log.md ───
Same tabular format:

| Test ID | Module | Feature | Test File | Test Name | Status | Priority | Last Updated | Remarks |

Rules:
- Test ID format: FE-[ModuleNum]-[FeatureNum]-[TestNum]
  e.g. FE-01-02-003
- Test File: relative path e.g. frontend/tests/Login.test.tsx
- Initial Status for ALL rows: Fail
- Priority: High / Medium / Low
- Never delete rows — only update Status Fail → Pass later

---

Test Coverage — For every module and feature generate tests covering:

Backend (minimum 10 per feature, target 15+):
- Happy paths for every API endpoint
- Validation (missing fields, wrong types, boundary values)
- HTTP status codes (200, 201, 400, 401, 403, 404, 409, 500)
- Authentication (no token, expired token, invalid token)
- Authorization (wrong role, access control boundaries)
- CRUD operations
- Search, filter, sort, pagination (if applicable)
- Database integrity (duplicates, foreign key violations)
- Concurrency and transactions
- Security: SQL Injection, NoSQL Injection, XSS, CSRF, IDOR
- Performance edge cases (large payloads)
- Empty inputs, max length, special characters
- Error handling and unexpected states

Frontend (minimum 10 per feature, target 15+):
- Component rendering (correct elements present)
- User interactions (clicks, inputs, form submissions)
- Form validation (required fields, error messages, format rules)
- State management (loading, success, error states)
- API integration (correct endpoint called, response handled)
- Navigation and routing
- Responsive behavior (mobile, tablet, desktop)
- Accessibility (ARIA labels, keyboard navigation, focus)
- Empty states and null data handling
- Error state UI (API failure, network error)
- Optimistic updates (if applicable)
- End-to-end user journeys per feature

---

Strict Rules:
- Never generate controllers
- Never generate services
- Never generate repositories
- Never generate components
- Never generate APIs
- Never generate database logic
- Never skip test generation for any feature
- Never implement before failing tests exist
- Always think like Senior QA Engineer + Security Engineer
  + Performance Engineer + malicious user
- Infer edge cases even when not explicitly documented

---

Workflow (follow for every feature):
1. Read feature requirements from @[modules]  and @[docs/kpi.md] 
2. Generate backend failing Jest test file
3. Generate frontend failing Vitest/RTL test file
4. Register every test in respective log file with Status = Fail
5. Do NOT generate implementation code
6. Move to next feature and repeat

---

Task:
First, output a summary list of ALL modules and features
discovered from the provided documents.

Then generate:
- All backend Jest test files inside backend/tests/
- All frontend Vitest/RTL test files inside frontend/tests/
- backend/backend-test-log.md (all rows Status = Fail)
- frontend/frontend-test-log.md (all rows Status = Fail)

Every generated test must initially fail because no
implementation exists yet.
Do not produce any implementation code whatsoever.
````

---

## PROMPT 19 — Configure Project Dependencies for Running Tests

**Output Files:** `backend/package.json`, `frontend/package.json`, `frontend/vite.config.js`, `frontend/tests/setup.ts`

---

### Prompt Content (Verbatim)

````text
yes i want to run
````

---

## PROMPT 20 — Run Test Cases and Update Logs

**Output Files:** None (Log update request)

---

### Prompt Content (Verbatim)

````text
run all testcases module wise and maintained log also
````

---

## PROMPT 21 — Execute Prompt Logger Skill

**Output File:** `Doc/Prompt_Log.md`

---

### Prompt Content (Verbatim)

````text
/Users/apple/.gemini/config/skills/prompt-logger.md execute this file for this session and maintain logs
````

---

## PROMPT 22 — Fix Infinite Loop on Course Curriculum Page

**Output File:** `frontend/`

---

### Prompt Content (Verbatim)

````text
I am working on a project that was largely developed using AI-assisted coding.

Tech stack:

* Frontend: React + Bootstrap
* Backend: Node.js + Express
* Database: (inspect and identify from the codebase)

Issue:
On the Instructor side, when I open the Course Curriculum page and try to add or manage course modules, the frontend starts calling the course details API continuously in a loop.

Affected API:
GET /api/courses/:courseId

Example logs:

GET /api/courses/6a2fa893484f990a90ffb2d6 200
GET /api/courses/6a2fa893484f990a90ffb2d6 200
GET /api/courses/6a2fa893484f990a90ffb2d6 200
...repeats indefinitely

Expected behavior:

* Course details API should be called only when necessary:

  * Initial page load
  * Manual refresh
  * After successful curriculum/module updates
* API should not continuously refetch in a loop.

Tasks:

1. Perform a root-cause analysis.
2. Trace the complete flow from React component → hooks → context/store → API service layer.
3. Identify why repeated renders or repeated API calls are occurring.
4. Look specifically for:

   * useEffect dependency issues
   * State updates triggering re-renders
   * Infinite render loops
   * Context/provider updates
   * React Query/SWR refetch settings (if used)
   * Redux dispatch loops (if used)
   * Parent-child component re-render cycles
   * setState calls inside useEffect causing dependency changes
   * Memoization issues
   * Missing useCallback/useMemo where required
5. Identify the exact file(s) and line(s) causing the issue.
6. Explain the root cause in detail.
7. Provide the minimal safe fix.
8. Ensure the fix does not break:

   * Course creation
   * Course editing
   * Curriculum management
   * Module creation
   * Lesson creation
9. Search the entire codebase for similar patterns that may create additional API call loops.
10. Generate a report with:

    * Root cause
    * Impact
    * Files affected
    * Code changes required
    * Verification steps

Important:
Do not make assumptions. Inspect the actual code flow and identify the precise source of the repeated GET /api/courses/:courseId requests before proposing changes.
````

---

## PROMPT 23 — Add screen to see and edit Modules in the course

**Output File:** `frontend/src/pages/Course/`

---

### Prompt Content (Verbatim)

````text
Add one screen/page to see and edit Modules in the course
````

---

## PROMPT 24 — Create Global Module Management Page

**Output File:** `frontend/src/pages/Course/GlobalModuleManagement.jsx` (and Sidebar updates)

---

### Prompt Content (Verbatim)

````text
make this on seperate on sidebar create module 
click on that will show exisiting course 
select course and add modules 
will reflect on dropdown of course on this page
````

---

## PROMPT 25 — Document the New Global Module Management Feature

**Output File:** `Doc/feature_new_added.md`

---

### Prompt Content (Verbatim)

````text
now add one .md file for this new Feature added for this what we this feature doing 
feature_new_added.md
````

---