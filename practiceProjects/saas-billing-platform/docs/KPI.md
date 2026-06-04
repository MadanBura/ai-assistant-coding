# Key Performance Indicators & Project Completion Criteria (KPI.md)
## Project: SaaS Billing Platform (AuraBilling)

---

### 1. Document Control & Metadata
* **Document Version:** 1.0.0
* **Date:** 2026-06-04
* **Author:** QA Lead & solution Architect
* **Status:** Initial Draft

---

### 2. Definition of Done (DoD)
To mark AuraBilling as fully complete and deployable to production, the project team must verify the following items:
* [ ] **Code Quality:** Code passes all static analysis and linter checks (`eslint`, `golangci-lint`, etc.) with zero warnings.
* [ ] **Test Coverage:** Direct unit testing coverage must be $\ge 85\%$ overall, and critical payment components must have $100\%$ branch coverage.
* [ ] **Reviews:** All pull requests are reviewed and approved by at least two senior engineers, including one security specialist.
* [ ] **Documentation:** Setup, installation instructions, user manuals, and API endpoints are documented, updated, and validated against the working build.
* [ ] **Security Checks:** Dynamic Application Security Testing (DAST) and Static Application Security Testing (SAST) show zero critical or high-risk findings.
* [ ] **Staging Execution:** End-to-end user flows (signup, billing, portal download, usage upload, webhook delivery) are verified in a staging environment.

---

### 3. Feature Acceptance Criteria Checklist

This checklist corresponds to the core user stories in the [PRD.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/PRD.md).

| KPI ID | Feature Reference | Acceptance Criterion Description | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AC-VER-SUB-01** | `FEAT-SUB-01` (Plan Builder) | Create monthly and yearly plans with flat-rate prices and tier definitions via the dashboard interface. | Create a plan named "Gold Standard" with 3 tiers: ($10 for 1-100, $8 for 101-500, $5 for 501+). Verify parameters in the Database table `PLAN`. | [ ] |
| **AC-VER-SUB-02** | `FEAT-SUB-03` (Proration Engine) | Calculate exact proration credits for upgrade/downgrade of plans mid-billing cycle according to `RULE-001`. | Upgrade a user from $100/mo to $300/mo exactly 15 days into a 30-day month. Confirm the next invoice includes a credit of $50 and a charge of $150, resulting in a net due of $100. | [ ] |
| **AC-VER-PAY-01** | `FEAT-PAY-01` (Vaulting) | Store credit card payment tokens without exposing raw data to backend logs or DB. | Check databases and Application Performance Monitoring (APM) logs during a test checkout. Confirm zero occurrences of 15/16 digit card sequences. | [ ] |
| **AC-VER-PAY-02** | `FEAT-PAY-02` (Dunning) | Auto-trigger emails and retries on failed payments at intervals: 1, 3, 7, 14 days. | Inject a card decline simulation. Verify that cron queues set retry triggers at exactly +24h, +72h, +168h, and +336h. Check email queue outputs. | [ ] |
| **AC-VER-INV-01** | `FEAT-INV-01` (Invoicing) | Create a valid PDF invoice upon charge success and upload to S3. | Initiate a subscription payment. Verify S3 bucket contains a PDF file matching the invoice ID, containing the breakdown of costs, subtotal, and tax. | [ ] |
| **AC-VER-INV-02** | `FEAT-INV-02` (Taxation) | Compute and add tax dynamically to invoices depending on region addresses. | Create standard checkouts for: (a) US zip code, (b) EU customer with tax ID, (c) EU customer without tax ID. Verify calculations reflect tax jurisdiction rules. | [ ] |
| **AC-VER-PORT-01** | `FEAT-PORT-01` (Magic Link) | Authenticate user into customer billing portal without a password via magic link. | Trigger Magic Link API. Verify the token resolves to a valid user session, expires in exactly 15 minutes, and is invalid upon reuse. | [ ] |

---

### 4. Functional Requirements Checklist

This checklist corresponds to the functional requirements defined in the [PRD.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/PRD.md).

| KPI ID | Requirement ID | Target Verification Check | Test Command / Script / Action | Status |
| :--- | :--- | :--- | :--- | :--- |
| **FC-CHK-001** | `FR-001` | Subscription duration and calendar intervals (leap year, custom lengths). | Run test suite `npm run test:billing-cycles`. Verify 29th Feb renews correctly. | [ ] |
| **FC-CHK-002** | `FR-002` | Proration math matches rule boundaries under negative and positive shifts. | Execute automated test `npm run test:proration`. Confirm results match standard fixtures. | [ ] |
| **FC-CHK-003** | `FR-003` | Rejects transactions with expired card parameters. | Submit a card with expiration `02/2025` to the payment API; confirm response error `CARD_EXPIRED`. | [ ] |
| **FC-CHK-004** | `FR-004` | Dunning handles card expiration mid-retry path by aborting early. | Inject card expiration update mid-retry queue. Verify dunning transitions directly to failure. | [ ] |
| **FC-CHK-005** | `FR-005` | Tax calculations fall back gracefully on invalid zip code lookup. | Submit checkout with ZIP `00000` to Tax API. Ensure fallback code uses country standard rate. | [ ] |
| **FC-CHK-006** | `FR-006` | Financial reports deduct refund adjustments dynamically. | Issue refund on transaction. Verify analytics lines drop appropriately without retro-skewing past months. | [ ] |
| **FC-CHK-007** | `FR-007` | Ingestion API dedupes calls with identical idempotency headers. | Submit identical usage log payload 3 times with same `Idempotency-Key`. Verify count increments by 1. | [ ] |
| **FC-CHK-008** | `FR-008` | Dispatch webhooks and retry on failures using backoff schema. | Mock listener endpoint to return HTTP 503. Verify dispatch worker queues retries with delay. | [ ] |
| **FC-CHK-009** | `FR-009` | Order of operations for coupon code stacking (percent then flat discounts). | Create invoice with $100 base, apply 20% coupon and $10 flat coupon. Verify final balance = $70. | [ ] |
| **FC-CHK-010** | `FR-010` | Responsive layout execution for hosted portal views. | Run portal pages through Cypress testing with viewport widths: 375px (mobile), 768px, 1440px. | [ ] |

---

### 5. UI & Usability Checklist

Verify user interfaces are professional, premium, responsive, and accessible.

| KPI ID | Evaluation Area | Standard/Requirement | Validation Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **UI-001** | **Brand Styling Consistency** | Colors must conform to the defined theme (Deep Blue primary, Slate text, HSL tailored variables). No raw primary colors. | Visual comparison against design system mockups in Figma/Storybook. | [ ] |
| **UI-002** | **Responsive Adaptability** | No broken grid layouts, text overlaps, or horizontal scrolls on viewports down to 320px wide. | Automate chrome viewport checks. Manual testing on iOS (Safari) and Android (Chrome). | [ ] |
| **UI-003** | **Accessibility (a11y)** | Compliant with WCAG 2.1 AA guidelines. Color contrast ratio $\ge 4.5:1$ for normal text. | Run lighthouse a11y audits on dashboard and portal pages. Ensure score is $\ge 95$. | [ ] |
| **UI-004** | **Micro-animations** | Hover states on interactive elements must trigger transition animations (duration 150-250ms, ease-in-out). | Visual review of navigation elements, button clicks, and loading states. | [ ] |

---

### 6. Security Validation Checklist

Ensure the environment meets regulatory parameters.

| KPI ID | Requirement Reference | Security Audit Check | Validation Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-CHK-001** | `SEC-001` | PCI-DSS Scope minimization check. | Inspect server memory dumps and logs. Verify credit card numbers are not recorded. | [ ] |
| **SEC-CHK-002** | `SEC-002` | Cryptographic parameter verification. | Run SSL Labs test against endpoints. Verify TLS 1.3 only, weak cipher suites disabled. | [ ] |
| **SEC-CHK-003** | `SEC-003` | Webhook verification security. | Attempt to send webhook request with invalid `X-Aura-Signature`. Server must return 401. | [ ] |
| **SEC-CHK-004** | `SEC-004` | Rate limit mitigation. | Execute script sending 150 requests within 10 seconds to API. Verify 429 Too Many Requests response. | [ ] |

---

### 7. Performance & Scale Checklist

Ensure the product meets Non-Functional Requirements.

| KPI ID | Target Area | Requirement Metric | Validation Tool / Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **PERF-CHK-001**| API Latency | Average latency $< 150\text{ ms}$, p95 under $200\text{ ms}$ for standard endpoints. | Run `k6` script simulating 100 concurrent virtual users hitting API endpoints. | [ ] |
| **PERF-CHK-002**| Load Handling | Queue processing handles 5,000 requests per second under peak simulation. | Run performance test sending bulk usage data load. Verify no message drops. | [ ] |
| **PERF-CHK-003**| DB Scaling | Read queries on transaction logs must execute in $< 50\text{ ms}$ with 10M rows. | Generate mock database data of 10 million invoices. Run queries, inspect execution plans. | [ ] |

---

### 8. Testing Requirements

The following test suites must run successfully on release branches:
1. **Unit Testing:** Coverage checked via code coverage parser.
   * *Command:* `npm run test:unit -- --coverage` or `go test -cover`
2. **Integration Testing:** Verification of database state transitions and api routes.
   * *Command:* `npm run test:integration`
3. **E2E Testing:** Hosted customer portal interactions and portal dashboard views.
   * *Command:* `npx cypress run` or `npx playwright test`
4. **Load Testing:** Performance validation under load.
   * *Command:* `k6 run load_test_script.js`
5. **Penetration Testing:** Vulnerability testing of APIs.
   * *Method:* Automated scanning using OWASP ZAP (Zed Attack Proxy).

---

### 9. Launch Readiness Checklist

| KPI ID | Launch Phase Area | Verification Step | Responsible Party | Status |
| :--- | :--- | :--- | :--- | :--- |
| **LNC-RDY-001**| Infrastructure Setup | SSL certificates generated, API custom domain routes mapped (`api.aurabilling.com`). | Platform DevOps Lead | [ ] |
| **LNC-RDY-002**| Backup & Restore Check | Verify daily DB snapshot backup configuration. Execute dry run database restore in staging. | Database Architect | [ ] |
| **LNC-RDY-003**| Secrets Rotation | Rotate default sandbox/staging credential keys. Populate production env files. | Security Lead | [ ] |
| **LNC-RDY-004**| Telemetry & Monitoring | Configure APM dashboards, error tracking (Sentry), and page downtime alerts. | Devops Engineer | [ ] |
| **LNC-RDY-005**| Support Playbook | Define SLA procedures, refund limits, API debugging protocols for customer agents. | Customer Support Director | [ ] |
