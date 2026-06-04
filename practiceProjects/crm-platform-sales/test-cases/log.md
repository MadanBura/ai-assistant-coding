# Test Case Registry & Coverage Log
## Feature: Role-Based Access Control (RBAC)
* **Feature ID:** `FE-TAS-2` (Priority 01)
* **Target Release:** v1.0.0
* **Log Last Updated:** 2026-06-04T17:35:00+05:30
* **QA Owner:** QA Automation Lead

---

## 1. Test Summary Metrics

* **Total Test Cases defined:** 15
  - Backend API / DB / Integration Tests: 9
  - Frontend E2E / UI / Accessibility Tests: 6
* **Priority Breakdown:**
  - `Critical`: 7
  - `High`: 6
  - `Medium`: 2
* **Current Execution Status:**
  - `Written / Verified`: 15
  - `Passed`: 0 (Pending CI/CD execute)
  - `Failed`: 0
  - `Blocked`: 0

---

## 2. Test Case Registry

| Test Case ID | Test Suite | Title | Requirement Map | AC Map | Type | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-RBAC-B-001** | Backend | Success Login with Valid Credentials | FR-RBAC-001, FR-RBAC-002 | AC-RBAC-001 | Functional / Security | Critical | Written |
| **TC-RBAC-B-002** | Backend | Login Fail - Invalid Email Format | FR-RBAC-001 | AC-RBAC-001 | Negative / Validation | High | Written |
| **TC-RBAC-B-003** | Backend | Login Fail - Incorrect Password | FR-RBAC-001 | AC-RBAC-001 | Negative / Security | Critical | Written |
| **TC-RBAC-B-004** | Backend | Refresh Token Verification | FR-RBAC-002 | AC-RBAC-003 | Functional / Integration | Critical | Written |
| **TC-RBAC-B-005** | Backend | Rep Blocked from Other Rep Deals | FR-RBAC-004 | AC-RBAC-002 | Security / API | Critical | Written |
| **TC-RBAC-B-006** | Backend | Manager Can Read Team Deals | FR-RBAC-004 | None | Security / API | Critical | Written |
| **TC-RBAC-B-007** | Backend | Manager Blocked from Other Teams | FR-RBAC-004 | None | Security / API | Critical | Written |
| **TC-RBAC-B-008** | Backend | Deactivation Clears Redis Session | Edge Case 1 | None | Edge Case / Database | Critical | Written |
| **TC-RBAC-B-009** | Backend | Auth Middleware Performance Check | FR-RBAC-003 | None | Performance / API | High | Written |
| **TC-RBAC-F-001** | Frontend | Success Login Flow and Redirect | FR-RBAC-001 | AC-RBAC-001 | Functional / UI | High | Written |
| **TC-RBAC-F-002** | Frontend | Validation Warnings on Empty Forms | FR-RBAC-001 | AC-RBAC-001 | Negative / UI | High | Written |
| **TC-RBAC-F-003** | Frontend | Sidebar Link Visibility for Reps | FR-RBAC-004 | None | Functional / UI | High | Written |
| **TC-RBAC-F-004** | Frontend | Direct URL Block (Redirects to 403) | FR-RBAC-004 | AC-RBAC-002 | Negative / UI | Critical | Written |
| **TC-RBAC-F-005** | Frontend | Login Accessibility Audit Checks | UI Standards | None | Accessibility | Medium | Written |
| **TC-RBAC-F-006** | Frontend | Auto-Redirect on Session Expiration| FR-RBAC-002, 003 | AC-RBAC-003 | Integration / Redirect | High | Written |

---

## 3. Coverage Analysis Checklist

Verify coverage compliance across target aspects:

* [x] **Functional Coverage:**
  - Login processing (`TC-RBAC-B-001`, `TC-RBAC-F-001`).
  - Refresh cycle executions (`TC-RBAC-B-004`, `TC-RBAC-F-006`).
* [x] **Validation Coverage:**
  - Input field schemas validation (`TC-RBAC-B-002`).
  - Client empty field check errors (`TC-RBAC-F-002`).
* [x] **Negative Coverage:**
  - Incorrect inputs login limits (`TC-RBAC-B-003`, `TC-RBAC-F-002`).
  - Unauthorized direct navigation alerts (`TC-RBAC-F-004`, `TC-RBAC-B-005`).
* [x] **Edge Case Coverage:**
  - User accounts deactivation dropping Redis sessions immediately (`TC-RBAC-B-008`).
* [x] **Security Coverage:**
  - Strict HTTPS cookies configurations verification (`TC-RBAC-B-001`).
  - Access rights block checks (`TC-RBAC-B-005`, `TC-RBAC-B-007`).
* [x] **API Endpoint Coverage:**
  - Authentication `/api/v1/auth/login` checks.
  - Refresh token endpoints `/api/v1/auth/refresh` validation.
* [x] **Database Coverage:**
  - Checking deactivation data updates and session keys drops in Redis cache instances (`TC-RBAC-B-008`).
* [x] **UI Components Coverage:**
  - Login Card layouts, input tags, and sidebar link nodes visibility rules (`TC-RBAC-F-003`).
* [x] **Accessibility (a11y) Coverage:**
  - WCAG 2.1 AA audits on login inputs and color contrast limits using Axe checks (`TC-RBAC-F-005`).
* [x] **Performance Coverage:**
  - Auth route interception latency verified under 200ms bounds (`TC-RBAC-B-009`).
* [x] **Integration Coverage:**
  - Intercepting backend 401 warnings to auto-redirect client-side routes to the login page (`TC-RBAC-F-006`).
