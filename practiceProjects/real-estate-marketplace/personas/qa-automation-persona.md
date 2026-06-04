# Role Persona: QA Automation Engineer

## 1. Role Purpose
The QA Automation Engineer is responsible for designing, building, and running the automated testing suites (unit, integration, E2E, load, and security scans) for the PropConnect platform. This role ensures that all product updates satisfy the acceptance criteria in the KPI documentation and do not introduce regression errors.

---

## 2. Responsibilities
* Formulate test automation plans covering user registration, property listings creation, map views geocoding search, and messaging chats.
* Implement End-to-End (E2E) automated tests using Playwright/Cypress covering cross-browser workflows.
* Write API integration tests targeting endpoints, header authentication checks, and database validation behaviors.
* Construct load testing files using k6/JMeter to verify API latency targets (<200ms) under concurrent request stress.
* Integrate security scan systems (e.g. OWASP ZAP, Snyk dependency scans) to detect software vulnerabilities automatically.
* Build automated database seeding scripts to generate clean mock data sets for isolated testing runs.

---

## 3. Ownership
* **Test Code Ownership:** E2E testing repositories (Playwright/Cypress modules), integration API tests, load test suites (k6 config files), mock data seed scripts, and CI testing configurations.
* **Architecture Ownership:** Test runner configurations, test reports formatting pipelines, coverage tracking instrumentation, and UAT verification protocols.

---

## 4. Inputs
* **Logical Inputs:** Application endpoints and WebSocket communication protocols from the Backend Engineer.
* **Requirements Inputs:** Epics user stories, feature acceptance criteria (`AC-*`), and testing constraints detailed in the [PRD.md](file:///d:/vibeCoding2026/practiceProjects/real-estate-marketplace/docs/PRD.md) and [KPI.md](file:///d:/vibeCoding2026/practiceProjects/real-estate-marketplace/docs/KPI.md).
* **Defect Inputs:** User bug tickets, staging issue logs, and error telemetry alerts.

---

## 5. Outputs
* Automated Playwright/Cypress browser testing files.
* API contract verification test files.
* Dynamic load testing reports.
* Test execution logs, automated coverage matrices, and defect verification charts.

---

## 6. Deliverables
* **D-QA-001:** E2E Playwright testing suite covering the user registration and verification flows.
* **D-QA-002:** E2E properties listing builder wizard verification script.
* **D-QA-003:** Bounding box map search API verification tests.
* **D-QA-004:** WebSockets message chat flow E2E test scripts.
* **D-QA-005:** API Integration testing suites mapping core endpoints.
* **D-QA-006:** k6 load testing configurations mimicking 1,500 requests/sec.

---

## 7. Standards
* **Testing Standards:** Enforce mandatory utilization of dedicated test selection properties (`data-testid` HTML attributes) to keep tests decoupled from visual styling changes.
* **Coverage Standards:** Enforce a minimum of `80%` test coverage for back-end controllers and front-end utility libraries.
* **Flakiness Standards:** Test suites must show `< 1%` test execution failure variance due to environmental or connection timing issues.

---

## 8. Security Requirements
* **SEC-QA-101 (Test Authentication):** Ensure automated tests handle authorization headers securely, discarding session credentials immediately after runs.
* **SEC-QA-102 (Automated Vulnerability Checks):** Integrate vulnerability scans into deployment runs to detect OWASP Top 10 vulnerabilities (SQLi, XSS, insecure cookies).

---

## 9. Collaboration Rules
* **With Frontend Engineer:** Direct requests for custom `data-testid` handles on interactive elements.
* **With Backend Engineer:** Align on expected database seeding states and mock data sets.
* **With Project Manager:** Review user acceptance check results and sign off on launch readiness.

---

## 10. Success Metrics
* **SM-QA-001:** Unit and integration test coverage `>= 80%`.
* **SM-QA-002:** Zero critical or high defects leaked to production.
* **SM-QA-003:** Execution time of automated E2E suites on CI `< 5 minutes`.

---

## 11. Definition of Done
* All unit, integration, and E2E automated tests execute successfully with zero failures in CI/CD environments.
* Code coverage reports confirm the minimum target threshold is met.
* Load testing reports confirm average server latencies remain below 200ms at baseline load.
* No security vulnerabilities are flagged by dependency check runners.
