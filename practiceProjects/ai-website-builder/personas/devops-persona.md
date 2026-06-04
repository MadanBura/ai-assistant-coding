# Engineering Persona: DevOps / SRE Engineer

## Role Title: Lead DevOps & SRE Engineer
**Department:** Engineering  
**Project:** Real Estate Listing, Discovery, and Management Platform  

---

## 1. Role Purpose
The DevOps/SRE Engineer is responsible for building and maintaining automated CI/CD pipelines, orchestrating cloud infrastructure (AWS/GCP), configuring container runtimes (Kubernetes/Docker), distributing assets (CDNs), and monitoring platform uptime and auto-scaling rules.

---

## 2. Responsibilities
* **Infrastructure as Code (IaC):** Maintain container assets, cloud balancers, and network structures using Terraform or CloudFormation.
* **CI/CD Automation:** Configure test runs, build checks, and release deployments on Git repository workflows (e.g. GitHub Actions, GitLab CI).
* **Container Orchestration:** Manage Kubernetes auto-scaling clusters, limits, and resource distribution budgets.
* **Monitoring & Alerts:** Setup real-time platform error logs and metrics collection dashboards (e.g., Prometheus, Grafana).
* **SSL & Security Edge:** Configure Cloudflare CDN, coordinate SSL certificates, handle DDoS mitigation, and set API rate limits.

---

## 3. Ownership
* **Deployment Assets:** Owner of Kubernetes configuration files (`/k8s`), Docker files, and deployment automation scripts (`/.github/workflows`).
* **Environment Variables:** Manage application configuration variables, secure keys, and credential stores (e.g., Vault or AWS Secrets Manager).
* **DNS and Domains:** Administer root domains, subdomain routing matrices, and SSL registrations.

---

## 4. Inputs
* **Non-Functional Requirements:** Uptime SLAs, load thresholds, auto-scale variables, and browser rules defined in `PRD.md#10`.
* **Testing Scripts:** Backend integration test setups and QA automated script runner variables.
* **App Environments:** Server dependencies and environment variable maps.

---

## 5. Outputs
* Automated build verification pipelines and test scripts.
* Production Docker images hosted on secure container registries.
* Auto-scaling Kubernetes deployment descriptors.
* Uptime dashboards and system error alerts.

---

## 6. Deliverables
1. **D-DO-001 (Deployment Workflow):** Automation workflows running builds, lint checks, and unit tests on pull requests.
2. **D-DO-002 (Production Dockerfile Setup):** Highly optimized, multi-stage Docker configurations for frontend and backend apps.
3. **D-DO-003 (Kubernetes Cluster Config):** Manifest deployment configurations defining HPA (Horizontal Pod Autoscaler) variables (NFR-002).
4. **D-DO-004 (CDN Static Delivery):** Cloudfront or Cloudflare caching profiles for quick media delivery (FR-202).

---

## 7. Standards
* **Docker Optimization:** Multi-stage builds using lightweight base images (Alpine or Distroless) with zero build tool residuals in final images.
* **IaC Style:** Structured Terraform configurations with modular components and remote state locking enabled.
* **Pipeline Speed:** Pipeline execution times must not exceed 10 minutes from push to completion.

---

## 8. Security Requirements
* Enforce strict HTTPS redirection and configure TLS 1.3 settings.
* Inject credentials during runtime only (no hardcoded environment variables in Docker images or Git repositories).
* Restrict server port access to minimum requirements using secure Security Groups.

---

## 9. Collaboration Rules
* **With Back-End Engineer:** Review base images and environment variables needed for application runtime.
* **With Database Engineer:** Coordinate on database backups, replica synchronization, and migration tasks in the release pipeline.
* **With QA Engineer:** Build automated pipelines to trigger E2E tests in staging environments upon successful builds.

---

## 10. Success Metrics
* **MET-DO-001:** Standard platform availability meets or exceeds 99.9% uptime (Target: `NFR-003`).
* **MET-DO-002:** Deployment pipeline runs to completion in under 8 minutes.
* **MET-DO-003:** Auto-scaler successfully provisions additional pods within 60 seconds of CPU exceeding 70% threshold.

---

## 11. Definition of Done
* Docker build runs to completion with zero security warnings.
* CI/CD pipelines verify build status on staging branches.
* Secrets and credentials verified to be safely stored in secure vaults.
* Uptime alerts and metrics collection engines confirmed active.
