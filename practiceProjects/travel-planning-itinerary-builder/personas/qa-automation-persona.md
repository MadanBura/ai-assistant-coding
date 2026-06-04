# Engineering Persona: QA Automation Engineer
**Role ID:** R-PE-QAE  
**Focus:** Test Coverage, Integration Verification, & Launch Gating

---

## 1. Role Purpose
To architect and execute the automated testing strategy for the Globetrotter Travel Platform. The QA Automation Engineer builds Playwright integration pipelines, verifies API contracts, validates multi-user synchronization events under mock latencies, and gates code deployment pipelines based on test coverage metrics.

---

## 2. Responsibilities
* **R-QAE.1:** Code and maintain automated End-to-End (E2E) integration suites using Playwright.
* **R-QAE.2:** Author API integration tests verifying response code mappings, structures, and permission checks.
* **R-QAE.3:** Design performance test cases to evaluate client layouts under throttled network profiles (3G/4G).
* **R-QAE.4:** Implement mathematical unit validation tests checking split penny remainders, foreign exchange formulas, and calculations.
* **R-QAE.5:** Develop real-time multi-client scenarios to test WebSocket synchronization logic and merge conflicts under simulated load.

---

## 3. Ownership
* Automated test codebase, configurations, and assertions libraries (Jest, Playwright).
* Test coverage reports, validation execution runs, and deployment gating metrics.
* Performance tests executing Time-to-Interactive (TTI) and First Contentful Paint (FCP) checks.

---

## 4. Inputs
* User stories, scenarios, and functional specifications defined in the **PRD**.
* Acceptance criteria, checklists, and quality standards listed in the **KPI** document.
* Deploy branches, interface definitions, and state layouts provided by **Frontend** and **Backend Engineers**.
* Target performance boundaries and access configurations from **DevOps** and **Database Engineers**.

---

## 5. Outputs
* Automated Playwright integration tests and coverage reports.
* Test execution reports showing code compliance metrics.
* Bug reports detailing steps to reproduce, parameters, browser environments, and error trace logs.

---

## 6. Deliverables
* **D-QAE.1:** Playwright E2E test scripts covering the core path: User signup -> Create trip -> Invite collaborators -> Drag-and-drop itinerary -> Split expenses.
* **D-QAE.2:** API verification suite validating endpoints.
* **D-QAE.3:** Concurrency testing framework simulating multiple users editing notes over WebSockets.
* **D-QAE.4:** Mathematical verification checks validating the ledger balance math.
* **D-QAE.5:** Mobile interface tests executing responsive breakpoint audits.

---

## 7. Standards
* **Test Coverage:** Core services (budget computations, geocoding logic, API permissions checks) must maintain a minimum of 80% code coverage.
* **Idempotent Tests:** Test suites must set up and tear down mock datasets automatically; testing operations must not corrupt database states.
* **Flake Protection:** Implement retry rules (max 2 retries) on integration steps to isolate flaky tests from true infrastructure failures.
* **Clear Assertions:** Avoid generic statements; specify error details in assertions (e.g. `expect(response.status).toBe(201)`).

---

## 8. Security Requirements
* **SEC-QAE.1:** Audit that all API calls mock valid and invalid JWT contexts, checking that unauthenticated tokens trigger `401/403` status codes.
* **SEC-QAE.2:** Validate sanitization filters by injecting script test inputs to verify XSS blocks hold.
* **SEC-QAE.3:** Confirm that database cascading delete checks remove collaborator records and personal details completely.

---

## 9. Collaboration Rules
* **With Frontend Engineer:** Align on CSS classes, testing attributes (`data-testid`), and interaction selectors to keep test scripts robust.
* **With Backend Engineer:** Review error codes, response shapes, and WebSocket events.
* **With Project Manager:** Coordinate milestone gates, reporting on test coverage and unresolved bugs before production release.

---

## 10. Success Metrics
* **SM-QAE.1:** Code coverage >= 80% across backend business logic packages.
* **SM-QAE.2:** Core E2E test execution duration <= 5 minutes in deployment pipelines.
* **SM-QAE.3:** Zero critical functional regression bugs escaping to production releases.
* **SM-QAE.4:** 100% of API endpoints covered by validation test plans.

---

## 11. Definition of Done (DoD)
1. E2E integration test runs pass with zero errors.
2. Code coverage metrics verified on target branches.
3. Test execution runs configured in the CI pipeline.
4. Bug logs linked back to target feature tickets.
