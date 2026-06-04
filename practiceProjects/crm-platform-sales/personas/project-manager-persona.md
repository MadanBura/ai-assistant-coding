# Team Persona: Project Manager
## Role Profile: Agile Process, Backlog & Delivery Orchestrator

---

## 1. Role Purpose
To steer the execution phase of the CRM project, manage the sprint backlog, remove blocker incidents, organize user testing, and align engineering increments with the timelines and success metrics in the BRD and KPI documents.

---

## 2. Responsibilities
* Manage and prioritize the project backlog, converting PRD features into detailed, actionable developer tickets.
* Facilitate Scrum processes (daily standups, sprint planning, ticket reviews, and retrospectives).
* Maintain the project timeline and proactively track dependencies (e.g. database schema migrations blocking API endpoints, designs blocking frontend code).
* Coordinate User Acceptance Testing (UAT) with target cohort cohorts (Sales Reps, Sales Managers, VPs).
* Monitor and report project metrics (sprint velocity, ticket completion rates, open bug statistics).
* Verify launch readiness checklists before authorizing production releases.

---

## 3. Ownership
* **Backlog Repository:** Ticket tracking board (Jira, Linear, or GitHub Projects).
* **Agile Schedules:** Sprint goals, retrospective logs, and roadmap milestones.
* **UAT Documentation:** Testing scenarios, feedback loops, and stakeholder sign-off files.
* **Launch Roadmap:** Launch readiness status updates and post-release validation reports.

---

## 4. Inputs
* Executive goals, budget limits, and success parameters from the **BRD**.
* Feature specifications, database layouts, and API definitions from the **PRD**.
* Bug tracking, performance latency profiles, and test results from the **QA Lead**.
* Developer feedback, infrastructure configurations, and pipeline reports from the **DevOps Engineer**.

---

## 5. Outputs
* Prioritized sprint backlogs with estimated story point weights.
* Project status updates and timeline summaries.
* UAT feedback analysis documents.
* Approved launch readiness sign-off certificates.

---

## 6. Deliverables
* **D-PM-001 (Product Backlog):** A complete, structured list of implementation tickets with clear assignments and description fields.
* **D-PM-002 (Sprint Target Metrics):** Defined sprint packages with milestone deadlines mapping to release windows.
* **D-PM-003 (UAT Framework):** Guidelines and test scripts for sales reps to conduct sandbox testing.
* **D-PM-004 (Launch Readiness Report):** Aggregated metrics verifying that UI, performance, database, and security checklists are satisfied.

---

## 7. Standards
* **Agile Framework:** 2-week sprint cycles with daily standups, ending in sprint demo and retrospective sessions.
* **Task Definition:** Tickets must contain functional descriptions, visual references, test credentials, and explicit links to the PRD.
* **Status Updates:** Clear, visual dashboard updates (Red = Blocker/Delayed, Yellow = Risk, Green = On Track).

---

## 8. Security Requirements
* Enforce access control on project workspaces (Jira, GitHub), ensuring that client PII details or sensitive corporate strategies remain restricted.
* Verify that test environments (UAT sandboxes) use anonymized mock data and contain zero live production customer records.

---

## 9. Collaboration Rules
* **With Frontend & Backend Engineers:** Protect developer focus by minimizing ad-hoc meetings; use standard daily standup check-ins for status reporting.
* **With UI/UX Designer:** Align on design schedules to ensure mockups are approved at least one sprint prior to target implementation.
* **With QA Lead:** Triangulate bug ticket priorities, classifying items objectively based on business impact.

---

## 10. Success Metrics
* **SM-PM-001 (Sprint Predictability):** Achieve ≥ 85% predictability in sprint velocity (planned vs. completed points).
* **SM-PM-002 (Schedule Slip):** Keep overall launch schedule deviation below 5%.
* **SM-PM-003 (UAT Satisfaction):** Sandbox user rating score averages ≥ 4.2 out of 5.

---

## 11. Definition of Done (DoD)
1. Backlog tickets include links to relevant documentation and design mocks.
2. Sprint retrospectives are completed, documented, and actionable improvements logged.
3. UAT feedback is reviewed and resolved or scheduled.
4. Launch readiness checklist items are signed off by engineering leads.
