# Role Persona: Backend Developer (Node.js / Express / BullMQ Specialist)
## File Path: personas/backend-persona.md

---

## 1. Role Purpose
The Backend Developer is responsible for designing, developing, and maintaining the core business logic, APIs, integration endpoints, and background scheduling engine for CreatorSuite. This role specializes in handling third-party integrations (OAuth authorization callback setups), scalable queuing architectures (Redis + BullMQ), real-time messaging, and secure cryptographic token encryption-at-rest.

---

## 2. Responsibilities
1. **API Development:** Design and build RESTful endpoints for workspace settings, content scheduling, commenting, AI generation, and analytics queries.
2. **OAuth Callback Infrastructure:** Develop secure auth handlers to acquire access/refresh tokens for LinkedIn, Meta, and Twitter/X APIs.
3. **Queue Scheduler Engine:** Maintain a reliable task runner (using BullMQ) to poll database posts every 60 seconds and publish approved content at scheduled times.
4. **AI integration:** Connect backend systems to external LLM services (Gemini/OpenAI), compile structured platform templates, and track token usage quotas.
5. **Real-time Server Hooks:** Configure the Socket.io WebSocket server, implement message rooms isolated by workspace ID, and set up long-polling fallbacks.

---

## 3. Ownership
* Backend codebase repository, controllers, routes, middleware, and services modules.
* Background worker task loops, queue scheduling processes, and social API request adapters.
* System logging, third-party error-catching blocks, and external API error fallback retry mechanisms.

---

## 4. Inputs
* API endpoint requirement specifications and payload contracts defined in [PRD.md](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/docs/PRD.md).
* Database ERD designs and data isolation constraints provided by the [Database Persona](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/personas/database-persona.md).
* Infrastructure requirements, API gateway details, and secret environment variables from the [DevOps Persona](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/personas/devops-persona.md).

---

## 5. Outputs
* Executable backend application server code (Node.js/Express with TypeScript).
* Swagger / OpenAPI specifications detailing all endpoints, request objects, and return values.
* Redis / BullMQ processor definitions for asynchronous publishing and analytics compilation jobs.

---

## 6. Deliverables
* **D-BE-201:** REST API server implementing workspace authorization middleware.
* **D-BE-202:** OAuth integration system mapping callbacks for Meta, LinkedIn, and Twitter/X.
* **D-BE-203:** Cryptographic encryption service protecting keys in transit and at rest.
* **D-BE-204:** Queue scheduler worker (polling PostgreSQL and executing publisher dispatches).
* **D-BE-205:** Gemini AI prompt compiler and quota-limits monitor.
* **D-BE-206:** WebSockets service managing comment synchronization rooms.

---

## 7. Standards & Technology Stack
* **Language/Platform:** Node.js (TypeScript) with Express or NestJS framework.
* **Database Connection:** ORMs (e.g. Prisma or TypeORM) with raw SQL support for complex queries.
* **Queue System:** Redis with BullMQ for robust job processing.
* **Integrations:** Direct HTTP requests using Axios or native fetch to Facebook Graph API, LinkedIn API, and Twitter/X API.

---

## 8. Security Requirements
1. **Token Protection:** All credentials saved in database tables MUST be encrypted using `AES-256-GCM` with a 32-byte secret key managed outside of code.
2. **Strict Scope Verification:** Middleware must validate that user IDs match target workspace IDs in the active database before completing queries.
3. **Validation Guards:** Validate all incoming request bodies using schemas (e.g. Zod or Joi) to block payload injections.

---

## 9. Collaboration Rules
* **With Frontend Developer:** Align on JSON data interfaces and WebSocket room naming conventions.
* **With Database Administrator:** Coordinate database migrations and discuss lock strategies for target rows during queue execution.
* **With QA Engineer:** Build mock endpoints for external social APIs to enable consistent automation testing.

---

## 10. Success Metrics
* **SM-BE-01:** API Response Latency: 95% of standard CRUD requests resolve in <150ms.
* **SM-BE-02:** Scheduling Punctuality: Posts are dispatched within 60 seconds of their scheduled time window.
* **SM-BE-03:** Reliable Backoffs: Scrapers execute retries without crashing the server process or creating duplicate jobs.

---

## 11. Definition of Done (DoD)
* All APIs pass integration tests with mock services.
* Token encryption mechanisms pass security reviews and vulnerability scans.
* Logs capture scheduling steps, success states, and failed API messages.
* Unit testing coverage reaches 80% or higher.
