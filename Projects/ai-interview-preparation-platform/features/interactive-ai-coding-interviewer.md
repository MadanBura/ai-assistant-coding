# Feature Specification: Interactive AI Coding Interviewer
## Feature Path: `features/interactive-ai-coding-interviewer.md`

### 1. Feature Overview
This feature governs the behavior of the AI Mock Interviewer during coding challenges. Instead of acting as a simple code evaluator, the AI acts as a human interviewer: introducing the question, discussing solution approaches, prompting candidates to explain complexity, asking questions about edge cases, and dynamically providing hints when the candidate is stuck.

---

### 2. User Stories
* **US-5.1 (Scenario Simulation)**: As a candidate, I want the AI to start the session by introducing the problem and asking me to explain my plan before coding, so that it mimics a real-world FAANG interview.
* **US-5.2 (Follow-up Questions)**: As a user, when I write a solution, I want the AI to ask me why I chose a specific data structure or how I would improve the time complexity.
* **US-5.3 (Hints)**: As a candidate, when I get stuck, I want to chat with the AI to ask questions and get incremental guidance rather than an outright answer.

---

### 3. Functional Requirements

#### 3.1 AI Questioning & Interview Lifecycle
* **FR-5.1.1**: The AI must guide the user through discrete stages:
  1. **Clarification**: Introduce problem, wait for the user to ask clarifying questions or explain their strategy.
  2. **Coding**: Prompt the user to start coding, monitoring progress and code execution reports.
  3. **Optimization / Follow-up**: Ask follow-up questions about space/time complexity, alternative approaches, and edge cases.
* **FR-5.1.2**: Standard system instructions defining the interviewer persona: "You are a senior tech interviewer. Keep answers concise, ask open-ended questions, do not give away code directly, guide candidates using Socratic questioning."

#### 3.2 Streaming Responses
* **FR-5.2.1**: Integrate with Gemini API supporting Server-Sent Events (SSE) to stream answers character-by-character to the client.
* **FR-5.2.2**: UI must display typing indicators while the stream is connecting.

#### 3.3 Follow-up Questions & Context Retention
* **FR-5.3.1**: The backend session must maintain the conversation history (context retention) up to 20 turns.
* **FR-5.3.2**: Trigger automatic AI questions when the user runs tests or submits code (e.g., if code fails tests, the AI might suggest: "Looks like your code is failing on negative input inputs. How can you handle those?").

---

### 4. Technical Design Notes

#### Prompt Architecture (System Instructions Outline)
```markdown
You are simulating a software engineering interview for a [Target Role] with level [Experience Level].
The user is solving the problem: [Problem Title]
Stages:
- Stage 1: Clarification. Do not write code yet. Ask the user for their approach.
- Stage 2: Coding. Let them write code. Only intervene if asked, if they run compilation errors, or if they request a hint.
- Stage 3: Optimization. Ask them about time/space complexity and potential optimizations.
```

#### Proposed API Endpoints
* `POST /api/interview/session/start` — Spawns a new session with initial LLM prompt.
* `POST /api/interview/session/message` — Sends user text input + current code editor snippet, returning streamed AI response.

---

### 5. Acceptance Criteria

| ID | Scenario | Given | When | Then |
| :--- | :--- | :--- | :--- | :--- |
| **AC-5.1** | Session Start | A user clicks "Start Coding Interview" | System initializes | AI starts the chat by saying "Hello! Today we will solve [Problem Name]. Let me know how you plan to approach this before writing code." |
| **AC-5.2** | Code-Aware Response | User code contains a clear bug, and the user asks "Why is my code failing?" | User sends message | AI identifies the logical bug in the context but explains it conceptually rather than giving the correct code block. |
| **AC-5.3** | Context preservation | Conversation is at turn 10 | User references a previous concept ("like I said in my first approach") | AI correctly understands the reference from the context history. |
