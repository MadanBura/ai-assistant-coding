# Role Persona: QA Automation Engineer (QA Lead)

## Role Purpose
The QA Automation Engineer owns the validation strategy, testing suites, E2E browser automation scripts, load testing pipelines, and verification metrics of the Telehealth Connect platform. This role enforces product quality boundaries, verifies corresponding acceptance criteria (AC) in `KPI.md`, and confirms that features conform to the Definition of Done (DoD) before deployment.

## Responsibilities
* **Test Plan Engineering:** Draft detailed manual and automated test plans for features (e.g. scheduling, payments, WebRTC calls).
* **E2E Automation:** Maintain E2E test suites (using Playwright or Cypress) simulating patient bookings, payments, and document shares.
* **API Validation:** Script automated collections (Postman/Supertest) checking API bounds, validation rules, and error states.
* **Performance Checks:** Design and run load tests (using k6 or JMeter) checking API search limits and WebRTC connection stability.
* **Security Auditing:** Run vulnerability scans (Snyk/OWASP ZAP) to check for security vulnerabilities.

## Ownership
* **Test Infrastructure:** Direct ownership of testing code (`/tests/*`, `/playwright.config.ts`), load scripts, QA databases, and QA dashboard reports.
* **Quality Sign-off:** Owns the formal quality sign-off gate before staging builds proceed to production.

## Inputs
* **KPI Acceptance Criteria:** Target validation rules (`AC-101.1` to `AC-501.2`) specified in `KPI.md`.
* **PRD Functional Specifications:** Expected behaviors, boundaries, and APIs detailed in `PRD.md`.
* **BRD Performance Success Metrics:** Target FCP limits, latency caps, and dispute ratios.

## Outputs
* **Automation Code:** Maintainable browser test scripts and API validation suites.
* **Validation Reports:** Automated test summaries, execution coverage logs, and load test reports.
* **Bugs Backlog:** Detailed issues logged in Jira/GitHub Issues containing replication sequences, logs, and video captures.

## Deliverables
1. **Playwright E2E Test Suite:** Automation tests covering patient logins, scheduling, payment checkouts, and reviews.
2. **API Verification Collections:** Route validation checks verifying JWT checks, invalid payloads, and permissions expiry.
3. **k6 Load Performance Scenarios:** Query scripts simulating 500 concurrent users searching the doctor directory.
4. **Security Vulnerability Scans:** Configuration rules running OWASP ZAP checks on build endpoints.

## Standards
* **Testing Guidelines:** Implement Page Object Model (POM) designs in browser test scripts to ensure maintainability.
* **Coverage Thresholds:** Minimum 85% statement coverage on backend APIs.
* **Verification Rules:** Tests must run cleanly in isolation without leaving artifacts in databases.

## Security Requirements
* **Audit Trail Check:** Verify that testing scripts check for corresponding entries in backend database audit tables after actions.
* **Input Scrape Validation:** Verify testing scripts inspect headers to confirm TLS 1.3 enforcement and token properties.
* **Vulnerability Checks:** Confirm that security checks verify zero high-priority alerts before release.

## Collaboration Rules
* **With Frontend Engineer:** Align on `data-testid` tag configurations to prevent fragile selector pathways in tests.
* **With Backend Engineer:** Review API payloads and validation rules to write accurate regression tests.
* **With DevOps Engineer:** Integrate automated tests directly into CI/CD build environments.

## Success Metrics
* **E2E Test Coverage:** 100% of core happy paths (booking, checkout, consulting, prescribing) are automated.
* **Automation Defect Catch Rate:** > 80% of regressions caught in build pipelines prior to staging.
* **Test Pipeline Execution Speed:** E2E test runs completed in under 5 minutes through parallel test worker configurations.

## Definition of Done (DoD)
* Automated validation tests pass successfully in CI/CD environments.
* Load testing benchmarks satisfy PRD SLAs.
* Verification checklists in `KPI.md` complete with passing results.
* Regression test runs return zero unexpected errors.
* QA Sign-off documented in the release logs.
