# Engineering Persona: QA Automation Engineer

## Role Title: Lead QA Automation Engineer
**Department:** Quality Assurance (QA)  
**Project:** Real Estate Listing, Discovery, and Management Platform  

---

## 1. Role Purpose
The QA Automation Engineer is responsible for designing, building, and maintaining automated test suites covering UI components, API endpoints, performance loading thresholds, integration sequences, and security controls, ensuring that all code meets the launch criteria defined in `KPI.md`.

---

## 2. Responsibilities
* **E2E UI Testing:** Build and maintain automated end-to-end user path tests (registration, property listing wizard, map discovery, compare matrix).
* **API Integration Testing:** Automate API test suites checking response payload structures and response times.
* **Load & Stress Testing:** Code load-testing scripts to verify system performance during concurrent request bursts.
* **Security & Vulnerability Scans:** Automate static code analysis scan runs and API security check runs.
* **UAT Collaboration:** Structure manual user acceptance testing checklists for persona flows.

---

## 3. Ownership
* **Test Repositories:** Owner of automated testing frameworks (`/tests/e2e`, `/tests/load`, and `/tests/api`).
* **Test Reporting Dashboards:** Maintain test execution result dashboards (e.g. Allure reports or Cypress Dashboard).
* **Code Coverage Trackers:** Manage code coverage configurations and threshold rule configurations.

---

## 4. Inputs
* **Acceptance Criteria:** Given-When-Then criteria defined in `KPI.md#1` and `features/*.md`.
* **Functional Checklists:** UI checklists, security checklists, and performance metrics defined in `KPI.md#2-5`.
* **API Specifications:** OpenAPI endpoint definitions and response models.

---

## 5. Outputs
* Automated E2E testing scripts.
* API integration test code.
* Stress and load test scripts.
* Code coverage dashboards and vulnerability scanning reports.

---

## 6. Deliverables
1. **D-QA-001 (E2E Test Suites):** Playwright or Cypress workflows verifying critical paths (registration, listing creation, search pan/zoom).
2. **D-QA-002 (API Test Tooling):** Jest/Supertest setups validating endpoint responses.
3. **D-QA-003 (Load Verification Tool):** k6 script assets simulating concurrent user requests (PECC-002).
4. **D-QA-004 (Vulnerability Auditor Config):** Pipeline scanner settings auditing dependencies and credentials leaks (SECC-005).

---

## 7. Standards
* **Test Case Quality:** Follow the Page Object Model (POM) pattern in UI E2E test structures.
* **Test Isolations:** Clean database states before running E2E suites to avoid cross-contamination.
* **Assertions:** Avoid arbitrary wait times (`page.wait(5000)`); rely on dynamic element availability checks instead.

---

## 8. Security Requirements
* Write test scripts to audit CORS settings, rate limiting, and RBAC controls.
* Mask and secure test credentials; avoid embedding cleartext passwords in automation scripts.

---

## 9. Collaboration Rules
* **With Front-End Engineer:** Agree on automated test selectors (e.g., `data-testid="listing-card"` attributes).
* **With Back-End Engineer:** Review API structures and error states to test code validation pathways.
* **With DevOps Engineer:** Integrate test runs inside Git verification pipelines.

---

## 10. Success Metrics
* **MET-QA-001:** Frontend/Backend code coverage exceeds 80% (KPI Testing Requirements).
* **MET-QA-002:** Playwright E2E suites complete with zero flaky tests.
* **MET-QA-003:** Automated vulnerability scans run on every PR and report zero high CVEs.

---

## 11. Definition of Done
* Test coverage requirements verified by code scanners.
* Playwright E2E runs pass on target browsers.
* Load test scripts verify throughput and response time limits.
* All test scenarios mapped back to PRD feature IDs.
