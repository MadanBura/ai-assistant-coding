# Key Performance Indicators & Project Acceptance Criteria (KPI)
## SaaS Project Management Platform (Jira/Trello Alternative)

This document establishes the quantitative metrics (KPIs) and qualitative acceptance criteria (AC) used to evaluate the success of the platform development and operational phase.

---

### 1. Key Performance Indicators (KPIs)

#### 1.1. Business & Product Engagement KPIs
* **Tenant Activation Rate:** $\ge 70\%$ of signed-up organizations must create at least one project and add three tasks within the first 48 hours.
* **User Retention Rate:** Monthly Active Users (MAU) / Weekly Active Users (WAU) ratio of $\ge 35\%$.
* **Collaboration Frequency:** Average of $\ge 5$ comments or status modifications per active user per week.
* **Conversion Rate (Free to Paid):** $\ge 3\%$ of active workspace organizations converting to paid tiers within 90 days.

#### 1.2. Technical & Operations KPIs
* **System Availability (Uptime):** $\ge 99.9\%$ average monthly uptime (excluding planned maintenance).
* **Drag-and-Drop Latency:** Average round-trip latency for issue status updates must be $\le 100\text{ms}$ under standard network conditions.
* **Server Performance:** P95 response times for API requests must remain $\le 200\text{ms}$.
* **Test Coverage:** Minimum unit and integration test coverage of **80%** across frontend and backend services.
* **Websocket Persistence:** $\le 0.5\%$ unexpected socket disconnection rate per 24 hours.

---

### 2. Whole Project Acceptance Criteria

Below is the verification checklist mapping functional features from [brd.md](file:///d:/vibeCoding2026/Projects/saas-project-management-tool/brd.md) to their testing and validation boundaries.

#### AC-1: Multi-Tenancy & Access Controls
* **AC-1.1:** A user can sign up and immediately claim a unique slug for their workspace (e.g., `/w/acme-engineering`).
* **AC-1.2:** Database isolation must verify that workspace data from `Workspace A` is completely inaccessible to users in `Workspace B` (zero cross-tenant leak).
* **AC-1.3:** An `Admin` role can add/remove members and change subscription details. A `Member` can create and edit projects/tasks. A `Viewer` role has strictly read-only access (cards cannot be dragged, comments cannot be written).

#### AC-2: Project Setup & Custom Boards
* **AC-2.1:** Creation screen supports selection of Scrum (adds Backlogs & Sprints functionality) and Kanban (adds custom column workflows immediately).
* **AC-2.2:** Users must be able to rename columns, delete columns, and change column sequence order. Changes are saved globally for all workspace members.

#### AC-3: Issue Lifecycle & Board Management
* **AC-3.1:** Drag-and-drop must operate smoothly. Moving a card updates the visual stage immediately and dispatches an API patch in the background.
* **AC-3.2:** Double-clicking or clicking a card must open a detailed modal overlay displaying description, assignees, priorities, subtask checklist, comments feed, and changelog.
* **AC-3.3:** When an issue is moved to a column designated as "Done" or "Completed," its status updates globally and triggers a visual indicator.

#### AC-4: Scrum Sprints & Planning
* **AC-4.1:** The Backlog view must allow users to create issues, arrange them in priority hierarchy, and drag them into Sprint containers.
* **AC-4.2:** Active sprints page shows columns only containing issues assigned to the currently active sprint.
* **AC-4.3:** Clicking "Complete Sprint" triggers a dialog requiring the user to designate where incomplete issues are sent (Backlog or NEXT sprint container). Completion records are locked for future burndown analytics.

#### AC-5: Collaboration & Real-Time Sync
* **AC-5.1:** Adding comments must post dynamically without page refresh. Comments must support markdown notation.
* **AC-5.2:** @Mentioning a user in comments or description notifies that user with a dynamic badge on their application dashboard and triggers an notification email if they are offline.
* **AC-5.3:** Multiple users looking at the same board must see real-time card shifts using WebSocket protocols when another member modifies columns.

#### AC-6: Dashboards & Reporting Analytics
* **AC-6.1:** Scrum projects must render an interactive Burndown Chart plotting ideal progress slope vs. actual completed story points.
* **AC-6.2:** Dashboard must load within 1.5 seconds and display cumulative tasks completed per team member, as well as outstanding priorities.

#### AC-7: Billing & Account Downgrades
* **AC-7.1:** Subscriptions must use Stripe checkout flows. Upon payment success, Stripe webhook must update the workspace `plan_type` schema to `team` or `enterprise`.
* **AC-7.2:** Workspace downgrade or credit-card expiration must automatically lock administrative modifications to teams if users exceed Free-Tier limits (e.g., maximum of 10 users).
