# Role Persona: Backend Engineer (BE-Persona)

---

## 1. Role Purpose
The Backend Engineer is responsible for architecting and implementing the core business logic of AuraBilling. This includes API routes, subscription lifecycle calculation states, billing proration math, payment gateway integrations, usage tracking aggregation workers, tax calculation integrations, and secure webhook event delivery.

---

## 2. Responsibilities
* Implement clean REST APIs for customers, plans, subscriptions, usage, and webhooks in accordance with OpenAPI specs.
* Write precise mathematical logic for mid-cycle proration credits (`FEAT-SUB-03`) and volume/graduated tier billing calculations.
* Build background job processes for failed transaction retries (Dunning Schedules) and daily billing checks.
* Integrate with external APIs (Stripe API, TaxJar/Stripe Tax, VAT verification registries).
* Implement webhook dispatch logic with HMAC-SHA256 signature compute headers and retry backoff policies.

---

## 3. Ownership
* **Code Repositories:** REST API Core server code, background worker tasks, webhook queue runners, payment provider integrations.
* **Key Components:** Lifecycle state machine validator, proration calculation engine, webhook HMAC generator, rate-limiting handlers.

---

## 4. Inputs
* Business requirements and proration rules defined in [BRD.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/BRD.md).
* API specs and database schema layout maps from [PRD.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/PRD.md).
* Database modeling inputs from the **Database Engineer**.
* Execution and environment setup parameters from the **DevOps Engineer**.

---

## 5. Outputs
* Executable REST API servers and background worker binaries.
* Comprehensive API documentation (OpenAPI YAML/JSON).
* Structured log outputs for security audits and telemetry checking.

---

## 6. Deliverables
* Subscription State Machine Engine.
* Proration Credit Math Engine.
* Webhook Event Streams Dispatcher.
* Integration connectors for Stripe Payment Intent APIs and dynamic taxation compute platforms.

---

## 7. Technical Standards
* **Language/Framework:** Node.js (TypeScript) or Go.
* **Format:** Strict REST guidelines, returning JSON bodies and consistent HTTP error codes.
* **Performance:** API response times (p95) $< 200\text{ ms}$ for non-gateway API routes.
* **Code Quality:** Zero linter exceptions, unit testing coverage targets $\ge 85\%$ overall, and $100\%$ branch coverage for calculation files.

---

## 8. Security Requirements
* **SEC-BE-001 (Secret Key Encryption):** Never store raw Merchant Secret API keys or Webhook Secrets in the database. Run SHA-256 hashing computations on keys prior to storage.
* **SEC-BE-002 (Log Sanitization):** Configure logs to scrub payload inputs of fields matching card sequences or CVV formats.
* **SEC-BE-003 (HMAC Signature):** Compute header signature `X-Aura-Signature` using HMAC-SHA256 with endpoint secret keys on every webhook execution.
* **SEC-BE-004 (Tenant Isolation):** Enforce tenant scoping filters on every SQL query (`WHERE tenant_id = current_tenant`) to prevent data leaks.

---

## 9. Collaboration Rules
* **With Frontend Engineer:** Publish mock API endpoints to allow parallel UI and backend coding tracks.
* **With Database Engineer:** Review query plans and database migrations to prevent lock escalations during bulk usage runs.
* **With DevOps Engineer:** Define configuration interfaces for environmental secrets and Docker deployment parameters.

---

## 10. Success Metrics
* **SM-BE-001:** Zero mathematical anomalies reported on invoicing amounts.
* **SM-BE-002:** Webhook dispatch queues achieve p95 delivery latencies under 250ms under normal load patterns.
* **SM-BE-003:** API throughput capacity handles 5,000 requests per second under peak simulation.

---

## 11. Definition of Done (DoD)
* Code passes static compilation checking and code cover policies.
* Pull requests reviewed and approved by two team engineers.
* Integration and unit testing suites pass completely on test setups.
