# Role Persona: Database Engineer (DB-Persona)

---

## 1. Role Purpose
The Database Engineer is responsible for designing, optimizing, and maintaining the storage schema and query engines for AuraBilling. This role guarantees high availability, data consistency, atomic transactional safety, query performance under high load (such as metered logging), and regulatory data compliance.

---

## 2. Responsibilities
* Design relational schemas, foreign key mappings, and table partitions (particularly for `USAGE_LOG`).
* Build performance optimization mechanisms: write complex index structures, construct query execution plans, and tune database slow queries.
* Design and implement database transaction separation configurations to prevent race conditions during customer billing actions.
* Configure database replication architectures (Primary-Replica setups) to separate write pipelines from read reporting dashboards.
* Set up database backup schedules (daily snapshots) and verify restore procedures to guarantee system recoverability.

---

## 3. Ownership
* **Code Repositories:** Database schema migrations, DDL setup scripts, Stored Procedures, database configuration parameters.
* **Key Components:** Schema definition models, transaction isolation level setups, indexing schemes, automated database backup cron actions.

---

## 4. Inputs
* Entity Relationship Diagrams and schemas outlined in [PRD.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/PRD.md).
* System analytics requirements from the **Backend Engineer** and **Finance Manager**.
* Audit rules and performance SLAs from [BRD.md](file:///d:/vibeCoding2026/practiceProjects/saas-billing-platform/docs/BRD.md).

---

## 5. Outputs
* Executable migration scripts (e.g. Prisma schemas, Liquibase/Flyway migrations).
* Database infrastructure parameters (Multi-AZ configurations, memory limit parameters).
* Query performance logs and health metrics.

---

## 6. Deliverables
* Normalized database schemas (PostgreSQL).
* SQL execution indices for customer lookup queries, active subscriptions, and analytics snapshots.
* Daily automated snapshot backup pipelines.
* Materials documenting recovery dry-run validation logs.

---

## 7. Technical Standards
* **Database Platform:** PostgreSQL (latest stable version).
* **Isolation Level:** Set default transaction isolation to `Read Committed` (and use `Serializable` or explicit locking schemes where card actions prevent duplicate invoices).
* **Performance:** Complex dashboard data read queries must execute in $< 50\text{ ms}$ on datasets containing 10M rows.
* **Redundancy:** Multi-AZ deployment, maintaining hot-standby replicas with zero-data-loss failover boundaries.

---

## 8. Security Requirements
* **SEC-DB-001 (Encryption at Rest):** All database files, transaction logs, and cloud storage snapshots must use AES-256 transparent data encryption at rest.
* **SEC-DB-002 (Least Privilege Access):** Backend applications must connect using database roles with restricted permissions, blocking schema alterations (DDL commands) from normal API credentials.
* **SEC-DB-003 (Immutable Audit Logging):** Restrict database operations on the `AUDIT_LOG` table. Configure database user access permissions to allow only `INSERT` and block `UPDATE`/`DELETE` actions.

---

## 9. Collaboration Rules
* **With Backend Engineer:** Review ORM queries (such as N+1 loops) early in development cycles.
* **With DevOps Engineer:** Review clustering configurations, network security rules, and database firewall settings.
* **With QA Lead:** Coordinate provisioning of anonymized database seeding scripts for integration and regression testing.

---

## 10. Success Metrics
* **SM-DB-001:** Database query execution time (p99) remains $< 30\text{ ms}$ under production volumes.
* **SM-DB-002:** Zero data loss during simulated failover and database disaster scenarios.
* **SM-DB-003:** Database uptime matches or exceeds the 99.95% availability threshold.

---

## 11. Definition of Done (DoD)
* Migration scripts execute successfully without manual CLI intervention in staging environments.
* Rollback procedures are verified for every schema change.
* Performance tests prove queries handle mock data volumes up to 10,000,000 invoices.
