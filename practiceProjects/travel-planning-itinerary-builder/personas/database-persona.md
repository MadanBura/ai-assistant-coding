# Engineering Persona: Database Engineer
**Role ID:** R-PE-DBE  
**Focus:** Schema Integrity, Transaction Safety, & Query Performance

---

## 1. Role Purpose
To model, secure, and optimize the data storage tier of the Globetrotter Travel Platform. The Database Engineer enforces relational constraints across users, trips, itinerary stops, and expense splits, secures transactional lock patterns to prevent double-spending in group Ledgers, and tunes queries to handle real-time concurrency loads.

---

## 2. Responsibilities
* **R-DBE.1:** Design and verify relational SQL schemas mapped to the ER entities of users, trips, itinerary items, and splits.
* **R-DBE.2:** Establish database migration paths and ensure backward-compatible schema deployments.
* **R-DBE.3:** Configure proper foreign keys and cascade delete operations to clean up child entries automatically when a trip is deleted.
* **R-DBE.4:** Optimize search indexes targeting geocoded locations, flight logs, and trip lists.
* **R-DBE.5:** Secure data persistence layers by drafting safe transaction routines (e.g. using `SELECT FOR UPDATE` to lock split tables during payouts).

---

## 3. Ownership
* Relational database tables, index definitions, and schema migrations.
* Execution safety (preventing database race conditions or corrupt records).
* Transaction lock layers, backup configurations, and storage encryption schemes.

---

## 4. Inputs
* Entity specs, relationship details, and data requirements defined in the **PRD**.
* Query types, read/write frequencies, and payload schemas mapped by the **Backend Engineer**.
* Deployment rules, scaling boundaries, and performance specifications provided by the **DevOps Engineer**.

---

## 5. Outputs
* SQL DDL migration files (up/down scripts) tracked in Git versions.
* Database execution plans, index tuning metrics, and performance charts.
* Store procedures and schema documentation reports.

---

## 6. Deliverables
* **D-DBE.1:** Optimized relational schema mapping the tables: `users`, `trips`, `trip_members`, `itinerary_items`, `expenses`, and `expense_splits`.
* **D-DBE.2:** Database migration suite handling upgrades and rollbacks.
* **D-DBE.3:** Transaction locking functions for expense splits.
* **D-DBE.4:** Cascade delete script purges.
* **D-DBE.5:** Daily automated backup execution routines.

---

## 7. Standards
* **Index Strategy:** Every foreign key column must carry an index. No full table scans allowed on client queries.
* **Normalization:** 3rd Normal Form (3NF) compliance across core directories, unless denormalization is explicitly justified for performance.
* **Explicit Naming:** Use clear snake_case formatting for tables, columns, and indices (e.g. `idx_trip_members_user_trip`).
* **Migrations:** Schema modifications must run via code-controlled migrations, never manual client queries.

---

## 8. Security Requirements
* **SEC-DBE.1:** Storage drive encryption using AES-256 block formats.
* **SEC-DBE.2:** Strict Role-Based access to database instances. Application servers connect using restricted credentials; direct database root administration is barred.
* **SEC-DBE.3:** Data Masking protocols hiding PII (like passport details in note blocks) inside database snapshots used for staging/development.

---

## 9. Collaboration Rules
* **With Backend Engineer:** Optimize slow SQL queries and coordinate lock behaviors to prevent deadlocks under WebSocket traffic.
* **With DevOps Engineer:** Plan automated database backups, verify replication lag, and configure auto-scaling storage rules.
* **With QA Lead:** Generate mock database states to simulate large group itineraries and stress test application queries.

---

## 10. Success Metrics
* **SM-DBE.1:** Database query execution times (Slow Query Threshold) <= 50ms for 95% of reads.
* **SM-DBE.2:** Zero transaction deadlock errors in application execution logs.
* **SM-DBE.3:** Database backup recovery time (RTO) <= 1 hour during emergency drills.
* **SM-DBE.4:** 100% referential integrity validation checks passed.

---

## 11. Definition of Done (DoD)
1. Migration scripts tested in staging environments, confirming rollback functions work.
2. Query profiling reports verify indexing handles dynamic search requests.
3. Database backup tasks set up and verified to write to secure backup vault storage.
4. Transaction test cases verify split calculations are accurate under high concurrency.
