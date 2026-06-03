# Feature Specification: Sprint Burndown & Velocity Dashboard

## 1. Executive Summary & Value Proposition
Data-driven teams need clear visibility into their past performance and delivery trajectories. This feature implements project metrics dashboards, displaying an interactive Sprint Burndown chart (ideal vs. actual trajectory) and a team velocity chart that tracks story points completed across multiple sprint cycles.

---

## 2. Target User Stories
* **Story 1:** As a Scrum Master, I want to view our Sprint Burndown chart during standup, so I can see if we are on track to complete the sprint goals.
* **Story 2:** As a PM, I want to analyze team velocity over the last 5 sprints, so I can plan our next product commitments accurately.
* **Story 3:** As an Executive, I want to see high-level project health metrics, including task completion rates and bug ratios.

---

## 3. Detailed Functional Scope

### 3.1. Burndown Charts
* Renders a line graph using a library like Chart.js or Recharts.
* **X-Axis:** Days in the active Sprint cycle.
* **Y-Axis:** Total estimated Story Points.
* **Ideal Line (Grey):** Diagonal starting at total sprint story points on Day 1 and ending at 0 on the final day.
* **Actual Line (Purple):** Dynamic plotting of outstanding incomplete story points remaining. Decrements when a task card is moved to "Done".

### 3.2. Velocity Metrics & Historical Trends
* Bar chart tracking past sprint cycles.
* **X-Axis:** Completed Sprints.
* **Y-Axis:** Total Story Points.
* Plots two bars per sprint:
  * Planned: Estimated story points committed at start of Sprint.
  * Completed: Total story points of tasks moved to "Done" status when completed.

### 3.3. Sprint Analytics & Health Tracking
* Text indicators and widgets showing:
  * Sprint completion rate (%).
  * Scope Change Rate (tasks added to sprint after start date).
  * Task breakdown by priority levels.

### 3.4. Performance Insights
* Natural language text summarizing team health, e.g. "On average, the team completes 85% of planned story points. Consider reducing planned capacity next sprint."

---

## 4. API Interface Design

### 4.1. Get Burndown Data
* **Endpoint:** `GET /api/v1/projects/:projectId/sprints/:sprintId/burndown`
* **Headers:** `Authorization: Bearer <JWT>`
* **Response Body (200 OK):**
  ```json
  {
    "sprintName": "Sprint 1",
    "totalPoints": 42,
    "days": [
      { "date": "2026-06-03", "idealPoints": 42.0, "actualPoints": 42.0 },
      { "date": "2026-06-04", "idealPoints": 39.0, "actualPoints": 42.0 },
      { "date": "2026-06-05", "idealPoints": 36.0, "actualPoints": 34.0 },
      { "date": "2026-06-06", "idealPoints": 33.0, "actualPoints": 34.0 }
    ]
  }
  ```

---

## 5. UI/UX Specifications
* **Dashboard Layout:** Sleek slate dashboard widgets with rounded corners. Highly visual dark charts matching styling systems.
* **Interactive Tooltips:** Hovering over chart data points displays detailed tooltips showing dates, remaining tasks, and delta percentages.

---

## 6. Acceptance Criteria & Verification

### Automated Verification
1. **Burndown Algorithm Validation:** Verify the API outputs correct coordinate calculations for ideal linear points based on sprint duration.
2. **Done State Evaluation:** Write database test verifying that only tasks in status `done` are subtracted from outstanding actual story points.

### Manual Verification
1. Open the analytics dashboard. Verify that the Burndown Chart ideal line is plotted accurately.
2. Move a 5-story-point issue to "Done". Verify that the actual burndown line updates and decrements by 5 points.
