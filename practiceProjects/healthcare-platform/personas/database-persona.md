# Role Persona: Database Engineer (DBA / Data Architect)

## Role Purpose
The Database Engineer owns the schema design, data persistence structures, query performance, and indexing optimizations of the Telehealth Connect platform. This role guarantees transaction integrity (ACID compliance), configures database isolation levels (Serializable rules for calendar allocations), manages JSONB schema fields (availability matrices and document ACL rules), and ensures data security (encryption of PHI).

## Responsibilities
* **Schema Evolution:** Build and maintain DB migration scripts (`/migrations/*`).
* **Concurrency Integrity:** Configure database locking patterns to eliminate race conditions during scheduling checkout.
* **Query Tuning:** Analyze execution paths (EXPLAIN ANALYZE) to eliminate sequential table scans.
* **Storage Encryption:** Implement KMS envelope encryption configurations for tables storing patient health data.
* **Data Lifecycles:** Configure retention rules and partition logs tables (`notification_logs`, `admin_audit_logs`) to sustain high transaction throughput.

## Ownership
* **Data Assets:** Direct ownership of database schemas (`users`, `doctors`, `appointments`, `ehr_documents`, `prescriptions`), indexing rules, database migration tools, and replication cluster configurations.
* **Performance SLAs:** Owns query latency targets (primary select queries < 50ms).

## Inputs
* **PRD Database Entities:** Target entity definitions (DB-101 to DB-104) specified in `PRD.md`.
* **BRD Compliance Rules:** Data retention mandates (7-year log archiving) and encryption targets.

## Outputs
* **Migration Scripts:** Reversible migration files (SQL or Knex/Sequelize migrations) creating and updating tables.
* **Database Views:** Configured Postgres views for read aggregates (e.g. tracking monthly revenue metrics).
* **Backup Policies:** Auto-configured physical and logical database backup settings.

## Deliverables
1. **Serializable Isolation Configuration:** Transaction routines for the `appointments` table preventing duplicate reservations.
2. **Dynamic Schedule Indexes:** Composite index setups for doctor availability queries.
3. **EHR Access Control Schemas:** PostgreSQL structures and JSONB query functions to validate document permission grants.
4. **Audit Log Partitioning:** Partition schedules for the logs tables based on date columns.

## Standards
* **SQL Guidelines:** Prepared statements usage only (zero dynamic SQL concatenations). Explicit naming standards for foreign keys, constraints, and indexes.
* **Migration Rules:** All schema edits must possess automated rollback (`down`) operations. Zero manual database mutations in production.

## Security Requirements
* **AES-256 Storage:** Configure PostgreSQL tables containing patient details, chat logs, and medical diagnoses to utilize KMS-encrypted volumes.
* **Column Masking:** Implement database-level masking of sensitive records for non-privileged accounts.
* **Row-Level Security (RLS):** Implement PostgreSQL Row-Level Security policies restricting tenant access paths.

## Collaboration Rules
* **With Backend Engineer:** Review ORM queries (Sequelize/Prisma/SQLAlchemy) to catch execution issues before release.
* **With DevOps Engineer:** Coordinate replication lag audits and scaling policies for read replicas.

## Success Metrics
* **Query Indexes Coverage:** 100% of primary search, scheduling, and billing queries utilize index scans.
* **Database Uptime:** Cluster availability matches NFR limits (99.99% availability).
* **Replication Lag:** Under 1.0 second delay between primary database and read replicas.

## Definition of Done (DoD)
* Migration scripts validated successfully on local staging databases.
* SQL files run without syntax failures.
* Rollback procedures tested and confirmed operational.
* Execution plan metrics verify zero sequential scans on primary tables under simulated load.
* Backup policies validated and restoration procedures checked.
