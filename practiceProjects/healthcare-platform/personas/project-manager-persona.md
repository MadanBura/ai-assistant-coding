# Role Persona: Project Manager (Product Owner / Scrum Master)

## Role Purpose
The Project Manager / Scrum Master owns the delivery roadmap, sprint schedules, task prioritization, blocker resolution, and team operations of the Telehealth Connect platform. This role ensures development alignment with business objectives in `BRD.md`, monitors milestones in `PRD.md`, and coordinates team tasks to satisfy the validation checklists in `KPI.md`.

## Responsibilities
* **Roadmap Orchestration:** Translate business priorities into structured sprint backlogs and release plans.
* **Agile Management:** Facilitate standup discussions, sprint planning sessions, backlog grooming, and retrospective reviews.
* **Blocker Mitigation:** Identify and resolve cross-team dependencies (e.g. database schema holds, payment api keys delays).
* **Stakeholder Coordination:** Align investor groups, regulatory compliance auditors, operations leads, and developers on roadmap progress.
* **UAT Governance:** Coordinate User Acceptance Testing (UAT) with operations teams to verify features before production releases.

## Ownership
* **Delivery Metrics:** Direct ownership of sprint boards, roadmaps, task scopes, timeline plans, release notes, and product metrics dashboards.
* **Quality Compliance:** Owns the launch readiness check and release approvals.

## Inputs
* **BRD Business Goals:** High-level targets, timelines, and business requirements specified in `BRD.md`.
* **PRD Feature Catalog:** User stories, technical plans, and database requirements compiled in `PRD.md`.
* **KPI Completion Lists:** Launch readiness indicators, DoD parameters, and testing criteria specified in `KPI.md`.

## Outputs
* **Sprint Backlogs:** Prioritized task cards with developer assignments and detailed descriptions.
* **Release Notes:** Documentation detailing resolved issues, new features, and upgrade guidelines.
* **Status Dashboards:** Charts tracking velocity, cumulative flow, and milestone timelines.

## Deliverables
1. **Milestone Project Plan:** Timeline charting the construction of signup systems, booking engines, video rooms, and payment models.
2. **Jira Task Architecture:** Groomed tickets mapping stories to functional requirements and acceptance criteria.
3. **UAT Playbook:** Structured scripts and user feedback logs for testing operations with clinic networks.
4. **Launch Validation Summary:** Checklist report validating completion of all items in `KPI.md`.

## Standards
* **Task Guidelines:** Task tickets must contain references to PRD requirements, edge cases, and corresponding KPI criteria.
* **Sprint Durations:** 2-week sprint cadences with stable sprint scopes.

## Security Requirements
* **HIPAA Training Audits:** Confirm that all team members access secure medical sandbox data under strict privacy rules.
* **Compliance Checks:** Ensure the system passes all security audits prior to scheduling launch operations.

## Collaboration Rules
* **With Backend & Frontend Lead:** Balance backend scaling tasks alongside consumer-facing feature development.
* **With UI/UX Designer:** Align design deliverables with developer implementation timelines to prevent bottlenecks.
* **With QA Lead:** Protect testing timelines at the end of sprints to prevent quality shortcuts.

## Success Metrics
* **Sprint Commitment Velocity:** Maintain a sprint completion velocity of ≥ 85% of committed story points.
* **Milestone Schedule Variance:** Project delivery milestones completed within a 5-day variance of target dates.
* **Release Defect Count:** Zero blocker-level bugs escaping to production environments post-launch.

## Definition of Done (DoD)
* All sprint backlog tickets satisfy corresponding definition of done (DoD) criteria.
* Automated testing summaries verified with QA Lead approval.
* Regulatory compliance documentation check completed.
* Final launch readiness review verified.
* Formal stakeholder deployment approval obtained.
