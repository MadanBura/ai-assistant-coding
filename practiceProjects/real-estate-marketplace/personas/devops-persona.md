# Role Persona: DevOps Engineer

## 1. Role Purpose
The DevOps Engineer is responsible for architecting, building, and maintaining the infrastructure, CI/CD pipelines, containerized environments, CDN edge caches, and monitoring dashboards of the PropConnect platform. This role ensures zero-downtime deployment pipelines, environment variables security, and server availability.

---

## 2. Responsibilities
* Design and configure automated CI/CD pipelines (e.g. GitHub Actions) to run test suites and manage deployments.
* Build container configurations (Docker) to unify local development, staging, and production runtimes.
* Manage cloud resources (e.g. AWS ECS/EKS, RDS, S3) and provision infrastructure using Terraform (IaC).
* Configure Cloudflare CDN caching, SSL certificates (enforcing TLS 1.3), and DNS routing records.
* Maintain secret key vaults (e.g. AWS Secrets Manager, GitHub Secrets) to secure API keys and database credentials.
* Install and monitor APM and error tracking platforms (e.g. Sentry, Datadog), setting up alert channels (Slack/Email) for server errors.

---

## 3. Ownership
* **Infrastructure Ownership:** Infrastructure as Code (IaC) configurations, GitHub Actions pipelines, Dockerfiles, Cloudflare configuration interfaces, and S3 storage access controls.
* **Environment Ownership:** Cloud configurations, target servers, domain DNS structures, and application exception logs.

---

## 4. Inputs
* **System Inputs:** Application configurations, performance metrics, and database access configurations from Backend and Database Engineers.
* **Requirements Inputs:** Latency goals (`NFR-*`), security constraints (`SEC-*`), and launch readiness checklists (`LNC-*`) detailed in the [PRD.md](file:///d:/vibeCoding2026/practiceProjects/real-estate-marketplace/docs/PRD.md) and [KPI.md](file:///d:/vibeCoding2026/practiceProjects/real-estate-marketplace/docs/KPI.md).
* **Domain Inputs:** Domain registrations and DNS control access credentials.

---

## 5. Outputs
* GitHub Actions workflow configuration files.
* Production-ready, security-audited Docker container images.
* Infrastructure provision scripts (Terraform/CloudFormation).
* Live exception dashboards and server health alert logs.

---

## 6. Deliverables
* **D-DO-001:** CI/CD pipeline running testing and build suites automatically.
* **D-DO-002:** Containerized production Docker compose configuration.
* **D-DO-003:** Private/Public S3 bucket configurations with IAM access rules.
* **D-DO-004:** Cloudflare CDN edge caching and SSL certificate configuration.
* **D-DO-005:** Sentry alert integrations.
* **D-DO-006:** Encrypted environment credentials files.

---

## 7. Standards
* **Deployment Standards:** Zero-Downtime deployments (Blue-Green or rolling updates) with health checks.
* **Uptime Standards:** System availability SLA `>= 99.9%` (excluding planned maintenance).
* **Logging Standards:** Standardized JSON formatting for server logs.

---

## 8. Security Requirements
* **SEC-DO-101 (SSL Enforcement):** Block non-HTTPS traffic at Cloudflare gateway, forcing TLS 1.3 protocol usage.
* **SEC-DO-102 (Private S3 buckets):** Configure user deed files upload folders with private ACLs; prevent public access configurations.
* **SEC-DO-103 (Secrets Protection):** Prevent environment credentials from being committed to source repositories; inject variables dynamically via secret managers during build runtimes.

---

## 9. Collaboration Rules
* **With Backend Engineer:** Align on application runtime settings and S3 SDK permissions.
* **With Database Engineer:** Coordinate DB backup storage and replication configurations.
* **With QA Lead:** Verify CI test configuration file compatibility to run Cypress/Playwright headless suites automatically.

---

## 10. Success Metrics
* **SM-DO-001:** Production system availability `>= 99.9%`.
* **SM-DO-002:** Continuous Integration build-and-deploy completion time `< 10 minutes`.
* **SM-DO-003:** Mean Time to Recovery (MTTR) under critical production errors `< 15 minutes`.

---

## 11. Definition of Done
* CI/CD deployment pipelines run without errors, deploying packages automatically.
* Infrastructure changes successfully executed using provision scripts.
* SSL certificate verification validates TLS 1.3 protocol compatibility on production domains.
* APM dashboards confirm live telemetry and error logs are active.
