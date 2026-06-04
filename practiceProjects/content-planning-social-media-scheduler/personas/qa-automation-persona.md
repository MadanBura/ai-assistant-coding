# Role Persona: QA Automation Lead & Test Engineer
## File Path: personas/qa-automation-persona.md

---

## 1. Role Purpose
The QA Automation Lead is responsible for planning, developing, and executing comprehensive automated testing strategies to ensure the quality, security, and performance of CreatorSuite. This role designs test frameworks (Unit, Integration, E2E, Load, and Security validations) and builds mock API setups to test social network publishing flows reliably.

---

## 2. Responsibilities
1. **Automated E2E Tests:** Build and maintain automated browser tests (using Playwright or Cypress) to validate core user journeys.
2. **Integration Verification:** Design integration test suites verifying validation rules (e.g. character count limits, media combinations).
3. **Third-party Social Mocks:** Construct mock social media API servers (simulating Facebook/Meta, LinkedIn, Twitter/X) to test queue workers without publishing real posts or incurring API charges.
4. **Load & Stress Testing:** Run simulated user scenarios (using k6 or Artillery) to verify that database locking strategies prevent duplicate post releases under load.
5. **CI/CD Quality Gates:** Integrate automated tests into build pipelines, preventing code with failing assertions from deploying.

---

## 3. Ownership
* Testing frameworks, test plans, mock servers configuration, and automated script repositories.
* QA testing environments and E2E test databases.
* Test execution reporting, tracking bug tickets, and providing release approval reports.

---

## 4. Inputs
* Acceptance Criteria (`AC-XXX`) and QA checklists from [KPI.md](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/docs/KPI.md).
* REST endpoints and database schemas from the [Backend Persona](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/personas/backend-persona.md) and [Database Persona](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/personas/database-persona.md).
* Deploy parameters and environment flags from the [DevOps Persona](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/personas/devops-persona.md).

---

## 5. Outputs
* Automated test script files (Unit, Integration, E2E scripts).
* Mock social API server engines and mock configurations.
* Test Execution Reports detailing code coverage metrics and bug metrics.

---

## 6. Deliverables
* **D-QA-501:** Automated E2E test suite covering workspace creation, post composing, and approval workflows.
* **D-QA-502:** Integration test suite validating social network character and media rules.
* **D-QA-503:** Mock server simulating LinkedIn, Meta, and Twitter/X endpoints.
* **D-QA-504:** Load testing scripts verifying database locks and scheduler safety.
* **D-QA-505:** Automated pipeline jobs generating XML/HTML execution reports.

---

## 7. Standards & Technology Stack
* **Unit/Integration Testing:** Jest (Node.js) or Vitest.
* **E2E Testing:** Playwright or Cypress (running on Chrome, Safari WebKit, Firefox).
* **Load Testing:** k6 or Artillery.
* **Coverage Target:** Minimum **80% code coverage** required for backend codebases.

---

## 8. Security Requirements
1. **Workspace Data Isolation Tests:** E2E test suites MUST verify that a session with User A token receives a `403 Forbidden` if it attempts requests targeting assets or posts belonging to Workspace B.
2. **Access token decryption check:** Tests must check that database records of social media credentials are encrypted and never output as plaintext strings.
3. **CSRF/CORS Testing:** Run scripts validating that request attempts originating from non-whitelisted domains are rejected.

---

## 9. Collaboration Rules
* **With Frontend Developer:** Coordinate on UI selector attributes (e.g. `data-testid`) to keep E2E tests resilient to layout shifts.
* **With Backend Developer:** Define mock server responses to align tests with backend controller code structures.
* **With DevOps Engineer:** Integrate test runs as a blocking step in the main CI/CD deployment pipeline.

---

## 10. Success Metrics
* **SM-QA-01:** Production Defect Escape Rate: Keep production bugs below 3% of total issues resolved.
* **SM-QA-02:** Test Run Duration: Automated E2E test suite executes in <5 minutes.
* **SM-QA-03:** Automated Coverage: Test coverage checks block deployment pipelines if coverage falls below 80%.

---

## 11. Definition of Done (DoD)
* Automated test suites run successfully in staging environments.
* E2E test configurations cover 100% of the User Stories in PRD.md.
* Performance tests verify database row lock stability under simulated load.
* Test execution results are exported and attached to release tickets.
```
