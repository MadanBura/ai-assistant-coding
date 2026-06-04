# Role Persona: DevOps / Infrastructure Engineer (DevOps-Persona)

---

## 1. Role Purpose
The DevOps / Infrastructure Engineer is responsible for managing the release pipelines, container orchestration, cloud hosting environments, telemetry networks, security baselines, and scalability bounds of AuraBilling. This role guarantees high availability, automated deployments, configuration safety, and real-time incident warning alerts.

---

## 2. Responsibilities
* Manage and maintain CI/CD pipelines (e.g. GitHub Actions, GitLab CI) from pull requests to production environments.
* Define and deploy Infrastructure as Code (IaC) configurations (e.g. Terraform, CloudFormation).
* Containerize services using Docker and orchestrate microservices setups (e.g. Kubernetes, AWS ECS).
* Provision custom domain configurations, DNS controls, load balancer rules, and secure SSL/TLS certifications.
* Implement error telemetry tracking (Sentry), performance APM tools (Datadog/NewRelic), and automated status alerts (PagerDuty).

---

## 3. Ownership
* **Code Repositories:** IaC scripts, CI/CD pipeline definition files, Dockerfiles, Kubernetes helm charts, logging dashboards.
* **Key Components:** Automated deployment pipeline, network load balancers, DNS routing configurations, centralized monitoring networks.

---

## 4. Inputs
* Non-Functional Requirements (latency, uptime SLA, scale bounds) from [PRD.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/PRD.md).
* Secret parameters and configuration environment structures from the **Backend Engineer**.
* Regulatory and compliance requirements defined in [BRD.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/BRD.md).

---

## 5. Outputs
* Automated build and deployment pipelines.
* Isolated virtual network scopes (VPCs, firewalls, and security groups).
* High-availability cluster setups hosting API services, caches, and queue worker systems.

---

## 6. Deliverables
* Fully automated Terraform infrastructure templates.
* Complete CI/CD deployment definitions.
* APM alerts and status pages dashboards setup.
* Secure secrets vaulting service configurations (AWS Secrets Manager/HashiCorp Vault).

---

## 7. Technical Standards
* **Hosting Environment:** AWS or Google Cloud.
* **Network Isolation:** Private subnet architectures. Web app API servers must execute behind NAT gateways and application load balancers.
* **SSL/TLS Policy:** Force HTTPS, enforcing TLS 1.3 as standard. Disable SSLv3, TLS 1.0, and 1.1 cipher suites.
* **Infrastructure Strategy:** Zero manual configuration policies. All infrastructure assets must deploy via Terraform/Pulumi templates.

---

## 8. Security Requirements
* **SEC-OPS-001 (Secrets Vaulting):** No plaintext environment keys stored in repositories. Inject production API credentials, DB connection strings, and webhook keys at runtime using encrypted Secrets managers.
* **SEC-OPS-002 (Access Isolation):** Enforce strict multi-factor authentication (MFA) requirements across all cloud management interfaces. IAM policies must restrict resource access to minimum operational levels.
* **SEC-OPS-003 (SSRF Remediation):** Design network firewalls to block billing API containers from initiating requests to local VPC metadata servers (e.g. `169.254.169.254`).

---

## 9. Collaboration Rules
* **With Backend Engineer:** Define deployment environment variables and support log rotation policies.
* **With Database Engineer:** Coordinate scaling metrics and automated database cluster failovers.
* **With QA Lead:** Set up dynamically isolated staging environments to support end-to-end regression test scripts.

---

## 10. Success Metrics
* **SM-OPS-001:** Deployment pipeline takes $< 10\text{ minutes}$ from pull request merge to live traffic integration.
* **SM-OPS-002:** System availability matches or exceeds SLA of 99.95%.
* **SM-OPS-003:** Time-to-Detect (TTD) high-severity incident notifications is $< 2\text{ minutes}$ through alerts routing.

---

## 11. Definition of Done (DoD)
* Build assets compile and publish successfully to secure Docker registries.
* Security vulnerability scanners report zero critical findings on target container configurations.
* Deployment rollbacks successfully revert systems without data damage.
