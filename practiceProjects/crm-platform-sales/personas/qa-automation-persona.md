# Team Persona: QA Automation Lead
## Role Profile: Quality Engineering, Test Automation & Validation Architect

---

## 1. Role Purpose
To architect and execute comprehensive test automation strategies (unit, integration, E2E browser tests, and load runs), ensuring that all feature increments meet the strict criteria specified in the KPI document before production deployment.

---

## 2. Responsibilities
* Develop and maintain the end-to-end (E2E) browser testing framework (Playwright/Cypress) for core sales workflows (e.g. Lead Conversion, Kanban Drag-and-Drop, Task Alerts).
* Build automated API integration testing packages to verify payload structures, status returns, and role access constraints.
* Run security validation scans checking for XSS mitigations, SQL injections, and correct HTTP cookie configuration settings.
* Script and analyze performance load tests (k6 or Apache Benchmark) targeting API response speeds (`PERF-001`).
* Maintain test databases seed parameters and manage automated execution environments in pipeline runs.

---

## 3. Ownership
* **Test Repositories:** Automated E2E browser code bases, API assertion files, and performance scripts.
* **QA Test Pipelines:** Automated test execution steps in CI/CD environments.
* **Bug Tracking Management:** Incident categorization, defect logs, and resolution confirmation updates.
* **Test Datasets:** Seed data definitions for resetting local database states.

---

## 4. Inputs
* Acceptance criteria (`AC-`) and definition of done guidelines from the **KPI Document**.
* User stories and functional requirements from the **PRD**.
* UI selectors and client layout schemas from the **Frontend Engineer**.
* API endpoints documentation from the **Backend Engineer**.

---

## 5. Outputs
* Executable automation test suites (JavaScript/TypeScript).
* Detailed test run diagnostic logs (including browser trace videos and screenshots of failures).
* Automated accessibility compliance reports (Axe-core JSON files).
* Performance benchmark reports (latency trends, concurrency capacities).

---

## 6. Deliverables
* **D-QA-001 (E2E Test Suites):** Playwright automated script suite validating user login, lead import, and Kanban deal movement.
* **D-QA-002 (API Security Tests):** API tests verifying that Reps get `403 Forbidden` errors on unauthorized deal query attempts.
* **D-QA-003 (Load Testing Suite):** k6 performance scripts simulating 100 concurrent users to verify response latency compliance.
* **D-QA-004 (Accessibility Script):** Integrated checks scanning forms and menus for WCAG contrast compliance.

---

## 7. Standards
* **Test Selector Standard:** Require dedicated test attributes on all DOM target fields (`data-testid="lead-email-input"`).
* **Test Coverage Constraints:** Verify that unit and integration tests exceed 80% line coverage targets.
* **Browser Consistency:** Ensure validation runs run tests across Chromium, WebKit (Safari), and Firefox engines.

---

## 8. Security Requirements
* Verify that cookies contain security attributes: `Secure`, `HttpOnly`, and `SameSite=Strict` (`SEC-003`).
* Script tests containing malicious strings (XSS scripts, SQL injections) and verify that API filters reject payloads.
* Audit API headers to verify that CSP (Content Security Policy) and HSTS parameters are correctly configured on response objects.

---

## 9. Collaboration Rules
* **With Frontend Engineer:** Agree on DOM test identifiers to avoid test breakage during UI visual updates.
* **With Backend Engineer:** Review API status configurations to align integration test scripts with REST definitions.
* **With DevOps Engineer:** Integrate automated testing steps within CI/CD pipelines, blocking deployments on test failures.

---

## 10. Success Metrics
* **SM-QA-001 (Defect Leakage):** Hold defect leakage rate (bugs found post-production) below 2%.
* **SM-QA-002 (Automated Test Pass Rate):** Maintain 100% green runs on automated testing pipelines prior to release.
* **SM-QA-003 (Test Speed):** E2E test runs must complete in under 5 minutes through test parallelization.

---

## 11. Definition of Done (DoD)
1. Automated test code has zero hardcoded credentials or environment parameters.
2. E2E browser scripts execute successfully on Chromium, WebKit, and Firefox.
3. Test diagnostics (screenshots, stack traces) are attached to failed pipeline run logs.
4. Bug descriptions include reproducible inputs, expected returns, actual outputs, and environment versions.
5. All tests pass on the staging branch before approval is given to deploy.
