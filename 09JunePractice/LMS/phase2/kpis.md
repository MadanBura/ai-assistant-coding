# KPIs — Learning Management System (LMS) Feature Enhancements

## 1. Document Control

| Version | Date | Author | Status | Change Summary |
| :--- | :--- | :--- | :--- | :--- |
| v1.0.0 | June 17, 2026 | Product Analytics & SRE Team | Active | Initial Release for Phase 2 Feature Enhancements |

---

## 2. How to Read This Doc
This document outlines the Key Performance Indicators (KPIs), Service Level Agreements (SLAs), and operational targets for the five interactive features introduced in Phase 2.
* **KPI-ID**: Unique identification code for tracing metrics.
* **Owner**: The role or team responsible for monitoring and defending the metric.
* **Measure Method**: The mechanism and telemetry used to query the data.
* **Event**: Trigger points that signal potential performance or operational degradation.
* **Alert**: The threshold at which automated notifications are dispatched to engineering.
* **SLA Targets**: The non-negotiable performance limits that govern application viability.

---

## 3. Feature KPI Matrix

| KPI-ID | Name | Owner | Measure Method | Baseline | Target | Event | Alert |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **KPI-F01** | Announcement Display Latency | Frontend Eng | Measured via browser Performance API tracking time from page load to Banner mount. | N/A | < 100ms | Mount duration exceeds 250ms | P95 latency > 500ms over 5min window |
| **KPI-F02** | Notification Delivery Success | Backend Eng | DB logs measuring the count of created UserNotification records matching enrollment count. | N/A | 100% | Failed notification inserts | Any failed write query on announcement broadcast |
| **KPI-F03** | Assignment Upload Success Rate | Backend Eng | Upload controller success response count / total upload attempt events. | N/A | > 99.5% | Upload fails due to timeout or 5xx code | Success rate drops < 98% in a 1-hour window |
| **KPI-F04** | Grading Turnaround Latency | Product Manager | Time difference between Assignment `submittedAt` and Submission `gradedAt` timestamps. | N/A | < 48 hours | Assignment remains ungraded after 72 hours | > 10% of assignments ungraded past 72 hours |
| **KPI-F05** | Doubt Thread Load Time | Frontend Eng | Browser trace of API response latency for GET queries on `/api/topics/:id/doubts`. | N/A | P95 < 200ms | Topic drawer load time > 500ms | P95 latency > 800ms over 15min window |
| **KPI-F06** | Quiz Explanation Mask Integrity | QA Lead | Test runner verification confirming explanations are null in payloads for unsubmitted quizzes. | 100% | 100% | Explanation string found in GET response body | Single occurrence of unmasked explanation payload |
| **KPI-F07** | Badge Unlock Trigger Latency | SRE Lead | Time delta between save of QuizAttempt / FinalExamAttempt and insertion of BadgeLog mapping. | N/A | < 500ms | Badge trigger handler execution takes > 1.5s | P95 trigger latency > 2s over a 1-hour window |

---

## 4. Business KPIs

| KPI-ID | Name | Owner | Target | Telemetry Source |
| :--- | :--- | :--- | :--- | :--- |
| **KPI-B01** | Course Completion Rate Increase | Product Manager | + 15% increase in total completions over a 90-day period. | MongoDB: Enrolled progress records where `progressPercent == 100` and `finalExamPassed == true`. |
| **KPI-B02** | Platform Active Session Duration | Product Manager | + 20% increase in daily active session length for Learners. | Frontend analytics hooks (e.g. Mixpanel / Google Analytics session metrics). |
| **KPI-B03** | Doubt Resolution Rate | Support Lead | > 85% of doubts resolved (answered by instructor) within 24 hours. | MongoDB: Count of `Doubt` records where `isResolved == true` / total `Doubt` records. |
| **KPI-B04** | Weekly Assignment Submission Volume | Product Manager | > 60% of active enrolled students submitting assignments on time. | MongoDB: Count of on-time `Submission` records / total active enrollments. |
| **KPI-B05** | Retake Pass Rate Improvement | Content Lead | > 75% of students passing topic quizzes on their second attempt after viewing explanations. | MongoDB: QuizAttempt records comparison (Score on Attempt 2 vs Score on Attempt 1). |

---

## 5. SLA Targets

### 1. Service Availability (Uptime)
* **API Server (Render Backend)**: **99.9%** availability (maximum 43 minutes of unscheduled downtime per month).
* **Database (MongoDB Atlas Cloud)**: **99.99%** availability (maximum 4.3 minutes of downtime per month).
* **Static Asset Delivery (Vercel CDN)**: **99.99%** availability.

### 2. API Response Latency (Measured at the Gateway)
* **Standard Read Routes** (Announcements, Doubt lists, Grades):
  * **P50**: < 80ms
  * **P95**: < 150ms
  * **P99**: < 300ms
* **Write/Post Routes** (Post announcement, ask doubt, submit quiz):
  * **P50**: < 150ms
  * **P95**: < 300ms
  * **P99**: < 600ms
* **File Upload/Multipart Routes** (Assignment submission, upload annotated feedback):
  * **P50**: < 800ms (for files < 5MB)
  * **P95**: < 2000ms
  * **P99**: < 5000ms (for maximum 10MB file limit)

### 3. API Error Rate
* **Target HTTP 5xx Error Rate**: **< 0.05%** of all inbound requests over any rolling 1-hour window.
* **Target HTTP 4xx Error Rate**: **< 1.0%** of all inbound requests (excluding auth validation errors).

---

## 6. Remediation Protocols

Whenever an SLA or KPI threshold is breached, the engineering and operations teams must execute the following structured response actions:

### Protocol A: File Upload Latency or Failure Breach (KPI-F03 / SLA File Uploads)
1. **Isolate Component**: Check S3/Cloud Storage response latency metrics. If Cloud Storage latency is normal, isolate Render backend Node disk and memory availability.
2. **Review Multer Buffer Size**: Verify server-side file buffers are not accumulating in application memory. Scale Node garbage collection if memory utilization exceeds 85%.
3. **Validate Content Types**: Verify if multipart form parser is locking on specific archive encoding formats (e.g. corrupted nested ZIP files). Update parser configuration rules.
4. **Fallback Action**: If cloud storage is completely unresponsive, redirect file upload target to temporary server-disk directory with automated cron synchronization to cloud storage once healthy.

### Protocol B: Doubt Drawer API Latency Breach (KPI-F05)
1. **Identify Database Scan Behavior**: Check MongoDB Atlas performance logs for unindexed query scans on the `doubts` collection.
2. **Apply Indexing**: If index lookup takes > 100ms, force compound index generation on `{ topicId: 1, createdAt: -1 }`.
3. **Payload Pagination**: If the query loads > 50 threads in a single fetch, apply pagination (`limit: 20`, `skip: N`) in `progressController.getTopicDetails` doubt arrays.
4. **Cache Responses**: Introduce Redis caching or in-memory LRU cache with a TTL of 60 seconds for active topic doubt lists.

### Protocol C: Quiz Explanation Mask Integrity Failure (KPI-F06)
1. **Emergency Shutoff**: Instantly deploy a hotfix environment variable flag `HIDE_ALL_EXPLANATIONS=true` to block explanations server-side across all modules.
2. **Audit API Pipeline**: Trace the `/api/topics/:topicId/assessment` route configuration and verify if Mongoose select projects are bypassed (e.g. check if model instances are serialized directly to JSON without projections).
3. **Re-Run Integration Tests**: Execute backend verification tests using `npm run test` specifically targeting assessment endpoints.
4. **Rollback**: If the bug is not immediately located, roll back the backend deploy to the last known secure commit.

### Protocol D: Badge Trigger Latency Breach (KPI-F07)
1. **Decouple Trigger Engine**: Check if the badge evaluation loops are running synchronously inside the HTTP request-response thread for quiz/exam submissions.
2. **Asynchronous Processing**: If execution blocks, move the badge evaluation code block out of the core route thread and wrap it in a `process.nextTick()` block or delegate it to a background worker queue.
3. **Optimize Mongoose Queries**: Verify that the badge checking logic does not execute repeated `.find()` commands for every quiz submission. Introduce cached checks for badge eligibility.
