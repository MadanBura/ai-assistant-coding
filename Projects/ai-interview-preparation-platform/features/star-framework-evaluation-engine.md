# Feature Specification: STAR Framework Evaluation Engine
## Feature Path: `features/star-framework-evaluation-engine.md`

### 1. Feature Overview
The STAR Framework Evaluation Engine is a core analysis system designed for behavioral interviews. It parses user responses to check for the structural components of the **STAR method**: **S**ituation, **T**ask, **A**ction, and **R**esult. The engine grades each section, highlights gaps (e.g., if a candidate explained the situation but omitted their specific action), and provides structured rewrites.

---

### 2. User Stories
* **US-8.1 (Structure Verification)**: As a candidate, when I answer a behavioral question, I want to know if I missed describing my specific tasks or the final project results, so that I can improve my storytelling structure.
* **US-8.2 (Constructive Suggestions)**: As a job seeker, I want to receive a template suggestion on how to rephrase my answer to emphasize my impact and results.

---

### 3. Functional Requirements

#### 3.1 STAR Component Detection
* **FR-8.1.1**: The evaluation engine must parse transcripts of behavioral responses.
* **FR-8.1.2**: Break down the response and classify segments into:
  * **Situation**: Context of the story.
  * **Task**: Responsibilities/goals in that situation.
  * **Action**: Specific actions taken by the candidate (focusing on "I" rather than "we").
  * **Result**: Measurable outcomes, metrics, lessons learned.

#### 3.2 Response Scoring & Gap Analysis
* **FR-8.2.1**: Grade each of the 4 dimensions on a score of 1 to 5.
* **FR-8.2.2**: Highlight structural gaps. If a section is missing or weak (e.g., Score $< 3$), mark it as "Missing/Incomplete" and highlight the impact (e.g., "Without a Result, the interviewer cannot measure the success of your actions.").

#### 3.3 Feedback & Improvement Recommendations
* **FR-8.3.1**: Display side-by-side:
  * Candidate's original transcript.
  * AI-suggested rewrite incorporating the missing sections (in brackets/highlights to show where detail is needed).
* **FR-8.3.2**: Provide behavioral bullet points of advice (e.g., "Use active verbs like 'orchestrated', 'streamlined', 'negotiated' instead of passive phrases.").

---

### 4. Technical Design Notes

#### Evaluation Criteria
The system uses the LLM to run semantic classification on the answer.
Prompt constraints:
- Must separate analysis into key JSON blocks: `situation`, `task`, `action`, `result`.
- If a block has $< 15$ words or is absent, mark `present: false`.
- Calculate an overall STAR structure score out of 20, mapped to a 0-100 scale.

---

### 5. Acceptance Criteria

| ID | Scenario | Given | When | Then |
| :--- | :--- | :--- | :--- | :--- |
| **AC-8.1** | No Result Scenario | A candidate submits an answer detailing a migration but fails to mention the end result (performance improvement, success) | Evaluation runs | System reports "Result segment not detected" with score 1/5 for Result and overall scorecard deduction. |
| **AC-8.2** | Metrics Callout | A user describes results but only uses qualitative words ("it was very fast") | Evaluation runs | System prompts: "Tip: Quantify your results. Add specific numbers (e.g., 'reduced latency by 30%', 'saved 10 engineering hours')." |
| **AC-8.3** | Individual Action Check | A user describes a story using "we did this, we built that" | Evaluation runs | System generates a warning: "Focus on your individual contributions. Change 'we' to 'I' where you performed the tasks." |
