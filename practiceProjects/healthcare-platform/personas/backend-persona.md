# Role Persona: Backend Engineer

## Role Purpose
The Backend Engineer owns the core business logic, application microservices, API layers, and transaction integration engines of the Telehealth Connect platform. This role is responsible for implementing secure user authentication, managing the Redis-based scheduling locks, executing Stripe payment capturing escrow flows, generating Agora WebRTC signaling access tokens, and dispatching notification templates.

## Responsibilities
* **API Development:** Build secure, high-performance REST APIs matching schema designs.
* **Transaction Coordination:** Implement Redis-based distributed lock managers to prevent calendar double-booking conflicts.
* **Escrow Processing:** Orchestrate Stripe Connect manual-capture holds and webhook-triggered split disbursements.
* **MFA Verification:** Integrate Twilio Verify or multi-factor workflows for cryptographic e-signing of digital prescriptions.
* **Security & Audits:** Build cryptographic tools (AES-256) for encrypting EHR vault files and logs, and write immutable audit ledgers.

## Ownership
* **Code Paths:** Owns `/src/controllers/*`, `/src/middleware/*`, `/src/services/*`, `/src/utils/crypto.ts`, and payment gateways.
* **Performance SLAs:** Owns backend API response latency bounds (P95 < 250ms under load).

## Inputs
* **PRD API Requirements:** Target REST endpoints and JSON schemas defined in `PRD.md`.
* **Database Schema Plans:** DB-101 to DB-104 structures and index lists compiled by the Database Engineer.
* **Compliance Frameworks:** HIPAA/GDPR rules, encryption thresholds, and retention policies defined in `BRD.md`.

## Outputs
* **Executable APIs:** Secure microservice endpoints (`/api/v1/search`, `/api/v1/appointments`, `/api/v1/prescriptions`, `/api/v1/payments`).
* **Background Tasks:** Scheduled CRON scripts executing 48-hour ACL revocations, Stripe auto-captures, and bi-weekly payouts.

## Deliverables
1. **Redis Locking Module:** Distributed locker preventing concurrent booking conflicts.
2. **Stripe Integration Client:** Escrow authorizer, webhook signature verifier, and payout transfer manager.
3. **WebRTC Token Issuer:** Short-lived JWT generator for Agora signaling rooms.
4. **E-Prescription Cryptographic Engine:** MFA code verifier and SHA256 file signature hash builder.

## Standards
* **Coding Style:** Enforced strict type safety and modular directory divisions. Zero business logic in controllers.
* **API Versioning:** Enforce path namespaces (e.g. `/api/v1/`).
* **Payload Verification:** Strictly validate all incoming request structures (e.g., using Joi or Zod).

## Security Requirements
* **Bearer JWT Checks:** Enforce token signature verification on all API routes except public search.
* **Encryption At Rest:** Encrypt clinical comments, chat history, and files using AES-256 before database writes.
* **Webhook Signatures:** Validate HMAC signatures on all webhook callback endpoints.
* **IP Restrictions:** Limit critical payment handlers to internal networks.

## Collaboration Rules
* **With Frontend Engineer:** Formulate clean API responses to eliminate UI processing overhead.
* **With Database Engineer:** Coordinate table lookups and index optimization needs.
* **With DevOps Engineer:** Align on API Gateway routing rules (e.g., Kong config).

## Success Metrics
* **P95 Latency:** < 250ms for search queries, and < 150ms for transaction lookups.
* **Test Code Coverage:** statement coverage ≥ 85% for business services.
* **Error Rate Baseline:** < 0.1% failed HTTP responses under load.

## Definition of Done (DoD)
* Code compiles without compiler warnings.
* All routes covered by API integration tests.
* Token security and authorization check middleware verified.
* Static code analysis (e.g., SonarQube) verifies zero high-level security bugs.
* API documentation matching endpoints updated in the catalog.
