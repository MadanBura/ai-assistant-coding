# Feature Specification: Automated Scorecard & Study Roadmap Generator
## Feature Path: `features/automated-scorecard-study-roadmap-generator.md`

### 1. Feature Overview
This feature generates a comprehensive evaluation report (scorecard) and a personalized learning guide immediately after a candidate completes any interview session. It provides an overall percentage score, a category breakdown (e.g., Code Efficiency, Communication, Architecture), a line-by-line code review, and dynamically compiles target study links to help the user master their weak points.

---

### 2. User Stories
* **US-10.1 (Comprehensive Feedback)**: As a user, I want a detailed performance scorecard immediately after my session so I can see what I did well and what I failed at.
* **US-10.2 (Line-by-Line Code Review)**: As a coder, I want to see suggestions for improving specific parts of my code (e.g., time/space complexity or cleaner syntax) so that I can practice refactoring.
* **US-10.3 (Personalized Roadmap)**: As a candidate, I want the system to suggest exactly what topics and articles I need to study next based on my weaknesses, so I don't waste time on topics I've already mastered.

---

### 3. Functional Requirements

#### 3.1 Interview Scoring & Skill Assessment
* **FR-10.1.1**: Calculate an overall score ($0\text{-}100$) based on weights assigned to individual rubric items (e.g., $40\%$ Correctness, $30\%$ Complexity, $30\%$ Code Readability).
* **FR-10.1.2**: Generate rating badges for key skill metrics (e.g., "Time Complexity: Optimal", "Space Complexity: Suboptimal", "Edge Cases: Handled").

#### 3.2 Code Review Panel
* **FR-10.2.1**: Render a side-by-side or inline code comparison view highlighting the candidate's original code and the AI's optimized refactoring.
* **FR-10.2.2**: Provide hover comments on specific lines of code pointing out bad habits, syntax warnings, or optimization points.

#### 3.3 Study Roadmap & Recommendations
* **FR-10.3.1**: Select 1–3 target topics matching the candidate's weak areas from a structured knowledge base (e.g., Binary Search, Graph Traversals, Sliding Window, Database Indexing, STAR response structuring).
* **FR-10.3.2**: Generate a customized step-by-step study checklist (e.g., "Step 1: Read about Hash Maps vs. Trees, Step 2: Solve problem 'Two Sum', Step 3: Retake this mock interview").

---

### 4. Technical Design Notes

#### Scoring Weight Matrix
```
Interview Type   | Metric 1 (Weight)   | Metric 2 (Weight) | Metric 3 (Weight)     | Metric 4 (Weight)
-----------------+---------------------+-------------------+-----------------------+---------------------
Coding           | Correctness (40%)   | Complexity (30%)  | Code Cleanliness (20%)| Communication (10%)
Behavioral       | STAR Structure (40%)| Impact/Metric(30%)| Clarity/Tone (20%)    | Value Fit (10%)
System Design    | Requirements (20%)  | Architecture (40%)| Tradeoffs (30%)       | Communication (10%)
```

---

### 5. Acceptance Criteria

| ID | Scenario | Given | When | Then |
| :--- | :--- | :--- | :--- | :--- |
| **AC-10.1** | Scorecard Generation | A user completes an interview session and clicks "Submit" | System runs generation | Scorecard displays within $5.0\text{ seconds}$ with detailed scoring segments. |
| **AC-10.2** | Study Plan Compilation | User score is low ($< 50\%$) on Recursion | System displays feedback | The study roadmap panel lists "Recursion Basics" articles and 2 beginner-level practice problems. |
| **AC-10.3** | Code Diff View | User views Code Review tab | Pane loads | Show side-by-side differences with deletions highlighted in red and additions in green. |
