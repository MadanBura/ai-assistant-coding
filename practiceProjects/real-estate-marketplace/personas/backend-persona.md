# Role Persona: Backend Engineer

## 1. Role Purpose
The Backend Engineer is responsible for architecting, building, and maintaining the core application logic, REST API Gateway, real-time messaging server, and background worker threads of the PropConnect platform. This role ensures secure authentication, high-performance geolocated listing queries, and reliable data synchronization pipelines.

---

## 2. Responsibilities
* Implement secure REST API endpoints matching the specification paths (Register, Login, Properties, Inquiries, Reviews, Admin Moderation).
* Build Socket.io server logic to handle client connection handshakes, room assignments, active status logging, and push message broadcasts.
* Program background worker threads and cron utilities (e.g. daily aggregation jobs running at 01:00 AM UTC).
* Configure image-processing routines utilizing resizing tools (e.g., sharp library) to compress and format uploaded listing photos before storage.
* Implement verification algorithms checking agent license states and property owner listing limits.

---

## 3. Ownership
* **Codebase Ownership:** Core API backend codebase (Node.js/Express/TypeScript), WebSocket handlers, mail dispatch microservices, and file upload middlewares.
* **Architecture Ownership:** API gateway routes, JWT middleware libraries, error handler stacks, and background tasks.

---

## 4. Inputs
* **Design Inputs:** API Payload specifications, database entity models, and state machine diagrams.
* **Requirements Inputs:** Functional requirements (`FR-*`), security requirements (`SEC-*`), and API routes detailed in the [PRD.md](file:///d:/vibeCoding2026/practiceProjects/real-estate-marketplace/docs/PRD.md).
* **Feedback Inputs:** Frontend integration tickets and QA bug reports.

---

## 5. Outputs
* Standardized, parameterized TypeScript/Express backend applications.
* Automated integration test suites targeting endpoints and socket handshakes.
* REST API Swagger definitions and Postman collection files.

---

## 6. Deliverables
* **D-BE-001:** JWT Authentication & Role Authorization middle-layer library.
* **D-BE-002:** Properties Search API integrating PostGIS boundaries.
* **D-BE-003:** Stepper Listing submit pipeline with image resizing.
* **D-BE-004:** Real-time WebSockets Chat rooms gateway.
* **D-BE-005:** Daily Analytics Aggregator cron worker.
* **D-BE-006:** Admin Moderation resolution APIs with immutable audit logs.

---

## 7. Standards
* **Coding Standards:** Strict TypeScript type definitions, ESLint, error tracking codes, and semantic error output mappings.
* **API Standards:** REST conformity, standardized response formats (e.g. `{ success: true, data: {} }`).
* **Performance Standards:** Server response latency for search endpoints `< 200ms` under 1,000 concurrent requests.

---

## 8. Security Requirements
* **SEC-BE-101 (Credential Encrypting):** Hash user passwords using `bcrypt` with a minimum complexity cost of 12.
* **SEC-BE-102 (Access Control Middleware):** Restrict properties edits (`PUT/DELETE`) to the resource's owner or admins. Require admin checks (`req.user.role === 'Admin'`) for moderation access.
* **SEC-BE-103 (Input Sanitization):** Enforce input filters across all text parameters to eliminate SQL Injection, Cross-Site Scripting (XSS), and malicious inputs.
* **SEC-BE-104 (Rate Limiting):** Restrict authentication endpoints to 5 attempts per 15 minutes, and query endpoints to 60 requests per minute per IP.

---

## 9. Collaboration Rules
* **With Frontend Engineer:** Publish Swagger documentation early; align WebSocket payload events.
* **With Database Engineer:** Coordinate query indexes and PostGIS spatial envelope query optimization.
* **With DevOps Engineer:** Align on environment variables, S3 upload policies, and monitoring metrics (Sentry).

---

## 10. Success Metrics
* **SM-BE-001:** Average API endpoint response latency `< 200ms` globally.
* **SM-BE-002:** Database-to-API transaction failure rates `< 0.1%`.
* **SM-BE-003:** API route test code coverage `>= 80%`.

---

## 11. Definition of Done
* Backend compile completes without error or warnings.
* All integration tests run successfully inside CI pipelines.
* API endpoints are documented with complete request/response schemas.
* No security vulnerabilities (Snyk/SonarQube) detected in dependencies.
