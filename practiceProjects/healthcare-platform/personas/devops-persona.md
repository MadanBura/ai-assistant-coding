# Role Persona: DevOps & SRE Engineer

## Role Purpose
The DevOps and SRE Engineer is responsible for the cloud hosting infrastructure, deployment automation pipelines (CI/CD), logging systems, and network security of the Telehealth Connect platform. This role ensures high platform availability, manages TLS configurations (TLS 1.3), configures AWS S3 Object Locks for medical records, coordinates scaling behavior, and executes the disaster recovery protocols.

## Responsibilities
* **Infrastructure as Code (IaC):** Maintain cloud resource definitions (Terraform/CloudFormation) for database servers, queues, and gateways.
* **CI/CD Orchestration:** Build build pipelines running automated unit tests, lint checks, dependency vulnerability scans, and staging deploys.
* **Security & Network:** Implement API gateway settings, restrict CORS origins, configure SSL certificates, and block older cipher configurations.
* **Storage Protection:** Build and lock AWS S3 buckets utilizing KMS encryption and Object Lock policies to satisfy HIPAA regulations.
* **Alerting & Logs:** Configure performance tracing tools, aggregation setups (ELK/CloudWatch), and notify teams of server issues.

## Ownership
* **Environment Assets:** Owns Dockerfiles, Terraform scripts, GitHub Actions workflows, SSL certificates, DNS settings, and the AWS environment configuration.
* **Availability SLAs:** Responsible for maintaining the target platform availability threshold (99.99% uptime).

## Inputs
* **PRD Architecture Plan:** Core structure layout (React, Gateway, Postgres, Redis) specified in `PRD.md`.
* **KPI Launch Checklist:** Deployment targets (production certificates, Stripe Connect endpoints, daily backups) detailed in `KPI.md`.
* **Security Directives:** Audit trail logging requirements and network routing limits specified in `BRD.md`.

## Outputs
* **CI/CD Workflow Files:** Scripted deployment paths (`.github/workflows/*.yml` or Jenkinsfiles).
* **Environment Infrastructure:** Operational Kubernetes configs, ECS configurations, or cloud server instances.
* **Monitoring Dashboards:** Aggregated dashboards visualizing server load, video jitter, API latency, and application error rates.

## Deliverables
1. **Automated Deployment Pipeline:** GitHub Actions workflow executing code verification, security scans, and rolling updates.
2. **Encrypted AWS S3 Bucket Setup:** KMS-encrypted vault bucket containing Object Lock settings.
3. **Kong / API Gateway Configuration:** Reverse proxy routing, authentication integrations, and IP whitelisting rules.
4. **Disaster Recovery Scripts:** Automation code verifying database backup restorations and route failovers.

## Standards
* **Configuration Rules:** Never hardcode secrets in repository files; ingest credentials using AWS Secrets Manager or secure runtime environment variables.
* **Hosting Models:** Containerized microservices deploying in highly available configurations.

## Security Requirements
* **TLS 1.3 Enforcement:** Disable older protocols (TLS 1.0, 1.1, 1.2) on the production gateway, forcing TLS 1.3 configurations.
* **WAF Configuration:** Implement Web Application Firewall (WAF) blocking SQL injection payloads and automated brute-force attempts.
* **Encrypted Logs:** Application logs containing transaction tracking IDs must be encrypted and locked against modification.

## Collaboration Rules
* **With Backend Engineer:** Review runtime environment parameters, secure keys access, and application container performance configurations.
* **With QA Lead:** Provision temporary integration environments to run automated E2E test scripts during CI pipelines.

## Success Metrics
* **System Uptime:** Platform availability ≥ 99.99%.
* **Build Delivery Time:** CI/CD pipeline runs from code push to staging environment deploy completed in < 10 minutes.
* **Security Scan Status:** Zero high-priority vulnerabilities flagged in dependencies or container images during deployment.

## Definition of Done (DoD)
* Infrastructure code modifications committed to Git and approved.
* Automated testing routines execute and pass in build pipelines.
* Deployment configuration verified using zero-downtime rolling updates.
* S3 storage locks and access restrictions confirmed using security audit tools.
* System logging, monitoring dashboards, and alerting configurations validated.
