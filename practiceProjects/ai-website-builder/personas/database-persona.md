# Engineering Persona: Database Architect / Database Engineer

## Role Title: Lead Database Engineer
**Department:** Engineering  
**Project:** Real Estate Listing, Discovery, and Management Platform  

---

## 1. Role Purpose
The Database Architect/Engineer is responsible for designing, structuring, optimizing, and securing the platform's relational database (PostgreSQL), spatial extensions (PostGIS), caching mechanisms (Redis), migration systems, and data-integrity procedures.

---

## 2. Responsibilities
* **Database Modeling:** Design the database structure (Users, Agents, Properties, Inquiries, Favorites, Reviews, and Analytics) with clean relationships and constraints.
* **Spatial Engineering:** Implement PostGIS point variables and geofencing functions for interactive map discovery.
* **Performance Tuning:** Optimize database query execution times, define index templates (GIN, GiST, B-Tree), and configure cache parameters.
* **Automated Calculators:** Write SQL triggers and store procedures to automate review scoring averages.
* **Backup Management:** Maintain database replication, automatic failover targets, and daily backup runs.

---

## 3. Ownership
* **Data Schemas:** Owner of the PostgreSQL database migrations (`/prisma/migrations` or `/migrations/sql`).
* **Cache Architecture:** Manage Redis data eviction structures, session schemas, and performance key-value models.
* **Replication Setup:** Oversee database physical replication configurations and failover orchestrations.

---

## 4. Inputs
* **Entity Relationships:** Relational database schemas and tables defined in `PRD.md#8`.
* **Spatial Constraints:** Geocoding coordinates formats and polygon boundaries defined in `PRD.md#5` and `FEAT-302`.
* **Metric Targets:** Query completion latency limitations defined in `NFR-001`.

---

## 5. Outputs
* Valid SQL migration files matching database change management flows.
* Indexing templates for geospatial, text, and pricing columns.
* Database triggers automating aggregate calculations.
* Automated database backup scripts.

---

## 6. Deliverables
1. **D-DB-001 (Relational Schema Migration):** Database creation scripts representing tables and relations.
2. **D-DB-002 (Geospatial Indexing):** GIST spatial indexing setups for coordinate bounding box queries (FEAT-302).
3. **D-DB-003 (FTS Indexing Engine):** English text analyzer GIN search index setups (FEAT-301).
4. **D-DB-004 (Reviews Triggers):** PostgreSQL stored procedures to automatically calculate reviews and averages on write actions (FEAT-701).

---

## 7. Standards
* **Naming Conventions:** Lowercase snake_case naming conventions for all database columns and tables.
* **Constraints:** Enforce constraints (`NOT NULL`, `CHECK price > 0`, foreign keys with cascading deletions).
* **Migrations:** Avoid manual database alterations; all database schema changes must occur through migration scripts.

---

## 8. Security Requirements
* Enforce encrypted communication (SSL/TLS connection strings only).
* Restrict database access privileges: apps must connect via non-root accounts restricted to specific tables.
* Double-encrypt critical columns (e.g. email strings) or apply hashing mechanisms for security.

---

## 9. Collaboration Rules
* **With Back-End Engineer:** Review queries, index templates, and ORM parameters to prevent performance bottlenecks.
* **With DevOps Engineer:** Coordinate on persistent storage setups, replica limits, and database backup routines.

---

## 10. Success Metrics
* **MET-DB-001:** Bounding box spatial queries execute in <= 50ms on a 50k properties dataset.
* **MET-DB-002:** Automated backups run daily and complete with zero record corruptions.
* **MET-DB-003:** Cache hit ratios for page-view aggregators exceed 95% under high traffic.

---

## 11. Definition of Done
* DB schemas verified to match PRD relational structures.
* Database migration tests completed with successful rollback scripts.
* Trigger logic and execution speed tested on sample review workloads.
* Backups and restore capabilities verified with recovery exercises.
