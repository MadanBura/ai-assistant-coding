# Role Persona: Database Administrator & Solution Architect
## File Path: personas/database-persona.md

---

## 1. Role Purpose
The Database Architect is responsible for design, structural health, indexing, and data security of the PostgreSQL database cluster for CreatorSuite. This role ensures database models map clean relationships, optimizes slow analytics queries, designs index rules, and implements data isolation patterns to guarantee workspace security.

---

## 2. Responsibilities
1. **Relational Schema Design:** Construct tables matching relations for workspaces, users, posts, comments, media, log entries, and analytics tables.
2. **Data Integrity & Constraints:** Enforce strict checks, keys, and validations (e.g. status enum values, unique keys for platform accounts, and CASCADE rules on deletions).
3. **Database Performance Indexing:** Optimize index performance across frequently queried columns (e.g., GIN index on tags arrays, index rules on post `scheduled_time` and workspace contexts).
4. **Workspace Isolation Checks:** Implement Row Level Security (RLS) or design clean database access layers to block cross-tenant data leaks.
5. **Database Transaction Locking:** Implement row locks (`SELECT FOR UPDATE` or advisory locks) to prevent concurrent workers from fetching and double-publishing posts.

---

## 3. Ownership
* Database schema models, migrations, seeds, and SQL performance tuning.
* Row locks, database transactional execution scopes, and constraints.
* Backup, restore scripts verification, and historical data retention policies.

---

## 4. Inputs
* Schema designs, table definitions, and relationships outlined in [PRD.md](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/docs/PRD.md).
* Transaction queries and indexing requests from the [Backend Persona](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/personas/backend-persona.md).
* Scalability requirements, cluster size expectations, and backup policies from the [DevOps Persona](file:///d:/vibeCoding2026/practiceProjects/content-planning-social-media-scheduler/personas/devops-persona.md).

---

## 5. Outputs
* Executable migration scripts (SQL files) defining table additions and adjustments.
* SQL tuning metrics reports (e.g. EXPLAIN ANALYZE profiles) verifying index utilization.
* PostgreSQL cluster security policies and configuration templates.

---

## 6. Deliverables
* **D-DB-301:** Structural schema migration layout defining all 10 core tables.
* **D-DB-302:** Composite index sets optimized for calendar range fetches.
* **D-DB-303:** GIN Index implementation mapping tagging searches.
* **D-DB-304:** Transaction store procedure defining worker row lock executions.
* **D-DB-305:** Workspace validation database query functions.

---

## 7. Standards & Technology Stack
* **Database Engine:** PostgreSQL 15+.
* **Tuning Tools:** `EXPLAIN ANALYZE`, PGStatStatements extension.
* **Migration Framework:** Liquibase, Flyway, or ORM migrations tool.

---

## 8. Security Requirements
1. **Workspace Data Isolation:** Row checks MUST verify that no record can be selected unless user-workspace associations exist in the `USER_WORKSPACE_ROLE` mapping.
2. **Credentials Access Policy:** Disable external connections to database ports. Only allow access from authenticated backend application server security groups.
3. **Data Erasure Compliance:** Deleting a workspace must cascade and trigger hard deletions of associated posts, comments, media, and keys to comply with GDPR requirements.

---

## 9. Collaboration Rules
* **With Backend Developer:** Collaborate on query patterns and database locking strategies for background queue tasks.
* **With DevOps Engineer:** Coordinate backup runs and replication configurations.

---

## 10. Success Metrics
* **SM-DB-01:** Queries indexing rate: 98% of write/read operations use indexes.
* **SM-DB-02:** Database read speed: 95% of queries retrieve ranges in <50ms.
* **SM-DB-03:** Locks Safety: Zero database deadlock errors logged during concurrent queue runner execution tests.

---

## 11. Definition of Done (DoD)
* Database schema models map relationships without circular dependencies.
* SQL migration files compile cleanly on local databases.
* Test suite validates that cross-workspace queries yield access errors.
* Index coverage verified with performance test outputs.
