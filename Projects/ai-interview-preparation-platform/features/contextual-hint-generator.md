# Feature Specification: Contextual Hint Generator
## Feature Path: `features/contextual-hint-generator.md`

### 1. Feature Overview
The Contextual Hint Generator provides smart, progressive assistance to candidates when they get stuck on coding challenges. Instead of showing the full solution, it evaluates the user's current code, compares it with reference solutions, and serves incremental clues (ranging from conceptual hints to syntax reminders) to maintain the educational value of the mock interview.

---

### 2. User Stories
* **US-6.1 (Incremental Help)**: As a candidate, when I am stuck on a logic block, I want to click a button to get a slight hint rather than having to search the web for the solution.
* **US-6.2 (Prevent Spoilers)**: As a student, I want the hints to guide me step-by-step (e.g., first hint is conceptual, second is pseudo-code) so I am still challenged to solve it myself.

---

### 3. Functional Requirements

#### 3.1 Code Analysis & Context Awareness
* **FR-6.1.1**: The hint generator must ingest the user's active code state, the language selection, the problem description, and standard compiler error logs.
* **FR-6.1.2**: Analyze if the user's logic is heading in the right direction (e.g., using a DFS instead of BFS, incorrect pointer offsets, wrong loop condition).

#### 3.2 Progressive Guidance & Hint Levels
* **FR-6.2.1**: Implement a 3-tier progressive hint system per problem:
  * **Level 1 (Conceptual Clue)**: High-level guidance (e.g., "Consider using a two-pointer approach here starting from both ends.").
  * **Level 2 (Algorithm Direction)**: More specific advice or pseudo-code guidance (e.g., "If the sum is greater than the target, move the right pointer leftwards.").
  * **Level 3 (Syntax/Implementation)**: Highlight the exact area of the code needing change (e.g., "Look at line 14: your loop condition should be `left < right` instead of `left <= right`.").

#### 3.3 Solution Protection
* **FR-6.3.1**: The system must enforce a cooldown rate-limit (e.g., $60\text{ seconds}$ between hint requests) to prevent users from spamming hints to retrieve the solution.
* **FR-6.3.2**: Under no circumstances should the system generate a complete copy-pasteable solution code block in Level 1 or Level 2 hints.

---

### 4. Technical Design Notes

#### Hint Request Flow
```
[User Clicks "Get Hint"] 
       |
       v
[Backend counts hints requested in session (N)]
       |
       v
[Payload = User Code + Problem Specs + Session History]
       |
       v
[Gemini Prompt: "Provide Level N Hint for... Do not output complete code."]
       |
       v
[Return Dynamic Hint Text to UI]
```

---

### 5. Acceptance Criteria

| ID | Scenario | Given | When | Then |
| :--- | :--- | :--- | :--- | :--- |
| **AC-6.1** | Cooldown Enforcement | A user clicks "Get Hint" and receives a hint | User immediately clicks "Get Hint" again | Display a toast notification "Please wait 60s before requesting the next hint" and disable button. |
| **AC-6.2** | Progressive Level Tracking | A user requests a hint for the first time in a session | System processes request | Deliver a Level 1 hint, and increment the session's hint counter to 1. |
| **AC-6.3** | Level 3 Implementation Details | User requests a Level 3 hint on a loop issue | System processes request | Pinpoint the specific line and variable issue (e.g., "Check line 10, index `i` is out of bounds") without providing the entire fixed file. |
