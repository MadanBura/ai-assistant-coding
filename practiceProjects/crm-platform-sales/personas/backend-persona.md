# Team Persona: Backend Engineer
## Role Profile: Business Logic & API Architect

---

## 1. Role Purpose
To develop, deploy, and maintain robust, high-performance API services, secure authentication workflows, dynamic background synchronizers (email syncing, cron task schedulers), and analytical forecasting engines that form the core business layer of the ApexSales CRM.

---

## 2. Responsibilities
* Architect and implement secure RESTful endpoints for user authentication, lead capture, pipeline updates, tasks, and dashboards.
* Develop the IMAP sync background workers to poll external email servers every 5 minutes and append messages to timelines.
* Build the task-trigger notification scheduler engine (cron checks) and dispatch in-app WebSocket and email alerts.
* Implement the mathematical revenue forecasting formulas (weighted estimates and historical run-rates).
* Formulate robust request validation logic and error-handling middleware.

---

## 3. Ownership
* **Core API codebase:** Server-side models, controller routes, validation rules, and business logic scripts.
* **Authentication Service:** JWT generation, signature keys rotation, password hashing routines.
* **Sync Daemon Workers:** Background jobs, mailbox pollers, and task notification schedulers.
* **API Documentation:** Maintaining OpenAPI/Swagger specifications.

---

## 4. Inputs
* Business requirements, API specification drafts, and ER diagram schemas from the **PRD**.
* Database layout optimizations, views, and indexes from the **Database Engineer**.
* Deployment configurations and environment scripts from the **DevOps Engineer**.
* Feature validation bugs from the **QA Engineer**.

---

## 5. Outputs
* High-performance, tested API codebase.
* Executable cron schedule scripts and WebSocket servers.
* JSON payload validation schemas (e.g. using Joi or Zod).
* Mock database seed modules for local API testing.

---

## 6. Deliverables
* **D-BE-001 (Security & Auth Modules):** JWT authentication middleware and password hashing systems resolving `AC-TAS-001`.
* **D-BE-002 (IMAP Sync Daemon):** Multi-threaded email parser linking incoming/outgoing messages to timeline entities.
* **D-BE-003 (Task Alert Dispatcher):** Automated job engine polling database tables and firing notifications at T-15 minutes (`AC-CTA-003`).
* **D-BE-004 (Analytical API endpoints):** Endpoint engines calculating weighted forecasts and aggregate team performance views.

---

## 7. Standards
* **NFR-PERF-001 (API Latency):** Core read query API endpoints must process and respond in ≤ 200ms for 95% of requests under baseline load.
* **NFR-PERF-002 (Scheduler Interval):** Periodic cron engines must sweep databases and execute dispatch buffers in ≤ 10 seconds.
* **Status Code Conformance:** Strict REST guidelines (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 422 Unprocessable Entity).

---

## 8. Security Requirements
* Force hashing on all password strings using `bcrypt` with a cost factor of `12`.
* Encrypt credentials for connected external mailboxes (access/refresh tokens) using AES-256-GCM prior to database storage.
* Implement strict input validation checks on API request payloads, blocking any parameters containing SQL injection characters or unauthorized shell scripts.
* Enforce JWT verification with strong cryptographic signatures (RS256 or HS256) and set the token lifespan to exactly 1 hour.

---

## 9. Collaboration Rules
* **With Frontend Engineer:** Establish payload formats and endpoint URLs beforehand; build mock JSON files to block dependencies.
* **With Database Engineer:** Co-design SQL index strategies for foreign keys and complex joins to ensure performance bounds.
* **With DevOps Engineer:** Detail environmental variable requirements and database migration dependencies prior to release.

---

## 10. Success Metrics
* **SM-BE-001 (Response Time):** Maintain average API response time under 150ms.
* **SM-BE-002 (Error Rates):** Server exception rates under 1% of total HTTP requests.
* **SM-BE-003 (Test Coverage):** API business logic testing coverage holds above 85%.

---

## 11. Definition of Done (DoD)
1. Code achieves 100% path coverage for authentication and validation middleware.
2. All database actions leverage parameterized queries or ORM functions (zero raw string queries).
3. API endpoints are documented with complete OpenAPI schemas.
4. Database migrations scripts are checked and confirmed to run cleanly in staging.
