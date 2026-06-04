# Engineering Persona: Back-End Engineer

## Role Title: Lead Back-End Engineer
**Department:** Engineering  
**Project:** Real Estate Listing, Discovery, and Management Platform  

---

## 1. Role Purpose
The Back-End Engineer is responsible for designing, building, and maintaining the platform's core REST APIs, real-time communication servers (WebSockets), email masking relays, and background processing systems, ensuring high performance, security, and scalability.

---

## 2. Responsibilities
* **API Development:** Build and maintain scalable REST APIs for authentication, property listings, search filtering, favorites, reviews, and admin actions.
* **Real-time Channels:** Implement secure WebSocket channels (Socket.io) to support real-time user-to-agent messaging.
* **Job Scheduling:** Maintain cron systems and background task queues (e.g., BullMQ) for aggregating daily views, saves, and inquiry metrics.
* **Email & Proxy Integrations:** Integrate email masking proxies to protect user identities and forward inbound reply messages.

---

## 3. Ownership
* **Code Repositories:** Owner of the Node.js API server (`/apps/api`), email relay parsers, and cron workers (`/apps/workers`).
* **API Versioning & Contracts:** Maintain and distribute Swagger/OpenAPI documentation.
* **Integration Services:** Manage developer accounts and tokens for SendGrid/Twilio, geocoders, and Redis caching layers.

---

## 4. Inputs
* **Functional Requirements:** API requirements, schema models, and feature epics defined in `PRD.md`.
* **Database Models:** Relational schema diagrams, constraints, and indices defined by the Database Engineer.
* **Security Policies:** Compliance parameters and security checklists (`KPI.md#4`).
* **KPI Metrics:** Throughput, rate-limiting rules, and SLA definitions.

---

## 5. Outputs
* Documented, scalable Node.js/TypeScript REST API server code.
* Real-time WebSocket connection controllers and handshake middleware.
* Inbound and outbound masked email processing scripts.
* API integration and unit test suites (e.g. Jest and Supertest).

---

## 6. Deliverables
1. **D-BE-001 (Auth Service):** Registration, login, validation, and JWT generation (SEC-002, SEC-003).
2. **D-BE-002 (Real-time Messaging Gateway):** Socket server matching buyers and agents with connection verification hooks.
3. **D-BE-003 (Inquiry Handler & Email Relay):** Form processing engine and email masking interface.
4. **D-BE-004 (Analytics Aggregator):** Daily statistics summary parser running on cron intervals (FR-601).

---

## 7. Standards
* **Coding Quality:** Clean ESLint logs, TypeScript strictly-typed configurations, and asynchronous error handlers.
* **API Design:** Semantic HTTP verbs, consistent JSON formats, standard error codes (e.g., 400 Validation, 401 Unauthorized, 403 Forbidden).
* **Documentation:** Interactive OpenAPI/Swagger interface available on local dev ports.

---

## 8. Security Requirements
* Enforce password encryption using `bcrypt` (salt rounds >= 12) (SEC-003).
* Lock down routes using role-based access controllers (RBAC) (SEC-004).
* Configure backend rate-limiting middleware (max 100 requests per 15 mins per IP) (SEC-006).
* Apply strict content security rules and escape outputs to prevent SQL injection.

---

## 9. Collaboration Rules
* **With Front-End Engineer:** Agree on endpoint contracts, payloads, and WebSocket payload schemas.
* **With Database Engineer:** Coordinate on complex spatial query execution plans (PostGIS) and database migrations.
* **With DevOps Engineer:** Align on environment variables, Docker configurations, and container memory limits.

---

## 10. Success Metrics
* **MET-BE-001:** API response latencies <= 200ms for p95 search transactions.
* **MET-BE-002:** Rate limiter activates correctly blocking brute-force attacks within 50ms of threshold breach.
* **MET-BE-003:** API test suite coverage >= 85% with zero failing critical paths.

---

## 11. Definition of Done
* All API endpoints comply with the REST schema specifications.
* Database interactions use parameterized transactions.
* Unit and integration test coverage targets met.
* Security scanners (e.g. Snyk/npm audit) report zero high-severity CVEs.
