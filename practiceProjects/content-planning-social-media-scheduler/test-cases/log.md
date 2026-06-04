# Test Coverage Log
## Project: CreatorSuite - Content Planning & Social Media Scheduler
**Total Features:** 11  
**Total Test Cases:** 66 (33 Frontend E2E / 33 Backend Integration)  

---

## 1. Feature Coverage Matrix

| Feature ID | Feature Name | Priority | Frontend TC IDs | Backend TC IDs | Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **FEAT-101** | Workspace Setup & Invitations | High | `TC-FE-101` to `TC-FE-103` | `TC-BE-101` to `TC-BE-103` | Completed |
| **FEAT-102** | Social Account OAuth Integration | High | `TC-FE-201` to `TC-FE-203` | `TC-BE-201` to `TC-BE-203` | Completed |
| **FEAT-401** | Media Library & Asset Tagging | Medium | `TC-FE-301` to `TC-FE-303` | `TC-BE-301` to `TC-BE-303` | Completed |
| **FEAT-202** | Post Scheduler Engine & Queue | High | `TC-FE-401` to `TC-FE-403` | `TC-BE-401` to `TC-BE-403` | Completed |
| **FEAT-201** | Interactive Drag-Drop Calendar | High | `TC-FE-501` to `TC-FE-503` | `TC-BE-501` to `TC-BE-503` | Completed |
| **FEAT-501** | Status-based Approval Gate | High | `TC-FE-601` to `TC-FE-603` | `TC-BE-601` to `TC-BE-603` | Completed |
| **FEAT-301** | AI Caption Generator | Medium | `TC-FE-701` to `TC-FE-703` | `TC-BE-701` to `TC-BE-703` | Completed |
| **FEAT-302** | Smart Hashtag Generator | Medium | `TC-FE-801` to `TC-FE-803` | `TC-BE-801` to `TC-BE-803` | Completed |
| **FEAT-502** | Contextual Comments Feed | Medium | `TC-FE-901` to `TC-FE-903` | `TC-BE-901` to `TC-BE-903` | Completed |
| **FEAT-601** | Metrics Dashboard | High | `TC-FE-1001` to `TC-FE-1003` | `TC-BE-1001` to `TC-BE-1003` | Completed |
| **FEAT-602** | Exportable Reports | High | `TC-FE-1101` to `TC-FE-1103` | `TC-BE-1101` to `TC-BE-1103` | Completed |

---

## 2. Test Execution Types & Coverage Goals

We verify features against 11 test types:
1. **Functional (FN):** Verifying normal success user flows.
2. **Validation (VL):** Testing validation limits and boundary variables.
3. **Negative (NG):** inputting incorrect payloads or error conditions.
4. **Edge Cases (EG):** Testing rare paths (time constraints, database race locks).
5. **Security (SC):** Verifying Row Level isolation and parameter validation.
6. **API (AP):** Validating response formats and HTTP codes.
7. **Database (DB):** Verifying structural writes, cascades, and locking.
8. **UI (UI):** Testing screen components, interactive modals, and display states.
9. **Accessibility (AC):** Verifying keyboard navigation and contrast limits.
10. **Performance (PF):** Testing latencies and image optimization operations.
11. **Integration (IT):** Verifying communication between background workers, third-party social endpoints, and mailers.

---

## 3. Test Cases Directory Index

### Frontend E2E (Playwright - `.spec.ts`)
* `test-cases/frontend/01_workspace-setup-invitations.spec.ts`
* `test-cases/frontend/02_social-account-oauth.spec.ts`
* `test-cases/frontend/03_media-library-tagging.spec.ts`
* `test-cases/frontend/04_post-scheduler-queue.spec.ts`
* `test-cases/frontend/05_drag-drop-calendar.spec.ts`
* `test-cases/frontend/06_status-approval-gate.spec.ts`
* `test-cases/frontend/07_ai-caption-generator.spec.ts`
* `test-cases/frontend/08_smart-hashtag-generator.spec.ts`
* `test-cases/frontend/09_contextual-comments-feed.spec.ts`
* `test-cases/frontend/10_metrics-dashboard.spec.ts`
* `test-cases/frontend/11_exportable-reports.spec.ts`

### Backend Integration (Jest - `.test.ts`)
* `test-cases/backend/01_workspace-setup-invitations.test.ts`
* `test-cases/backend/02_social-account-oauth.test.ts`
* `test-cases/backend/03_media-library-tagging.test.ts`
* `test-cases/backend/04_post-scheduler-queue.test.ts`
* `test-cases/backend/05_drag-drop-calendar.test.ts`
* `test-cases/backend/06_status-approval-gate.test.ts`
* `test-cases/backend/07_ai-caption-generator.test.ts`
* `test-cases/backend/08_smart-hashtag-generator.test.ts`
* `test-cases/backend/09_contextual-comments-feed.test.ts`
* `test-cases/backend/10_metrics-dashboard.test.ts`
* `test-cases/backend/11_exportable-reports.test.ts`
