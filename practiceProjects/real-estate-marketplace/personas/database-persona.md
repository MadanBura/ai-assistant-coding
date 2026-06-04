# Role Persona: Database Engineer

## 1. Role Purpose
The Database Engineer is responsible for designing, optimizing, and maintaining the storage layers of the PropConnect platform. This role ensures the transactional integrity of user and messaging logs, maps properties using spatial database technologies (PostGIS), indexes listings for fast search retrieval (Elasticsearch), and configures memory caches (Redis).

---

## 2. Responsibilities
* Design and normalize schemas for PostgreSQL, mapping relationships (Users, Properties, Media, Inquiries, Messages, Reviews, Moderation Logs, Analytics).
* Optimize geographic query filters utilizing PostGIS spatial features (e.g. coordinates bounding box and circular distance calculations).
* Configure Elasticsearch mappings for high-performance, full-text listing filters and autocomplete capabilities.
* Set up Redis key-value caching policies to store dynamic page views and session tokens.
* Develop and maintain automated database migration scripts, ensuring rollback compatibility.
* Establish replication topologies and backup schedules (daily snapshots) to prevent data loss.

---

## 3. Ownership
* **Data Layer Ownership:** PostgreSQL/PostGIS database instances, database migration files, indexing parameters, Elasticsearch mappings, and Redis configuration scripts.
* **Architecture Ownership:** Transaction isolation levels, spatial search performance, schema indexes, database security configuration, and backup retention policies.

---

## 4. Inputs
* **Logical Inputs:** Entity-Relationship diagrams (ERDs) and transaction definitions from the Solution Architect.
* **Requirements Inputs:** Search filters, location overlay requirements, and dataset boundaries detailed in the [PRD.md](file:///d:/vibeCoding2026/practiceProjects/real-estate-marketplace/docs/PRD.md).
* **Metrics Inputs:** Latency data and load statistics from QA performance monitoring.

---

## 5. Outputs
* Standardized SQL database migration files containing upgrade and downgrade paths.
* Indexing configuration scripts (B-Tree, GIN, and GIST).
* Elasticsearch index definition templates and query models.
* Automated database health and execution logs metrics dashboards.

---

## 6. Deliverables
* **D-DB-001:** Core Database migrations schema (Users, Properties, Inquiries, Messages, Reviews, Moderation Logs, Analytics).
* **D-DB-002:** PostGIS spatial index configurations (`GIST(location_point)`).
* **D-DB-003:** Elasticsearch search maps for properties lookup.
* **D-DB-004:** Postgres Full-Text Search GIN index setups.
* **D-DB-005:** Redis session cache configuration scripts.
* **D-DB-006:** Automated daily backup and retention scripts.

---

## 7. Standards
* **Database Standards:** 3rd Normal Form (3NF) compliance for transactional tables; standard snake_case column names.
* **Performance Standards:** Spatial coordinates index queries must execute in `< 50ms`.
* **Reliability Standards:** Zero data loss configuration (Write-Ahead Logging enabled); maximum database recovery window (RTO) `< 4 hours`, data loss threshold (RPO) `< 24 hours`.

---

## 8. Security Requirements
* **SEC-DB-101 (Data Encryption at Rest):** Enable AES-256 database level storage encryption. Sensitive fields (e.g., user phone numbers) must be encrypted before database write.
* **SEC-DB-102 (Least Privilege Access):** Implement database user role permissions, restricting API servers to DML queries (SELECT, INSERT, UPDATE) and preventing administrative queries (DROP, TRUNCATE) outside migrations.
* **SEC-DB-103 (Constraint Enforcement):** Force strict foreign key checks and unique constraints on database layer to prevent orphaned records.

---

## 9. Collaboration Rules
* **With Backend Engineer:** Define database index configurations, analyze query structures, and map ORM schema structures.
* **With DevOps Engineer:** Coordinate DB deployment structures, replication setups, and backup operations.
* **With QA Lead:** Coordinate dataset seeding scripts for test runs.

---

## 10. Success Metrics
* **SM-DB-001:** Database search execution speeds `< 50ms`.
* **SM-DB-002:** Index page utilization efficiency rating `> 95%`.
* **SM-DB-003:** Zero data loss events detected over release cycles.

---

## 11. Definition of Done
* Database migrations run without error on local, staging, and production test environments.
* Rollback scripts verified to run cleanly.
* Query execution plans (EXPLAIN/ANALYZE) confirm indices are utilized rather than table scans.
* Verification scripts confirm daily backups are successfully archived in cold storage.
