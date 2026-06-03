# Feature Specification: Interactive Progress & Performance Dashboard
## Feature Path: `features/interactive-progress-performance-dashboard.md`

### 1. Feature Overview
The dashboard is the central hub for candidates to view analytical reports regarding their preparation. It aggregates historical scores from mock interviews, tracks active preparation streaks, compiles metrics into dynamic charts, and highlights focus areas needing improvement based on performance trends.

---

### 2. User Stories
* **US-2.1 (Overall Metrics)**: As a candidate, I want to see my general scores and overall progress when I open the application so I can quickly gauge my preparation readiness.
* **US-2.2 (Score Trends)**: As a candidate, I want to view my performance trends over time using graphs so I can see if my skills are improving.
* **US-2.3 (Focus Areas)**: As a user, I want to see visual callouts highlighting my top weaknesses so I can dedicate my studies to those areas.

---

### 3. Functional Requirements

#### 3.1 Progress Tracking & Streak Management
* **FR-2.1.1**: Track and display active daily practice streaks (number of consecutive days with at least one completed interview session).
* **FR-2.1.2**: Display total preparation hours and total sessions completed.

#### 3.2 Score Trends & Session Analytics
* **FR-2.2.1**: Interactive line chart showing general score trends (0-100 scale) over time, with filter options for 7 days, 30 days, or all-time.
* **FR-2.2.2**: Category breakdown showing performance in:
  * Coding Algorithm correctness.
  * System Architecture design.
  * Behavioral Communication delivery.

#### 3.3 Performance Charts
* **FR-2.3.1**: Display radar chart visualizing competency dimensions (e.g., Code Quality, Time Complexity, STAR structure, Elo rating, Tone Clarity).
* **FR-2.3.2**: Log list showing details of past attempts (Date, Interview Type, Score, Duration, link to detailed scorecard).

#### 3.4 Focus Area Insights
* **FR-2.4.1**: Display a "Focus Areas" card listing weak skills (e.g., "Recursion", "STAR structure - Results missing", "System Design - Caching strategies") based on scores below $60\%$.
* **FR-2.4.2**: Display dynamic "Recommended Practice" quick links redirecting users to matching topics.

---

### 4. Technical Design Notes

#### Architecture & Visualization
* **Frontend library**: Use lightweight Chart.js or Recharts to render interactive canvas charts.
* **Aggregations**: Implement scheduled worker tasks or database view summaries to pre-calculate progress points (avoiding heavy CPU queries on every dashboard load).

#### Proposed API Endpoints
* `GET /api/dashboard/summary` — Returns lifetime session count, active streak, and hours spent.
* `GET /api/dashboard/scores` — Returns time-series list of overall scores for plotting.
* `GET /api/dashboard/insights` — Returns computed weak categories and quick links.

---

### 5. Acceptance Criteria

| ID | Scenario | Given | When | Then |
| :--- | :--- | :--- | :--- | :--- |
| **AC-2.1** | Streak Counter | A user completes their first session of a new day | Session is submitted successfully | The user's active streak increment by 1. |
| **AC-2.2** | Radar Chart rendering | A user with no completed interviews loads dashboard | Dashboard starts rendering | Render chart with flat placeholder lines or a "Start your first mock to see insights" message. |
| **AC-2.3** | Interactive Filtering | A user toggles time filter from 7 days to 30 days | Toggle clicked | Chart instantly updates points and axis scales without page reload. |
