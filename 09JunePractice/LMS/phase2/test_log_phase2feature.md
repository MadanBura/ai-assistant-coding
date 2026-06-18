# Test Cases Log — Phase 2 LMS

**Last Updated:** 2026-06-18 | Total: 51 | ■ Pass: 0 | ■ Fail: 51 | ■ Skip: 0

## Summary Dashboard
| Module | Total | Pass | Fail | Skip |
| :--- | :--- | :--- | :--- | :--- |
| MOD-01: Unified Course Announcement System | 8 | 0 | 8 | 0 |
| MOD-02: Assignment Grading & Feedback Portal | 12 | 0 | 12 | 0 |
| MOD-03: Topic-Specific Q&A & Doubt Resolver | 8 | 0 | 8 | 0 |
| MOD-04: Interactive Quiz Feedback & Explanations | 8 | 0 | 8 | 0 |
| MOD-05: Gamification and Custom Badges | 8 | 0 | 8 | 0 |
| Security & Cross-Cutting Tests | 4 | 0 | 4 | 0 |
| Performance Tests | 3 | 0 | 3 | 0 |

## Modules

## MOD-01: Unified Course Announcement System

| TC-ID | Feature | Description | Type | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-AN-POST-01 | Announcement Creation | Instructor creates urgent announcement successfully | Integration | High | FAIL | Initial baseline |
| TC-AN-POST-02 | Announcement Creation | Fail creation if required fields are missing | Integration | Medium | FAIL | Initial baseline |
| TC-AN-POST-03 | Announcement Creation | Reject creation if requester lacks Instructor role | Integration | High | FAIL | Initial baseline |
| TC-AN-POST-04 | Announcement Creation | Reject creation if instructor does not own the course | Integration | High | FAIL | Initial baseline |
| TC-AN-GET-01 | Announcement Display | Enrolled learner retrieves announcements successfully | Integration | High | FAIL | Initial baseline |
| TC-AN-GET-02 | Announcement Display | Reject access if learner is not enrolled in the course | Integration | High | FAIL | Initial baseline |
| TC-AN-GET-03 | Announcement Display | Reject access if token is invalid or missing | Integration | High | FAIL | Initial baseline |
| TC-AN-GET-04 | Announcement Display | Dismiss event removes banner from active local state | Integration | Medium | FAIL | Initial baseline |

## MOD-02: Assignment Grading & Feedback Portal

| TC-ID | Feature | Description | Type | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-AS-01-01 | Assignment Creation | Should create assignment under owned topic successfully | Integration | High | FAIL | Initial baseline |
| TC-AS-01-02 | Assignment Creation | Should fail creation if due date is in the past | Integration | Medium | FAIL | Initial baseline |
| TC-AS-01-03 | Assignment Creation | Should reject request if requester is a Learner | Integration | High | FAIL | Initial baseline |
| TC-AS-01-04 | Assignment Creation | Should reject creation if instructor does not own the course | Integration | High | FAIL | Initial baseline |
| TC-AS-02-01 | Assignment Submission | Should accept PDF files under 10MB before due date | Integration | High | FAIL | Initial baseline |
| TC-AS-02-02 | Assignment Submission | Should reject uploads exceeding 10MB size limits | Integration | Medium | FAIL | Initial baseline |
| TC-AS-02-03 | Assignment Submission | Should reject uploads if requester lacks Learner role | Integration | High | FAIL | Initial baseline |
| TC-AS-02-04 | Assignment Submission | Should reject uploads past the due date deadline | Integration | High | FAIL | Initial baseline |
| TC-AS-03-01 | Assignment Grading | Should grade submission successfully with valid score and comments | Integration | High | FAIL | Initial baseline |
| TC-AS-03-02 | Assignment Grading | Should reject grading if score exceeds maximum limits | Integration | Medium | FAIL | Initial baseline |
| TC-AS-03-03 | Assignment Grading | Should reject grading request if requester is a Learner | Integration | High | FAIL | Initial baseline |
| TC-AS-03-04 | Assignment Grading | Should reject grading request if instructor does not own the course | Integration | High | FAIL | Initial baseline |

## MOD-03: Topic-Specific Q&A & Doubt Resolver

| TC-ID | Feature | Description | Type | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-DB-01-01 | Doubt Drawer Submission | Should post doubt under unlocked topic successfully | Integration | High | FAIL | Initial baseline |
| TC-DB-01-02 | Doubt Drawer Submission | Should reject empty query body payload | Integration | Medium | FAIL | Initial baseline |
| TC-DB-01-03 | Doubt Drawer Submission | Should reject doubt post if token is missing or invalid | Integration | High | FAIL | Initial baseline |
| TC-DB-01-04 | Doubt Drawer Submission | Should reject doubt post if topic is locked | Integration | High | FAIL | Initial baseline |
| TC-DB-02-01 | Doubt Thread Management | Should post instructor answer successfully | Integration | High | FAIL | Initial baseline |
| TC-DB-02-02 | Doubt Thread Management | Should pin answer as official and set resolved status | Integration | High | FAIL | Initial baseline |
| TC-DB-02-03 | Doubt Thread Management | Should reject answer update if requester has Learner role | Integration | High | FAIL | Initial baseline |
| TC-DB-02-04 | Doubt Thread Management | Should reject answer post if Instructor does not own the course | Integration | High | FAIL | Initial baseline |

## MOD-04: Interactive Quiz Feedback & Explanations

| TC-ID | Feature | Description | Type | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-QF-01-01 | Explanation Setup | Should create quiz questions with explanations and release rule values | Integration | High | FAIL | Initial baseline |
| TC-QF-01-02 | Explanation Setup | Should validate option bounds checks correctly | Integration | Medium | FAIL | Initial baseline |
| TC-QF-01-03 | Explanation Setup | Should reject quiz updates if requester is not the course instructor | Integration | High | FAIL | Initial baseline |
| TC-QF-01-04 | Explanation Setup | Should reject setup if instructor does not own the course | Integration | High | FAIL | Initial baseline |
| TC-QF-02-01 | Feedback View | Should return rationales if release rule is set to Always | Integration | High | FAIL | Initial baseline |
| TC-QF-02-02 | Feedback View | Should hide rationales if rule is OnPassing and learner fails the quiz | Integration | High | FAIL | Initial baseline |
| TC-QF-02-03 | Feedback View | Should ensure pre-submission queries block explanations | Integration | Medium | FAIL | Initial baseline |
| TC-QF-02-04 | Feedback View | Should reject attempt details retrieval belonging to another student | Integration | High | FAIL | Initial baseline |

## MOD-05: Gamification and Custom Badges

| TC-ID | Feature | Description | Type | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-GM-01-01 | Badge Designer | Should create custom badge successfully | Integration | High | FAIL | Initial baseline |
| TC-GM-01-02 | Badge Designer | Should reject requests with invalid trigger types | Integration | Medium | FAIL | Initial baseline |
| TC-GM-01-03 | Badge Designer | Should reject request if caller lacks Instructor role | Integration | High | FAIL | Initial baseline |
| TC-GM-01-04 | Badge Designer | Should reject badge creation if instructor does not own the course | Integration | High | FAIL | Initial baseline |
| TC-GM-02-01 | Badge Awards Gallery | Should unlock Quiz Genius badge upon scoring 100% on a quiz | Integration | High | FAIL | Initial baseline |
| TC-GM-02-02 | Badge Awards Gallery | Should display badge gallery grid on the profile page | Integration | Medium | FAIL | Initial baseline |
| TC-GM-02-03 | Badge Awards Gallery | Should ensure badge unlock check handles duplicate achievements | Integration | Medium | FAIL | Initial baseline |
| TC-GM-02-04 | Badge Awards Gallery | Should reject profile badges request if token is missing or invalid | Integration | High | FAIL | Initial baseline |

## Security & Cross-Cutting Tests

| TC-ID | Feature | Description | Type | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-SEC-01 | Authentication | Enforce JWT token verification on all protected endpoints | Security | High | FAIL | Initial baseline |
| TC-SEC-02 | Authorization | Enforce Role-Based Access Control (RBAC) validations | Security | High | FAIL | Initial baseline |
| TC-SEC-03 | Input Validation | Sanitize query inputs and payloads against NoSQL Injection | Security | High | FAIL | Initial baseline |
| TC-SEC-04 | Rate Limiting | Rate limiting protection blocks flood requests on active endpoints | Security | Medium | FAIL | Initial baseline |

## Performance Tests

| TC-ID | Feature | Description | Type | Priority | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-PERF-01 | Write Latency | Standard Write Routes latency verification under SLA target | Performance | High | FAIL | Initial baseline |
| TC-PERF-02 | Read Latency | Standard Read Routes latency verification under SLA target | Performance | High | FAIL | Initial baseline |
| TC-PERF-03 | Badge Unlock Latency | Badge unlock computation completes asynchronously under SLA target | Performance | Medium | FAIL | Initial baseline |

## Change Log
- Initial generation: all tests set to FAIL
