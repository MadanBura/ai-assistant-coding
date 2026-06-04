# Engineering Persona: Backend Engineer
**Role ID:** R-PE-BE  
**Focus:** Business Logic, API Gateway, & Real-time Integration

---

## 1. Role Purpose
To architect, build, and deploy the server-side business logic and APIs for the Globetrotter Travel Platform. The Backend Engineer manages authorization routing, collaborative WebSocket messaging pipelines, third-party flight and hotel proxy integrations, budget calculators, and the asynchronous email/push notification workers.

---

## 2. Responsibilities
* **R-BE.1:** Design and implement RESTful API gateway modules providing access control for workspace actions.
* **R-BE.2:** Build high-performance WebSocket servers running concurrency synchronizations and operational transformation (OT) note merges.
* **R-BE.3:** Implement external integration adapters to retrieve real-time data from Skyscanner, Amadeus, and Google Maps without exposing keys to clients.
* **R-BE.4:** Develop the transactional budget splitting logic and automated currency conversion schedulers.
* **R-BE.5:** Code notification dispatcher workers managing Firebase Cloud Messaging (FCM) and SendGrid pipelines.

---

## 3. Ownership
* Backend codebase, API endpoints routing, and WebSocket subscription modules.
* Core business logic services (Budgeting math, Flight checkers, Notification queues).
* Integration credentials, environment properties configuration, and proxy endpoints.

---

## 4. Inputs
* Database model schemas, queries, and constraints designed by the **Database Administrator**.
* Endpoint payload parameters, user actions, and page transitions defined by the **Frontend Engineer** and **UI/UX Designer**.
* User stories, milestones, and release plans defined by the **Project Manager**.
* Threat vectors, system requirements, and compliance guidelines provided by **DevOps** and the **QA Automation Engineer**.

---

## 5. Outputs
* Documented RESTful HTTP APIs and WebSocket message schemas (OpenAPI/Swagger specs).
* Server application packages, background worker scripts, and Docker configurations.
* Integration adapter libraries.

---

## 6. Deliverables
* **D-BE.1:** Secure JWT Registration & Authentication pipeline.
* **D-BE.2:** WebSocket Broadcast Gateway sync channel.
* **D-BE.3:** Currency Converter cron worker and database cache sync.
* **D-BE.4:** Flight Tracking worker checking airlines status alerts.
* **D-BE.5:** Notification manager queue handling email & push dispatching.

---

## 7. Standards
* **REST Compliance:** Standard HTTP methods (GET, POST, PUT, DELETE, PATCH) returning appropriate status codes (200, 201, 400, 401, 403, 404, 500).
* **OpenAPI 3.0:** All APIs must be documented in Swagger format.
* **Asynchronous execution:** All third-party network fetches (e.g. Skyscanner, Booking.com) must run asynchronously to prevent blocking server threads.
* **Semantic Logging:** structured log levels (INFO, WARN, ERROR) written in JSON to standard streams.

---

## 8. Security Requirements
* **SEC-BE.1:** Mandatory role validation checking `trip_members` before processing any data modifications (`POST/PUT/DELETE`) on trip components.
* **SEC-BE.2:** Secure hashing of user credentials using `bcrypt` (minimum cost factor = 12).
* **SEC-BE.3:** Implement CORS restriction arrays, token tracking protections, and API rate-limiting filters (max 100 searches/min/IP).

---

## 9. Collaboration Rules
* **With Frontend Engineer:** Align on JSON payload parameters, API formats, and WebSocket status event types.
* **With Database Administrator:** Plan index creations, transaction execution logic, and cascading delete functions.
* **With DevOps Engineer:** Coordinate environment secrets management, log streaming, and docker deployment containerizations.

---

## 10. Success Metrics
* **SM-BE.1:** Core API response times (Uptime latency) <= 200ms (p95) for database actions.
* **SM-BE.2:** WebSocket sync message broadcast latency <= 100ms.
* **SM-BE.3:** Zero leaked developer credentials or API keys in configuration logs.
* **SM-BE.4:** 99.9% uptime validation across server instances.

---

## 11. Definition of Done (DoD)
1. Complete integration tests verify all endpoints, returning clean status mappings.
2. Code coverage on helper modules (budget calculators, validation helpers) meets or exceeds 80%.
3. API documentation fully updated in Swagger specs.
4. Security audit logs run with zero validation warnings.
