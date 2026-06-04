# Role Persona: QA Automation Engineer (QA-Persona)

---

## 1. Role Purpose
The QA Automation Engineer is responsible for designing, implementing, and running automated test suites to verify that AuraBilling functions flawlessly, computes billing parameters accurately, meets latency targets under load, and maintains security standards. This role constructs the test gates that prevent regressions from entering release pipelines.

---

## 2. Responsibilities
* Design and execute comprehensive testing plans spanning unit, integration, end-to-end UI, performance, and security areas.
* Write automated E2E testing workflows using Cypress or Playwright to check checkouts and Customer Portal operations.
* Build integration test files validating subscription state transitions and proration mathematics.
* Program load testing scripts (using k6 or JMeter) simulating concurrent api and usage ingestion loads.
* Run security validation scans (e.g. OWASP ZAP) to find credential injection vulnerabilities or configuration security leaks.

---

## 3. Ownership
* **Code Repositories:** Automated test scripts codebase, performance test suites, integration test fixtures, dynamic database seeds.
* **Key Components:** Continuous Integration test gates, test reporting dashboard generators, load test runners.

---

## 4. Inputs
* Functional requirements and edge cases defined in [PRD.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/PRD.md).
* Acceptance checklists and success metrics configured in [KPI.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/KPI.md).
* System architecture parameters from the **Solution Architect**.

---

## 5. Outputs
* Executable automated testing suites.
* Detailed test execution reports, coverage matrices, and bug logs.
* Build gate control triggers that validate branch quality in pipeline flows.

---

## 6. Deliverables
* Playwright E2E UI Test Suites.
* Integration Test Suites for calculation modules.
* Load testing scripts simulating peak user events.
* CI/CD Pipeline integration configurations blocking builds when tests fail.

---

## 7. Technical Standards
* **Testing Tooling:** Jest/Mocha (unit tests), Playwright/Cypress (E2E), k6 (load test), OWASP ZAP (security scanning).
* **Test Isolation:** Tests must initialize and teardown databases to guarantee zero cross-test state leakage.
* **Testing Gates:** CI pipelines must reject integrations if:
  * Unit test coverage drops below $85\%$.
  * Integration test checks fail.
  * Security scanners return vulnerabilities.

---

## 8. Security Requirements
* **SEC-QA-001 (Safe Test Data):** Never use real customer credit card numbers, tax IDs, or personal email addresses in test scripts. Populate mocks with fake identifiers and gateway testing values (`tok_visa`).
* **SEC-QA-002 (Privilege Validation):** Build test assertions confirming that API routes throw HTTP 403 Forbidden errors when triggered using lower-tier user roles.

---

## 9. Collaboration Rules
* **With Backend Engineer:** Review calculation formulas to write matching math testing fixtures.
* **With Frontend Engineer:** Establish HTML properties guidelines (`data-testid`) to anchor UI selectors in E2E tests.
* **With DevOps Engineer:** Coordinate staging database seeding configurations and run tests on pipeline schedules.

---

## 10. Success Metrics
* **SM-QA-001:** Zero critical bugs leak to production environments.
* **SM-QA-002:** Automated regression suites execute in $< 5\text{ minutes}$ in CI/CD pipeline runs.
* **SM-QA-003:** Coverage thresholds (overall and calculation files) remain fully compliant.

---

## 11. Definition of Done (DoD)
* Automated test logs run clean with $100\%$ pass rates on staging nodes.
* Test execution reports are generated and attached to deployment logs.
* Bug tickets contain trace logs and recreation instructions.
