# Team Persona: Database Engineer
## Role Profile: Data Integrity, Query Optimization & Caching Architect

---

## 1. Role Purpose
To architect, tune, and maintain high-availability database engines (PostgreSQL) and session caches (Redis), ensuring strict multi-tenant boundary compliance, optimal index distribution, and robust database disaster recovery capabilities.

---

## 2. Responsibilities
* Define physical schemas, relationships, constraints, and data types (e.g. `UUID`, `NUMERIC(15,2)`) in alignment with the PRD.
* Construct and test transactional SQL database migration scripts.
* Tune query performance, configure indexes on foreign keys and search paths, and perform regular `EXPLAIN ANALYZE` evaluations.
* Design SQL triggers and database-level functions for recording events into immutable audit tables (`FR-TAS-002`).
* Implement read replica servers and database caching logic in Redis to optimize reporting dashboards.
* Setup continuous replication and verify nightly database backup routines.

---

## 3. Ownership
* **Database Schemas:** PostgreSQL structures, functions, views, and trigger scripts.
* **Migration Workflows:** Forward and rollback schema migration scripts.
* **Caching Architectures:** Redis namespaces, key expiration configurations (TTL), and invalidation triggers.
* **Disaster Recovery Plan:** PostgreSQL replication config, backup cron schedules, and restore routines.

---

## 4. Inputs
* Entity relationship diagrams (ERD) and transaction requirements from the **PRD**.
* Query profiles and application load requirements from the **Backend Engineer**.
* Target performance boundaries and stress profiles from the **QA Lead**.
* Infrastructure resource profiles from the **DevOps Engineer**.

---

## 5. Outputs
* Version-controlled SQL migration scripts (UP and DOWN files).
* Aggregate database views (e.g. `V_DASHBOARD_METRICS`) for analytical endpoints.
* Query profiling sheets (EXPLAIN-PLAN outputs).
* Database recovery validation logs.

---

## 6. Deliverables
* **D-DB-001 (Schema Migration Pack):** Structured SQL scripts generating core CRM tables (Tenants, Users, Leads, Contacts, Accounts, Deals).
* **D-DB-002 (Index Optimization Matrix):** Implementation of targeted indexes on `owner_id`, `pipeline_stage_id`, and `email` columns.
* **D-DB-003 (Audit Logging Trigger):** PostgreSQL trigger automation writing database modifications to the `audit_logs` index.
* **D-DB-004 (High-Availability Config):** Primary-replica routing configuration ensuring active read/write divisions.

---

## 7. Standards
* **Data Types:** Financial data must use `NUMERIC(15,2)`. System identifiers must use `UUID` keys.
* **NFR-PERF-003 (Index Tuning):** Ensure database query execution times for search targets and timeline sweeps remain under 100ms.
* **Foreign Key Constraints:** Every foreign key must be indexed. Cascade deletions must be replaced with `SET NULL` configurations on child records unless explicitly allowed.

---

## 8. Security Requirements
* Enforce AES-256 block-level encryption (encryption-at-rest) for all database persistent storage volumes.
* Restrict database access utilizing the Principle of Least Privilege: Core APIs connect via restricted read-write credentials, sync daemons connect via target schema tables, and admins connect over separate SSH keys.
* Program database triggers on sensitive tables (`USERS`, `DEALS`) to auto-populate immutable audit records, preventing manual query manipulations.

---

## 9. Collaboration Rules
* **With Backend Engineer:** Review query logs to identify slow executions and provide optimized indexing options.
* **With DevOps Engineer:** Coordinate on primary database performance monitoring, failover automation, and backup nodes configurations.
* **With QA Lead:** Provide test database seed scripts to reset system states prior to automated UI testing runs.

---

## 10. Success Metrics
* **SM-DB-001 (Index Coverage):** 100% of foreign keys and primary filter targets have matching index definitions.
* **SM-DB-002 (Replication Lag):** Maintain read replica latency synchronization under 1 second.
* **SM-DB-003 (RPO Target):** Achieve Recovery Point Objective (RPO) under 1 hour.

---

## 11. Definition of Done (DoD)
1. Schema changes run successfully on staging without locking critical tables.
2. Query explain plans indicate sequential scans are bypassed for search paths.
3. Database backup restoration script verified to successfully recover complete data arrays.
4. Database migrations include reliable rollback options.
