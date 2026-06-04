# Test Cases Coverage Log

## Project: Real Estate Listing, Discovery, and Management Platform
**Status:** All Automated Specs Configured  
**Date:** June 4, 2026  
**Coverage Standard:** Playwright (Frontend E2E) & Jest/Supertest (Backend Integration)

---

## 1. Feature Coverage Matrix

| Feature ID | Feature Name | Frontend Spec File | Backend Spec File | TC Count (FE) | TC Count (BE) | Requirements Mapped |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **FEAT-101** | Registration & Role Selection | `01_registration-role-selection.spec.ts` | `01_registration-role-selection.test.ts` | 5 | 4 | FR-101, FR-102, BR-001, BRL-002, SEC-003, SEC-006 |
| **FEAT-201** | Property Creation Wizard | `02_property-creation-wizard.spec.ts` | `02_property-creation-wizard.test.ts` | 3 | 3 | FR-201, BRL-003, SEC-004, US-201-2 |
| **FEAT-801** | Admin Queue & Moderation | `03_admin-queue-moderation.spec.ts` | `03_admin-queue-moderation.test.ts` | 3 | 3 | FR-801, BR-008, SEC-004, US-801-1 |
| **FEAT-202** | Listing Status Lifecycle | `04_listing-status-lifecycle.spec.ts` | `04_listing-status-lifecycle.test.ts` | 2 | 3 | FR-202, BR-003, SEC-004, US-202-1 |
| **FEAT-301** | Keyword and Filtered Search | `05_keyword-filtered-search.spec.ts` | `05_keyword-filtered-search.test.ts` | 2 | 3 | FR-301, BR-004, US-301-1, US-301-2 |
| **FEAT-302** | Interactive Map Discovery | `06_interactive-map-discovery.spec.ts` | `06_interactive-map-discovery.test.ts` | 2 | 3 | FR-302, NFR-001, US-302-1 |
| **FEAT-102** | Agent Profile & Branding | `07_agent-profile-branding.spec.ts` | `07_agent-profile-branding.test.ts` | 2 | 3 | FR-102, BRL-005, SEC-004, US-102-1 |
| **FEAT-501** | Inquiry Messaging System | `08_inquiry-messaging-system.spec.ts` | `08_inquiry-messaging-system.test.ts` | 2 | 3 | FR-501, BRL-004, SEC-002, US-501-1, US-501-2 |
| **FEAT-401** | Property Comparison Matrix | `09_property-comparison-matrix.spec.ts` | `09_property-comparison-matrix.test.ts` | 2 | 3 | FR-401, SEC-004, US-401-1 |
| **FEAT-402** | Saved Favorites | `10_saved-favorites.spec.ts` | `10_saved-favorites.test.ts` | 2 | 2 | FR-402, SEC-002, US-402-1 |
| **FEAT-701** | Agent and Property Reviews | `11_agent-property-reviews.spec.ts` | `11_agent-property-reviews.test.ts` | 2 | 4 | FR-701, BRL-006, SEC-004, US-701-1 |
| **FEAT-601** | Property Analytics | `12_seller-dashboard-metrics.spec.ts` | `12_seller-dashboard-metrics.test.ts` | 2 | 3 | FR-601, SEC-004, US-601-1 |

---

## 2. Test Execution Metric Summary

* **Total Frontend Test Cases:** 29 cases
* **Total Backend Test Cases:** 37 cases
* **Total Automated Cases Combined:** 66 cases
* **Target Line Coverage Threshold:** 85%+ configured across CI pipelines.

---

## 3. Coverage by Category

* **Functional & Flow Validation:** Covered in all `*-01` test groups. Checks happy-path registrations, submissions, searches, updates, reviews, and messaging.
* **Validation & Formatting Constraints:** Verified inputs like password strengths, listing prices, photo upload size boundaries, geocoding bounding box formats, and social media URL regex rules.
* **Negative & Failure States:** Verified email duplicate collisions, empty description block rejections, missing license number checks, and expired verification tokens.
* **Edge Cases & Conflict Handling:** Covered double moderation admin conflicts, editing active listings resetting moderation statuses, and messaging archived properties.
* **Security & Authentication Control:** Checked route guards blocking role accesses (e.g. buyers querying admin panels, non-owners updating status logs), JWT parsing, password hashes (bcrypt), and rate limits.
* **Database & Trigger Automation:** Verified review average calculations triggers and database table schema inserts.
* **UI & Animations:** Verified Mobile grids, hover states, loading animations, and fade-out animations.
* **Accessibility standards:** Focus navigations tab orders, and HTML ARIA label criteria checks.
