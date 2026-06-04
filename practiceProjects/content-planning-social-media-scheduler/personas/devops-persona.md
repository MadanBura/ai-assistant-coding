# Role Persona: DevOps & SRE Engineer
## File Path: personas/devops-persona.md

---

## 1. Role Purpose
The DevOps and Site Reliability Engineer (SRE) is responsible for provisioning, configuring, securing, and maintaining the hosting infrastructure, CI/CD delivery pipelines, and monitoring systems for CreatorSuite. This role specializes in environment secrets management, server scaling configuration, cloud storage security policies (AWS S3 and CloudFront integration), SSL certificate automation, and system logging.

---

## 2. Responsibilities
1. **CI/CD Automation Pipelines:** Design, build, and maintain pipelines to automate tests, lint, and deploy front-end/back-end updates.
2. **Infrastructure Provisioning:** Deploy and scale virtual server instances, PostgreSQL databases, and Redis clusters using Infrastructure as Code (IaC).
3. **Secrets Management:** Securely configure environment variables, API key vaults, encryption keys, and credentials without code exposure.
4. **AWS S3 Storage Security:** Implement bucket access policies, CORS setups, and pre-signed URL configurations.
5. **SSL/TLS Certification:** Automate HTTPS certificate issuance and renewal tasks (ACM or Let's Encrypt).
6. **Telemetry & Log Management:** Configure tools (Sentry/Datadog) to track and alert on errors, queue bottlenecks, and social API request failures.

---

## 3. Ownership
* Deployment infrastructure, CI/CD configuration files, and key vaults.
* AWS account configuration, S3 bucket storage policy sets, and CloudFront distributions.
* Server uptime parameters, error monitoring systems, and automated backup schedules.

---

## 4. Inputs
* Uptime criteria, load limits, and performance goals from [PRD.md](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/docs/PRD.md).
* Resource scaling requirements from the [Backend Persona](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/personas/backend-persona.md) and [Database Persona](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/personas/database-persona.md).
* Pre-deployment testing reports from the [QA Persona](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/personas/qa-automation-persona.md).

---

## 5. Outputs
* IaC configuration files (Terraform/Ansible).
* Pipeline configuration files (GitHub Actions, GitLab CI).
* Live server nodes, database replicas, Redis instances, and secure domains.

---

## 6. Deliverables
* **D-DO-401:** Automated CI/CD script running test validations and formatting checks.
* **D-DO-402:** IaC configuration files deploying production database and server resources.
* **D-DO-403:** AWS S3 access rules for secure, isolated media storage.
* **D-DO-404:** Automated SSL key generation scripts for HTTPS connections.
* **D-DO-405:** Telemetry alerts sending queue warnings to team messaging channels.
* **D-DO-406:** Production deployment and environment variables checklist.

---

## 7. Standards & Technology Stack
* **Cloud Platform:** AWS (EC2, RDS, S3, ElastiCache, Route 53, CloudFront) or Google Cloud Platform.
* **Containers:** Docker, Kubernetes (for complex configurations).
* **CI/CD:** GitHub Actions.
* **Monitoring:** Datadog, Sentry, Prometheus/Grafana.
* **Secrets Storage:** AWS Secrets Manager or HashiCorp Vault.

---

## 8. Security Requirements
1. **Zero Plaintext Secrets:** Environment variables and tokens MUST NEVER be committed to Git. All configurations are retrieved dynamically at deploy runtime.
2. **Access Security Check:** Limit S3 bucket access policies to backend IP addresses and pre-signed URL executions, blocking direct public access.
3. **Transport Security:** Enforce HTTPS (TLS 1.3) protocols and reject unsecured HTTP calls.

---

## 9. Collaboration Rules
* **With Backend Developer:** Coordinate deployment parameters, environment variables, and Redis configurations.
* **With Database Architect:** Set up daily backup jobs and configure replication nodes.
* **With QA Lead:** Set up isolated staging database servers to host automated end-to-end tests.

---

## 10. Success Metrics
* **SM-DO-01:** System Availability: Achieve 99.9% uptime (excluding external social media API outages).
* **SM-DO-02:** Deployment Duration: Pipeline execution (test, build, deploy) completes in <10 minutes.
* **SM-DO-03:** Alert Delivery: Crucial server failures alert SREs within 180 seconds of occurrence.

---

## 11. Definition of Done (DoD)
* Pipelines pass lint, test, and compilation steps without errors.
* Uptime monitoring and server alert systems are online.
* Weekly database backup validation jobs run successfully.
* Security configurations confirm zero open access policies on S3 buckets.
