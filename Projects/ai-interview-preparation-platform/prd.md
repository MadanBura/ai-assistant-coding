# Product Requirements Document (PRD)
## Project: AI-Powered Interview Preparation Platform

This document describes the product requirements, design guidelines, feature specifications, and technical workflows for developers and designers implementing the AI-Powered Interview Prep Platform.

---

### 1. Document Control & Overview
* **Product Name**: AI-Powered Interview Preparation Platform (working title: "MockAI")
* **Status**: Draft
* **Target Release**: Q3 2026

---

### 2. User Personas & Target Segments

#### Persona A: "Alex" — The Aspiring Junior Developer
* **Role**: Recent Computer Science Graduate.
* **Goals**: Land an entry-level software engineer job, overcome anxiety with coding tasks, learn coding patterns.
* **Frustrations**: Unclear reasons for code failures, lack of guidance on time/space complexity optimization, generic online tutorial questions that do not simulate real interview pressure.

#### Persona B: "Sarah" — The Transitioning Mid-Level Engineer
* **Role**: Mid-level Full Stack Developer aiming for a System Design / Tech Lead role at a tier-1 tech firm.
* **Goals**: Improve behavioral communication using the STAR structure, practice system design conversations, receive feedback on architecture choices.
* **Frustrations**: Hard to find mock interview partners for specialized topics; hiring a personal coach is too expensive.

---

### 3. User Journey & Product Flows

#### 3.1 Coding Interview Flow
```
[Select Coding Practice] -> [Select Language & Difficulty] -> [Enter Editor Workspace]
       |
       v
[Read AI Interviewer Prompt] -> [Write & Run Code] -> [Pass Test Cases] -> [Submit Code]
       |
       v
[View Scorecard & Line-by-Line AI Improvement Suggestions]
```

#### 3.2 Behavioral/Technical Interview Flow
```
[Select Interview Topic] -> [Choose Voice or Text Mode] -> [AI asks introductory question]
       |
       v
[User responds (voice/text)] -> [AI dynamically parses and asks follow-up Qs (3-4 turns)]
       |
       v
[Session terminates] -> [Feedback engine evaluates responses & structure (STAR check)]
```

---

### 4. Functional Specifications & User Stories

#### 4.1 Module 1: Dashboard & Customization (Epic-1)
* **User Story**: As a candidate, I want to configure my target job role and track my preparation performance so that I can focus on my areas of weakness.
* **Requirements**:
  * **FR-1.1**: User registration/login via email or OAuth (Google/GitHub).
  * **FR-1.2**: User Profile setup where the user defines their target title (e.g., Frontend Engineer, Backend Engineer, System Architect, Engineering Manager) and target skill level.
  * **FR-1.3**: Progress charts showing cumulative session counts, category scores (Coding, Behavioral, System Design), and score trends over the last 30 days.

#### 4.2 Module 2: Coding Simulator Workspace (Epic-2)
* **User Story**: As a coder, I want to write and execute code in an interactive interface while an AI mock interviewer interacts with me, so that I can simulate a real-world coding interview environment.
* **Requirements**:
  * **FR-2.1**: **Workspace Interface**: A three-pane layout featuring:
    * Left Pane: Question description & constraints, along with an interactive chat panel where the AI Interviewer asks questions, hints, and follows up.
    * Right Upper Pane: Robust text editor supporting line numbering, basic autocompletion, syntax highlighting, and language toggle.
    * Right Lower Pane: Terminal/console display showing compilation logs, output, execution time, and test case status (Pass/Fail).
  * **FR-2.2**: **Sandboxed Execution**: A secure back-end runner that compiles and executes code inside containerized/isolated environments. Supported languages: Python, JavaScript, Java, C++.
  * **FR-2.3**: **AI Hint Engine**: A button to "Ask Interviewer for a Hint" which sends the current code state to the LLM and streams back a helpful guidance response without revealing the exact solution.

#### 4.3 Module 3: Dynamic Behavioral & Technical Chat Workspace (Epic-3)
* **User Story**: As a candidate, I want to participate in an interactive chat/voice interview session with dynamic follow-ups, so that I can practice articulating thoughts and concepts clearly.
* **Requirements**:
  * **FR-3.1**: **Voice-to-Text Integration**: Support browser-based speech-to-text recording, allowing users to speak their answers.
  * **FR-3.2**: **Multi-Turn Interview Engine**: The AI interviewer acts as a persona (e.g., "Demanding Architect", "Friendly Recruiter") and must maintain context over a 3-5 response chain, asking probing questions rather than jumping to feedback immediately.

#### 4.4 Module 4: Analytics & Feedback Engine (Epic-4)
* **User Story**: As a user, I want a detailed breakdown of my interview session performance so that I can understand where to improve.
* **Requirements**:
  * **FR-4.1**: **Automated Grading Rubric**: Upon session completion, evaluate criteria including:
    * *Coding*: Correctness, Time Complexity, Space Complexity, Code Readability, and Edge Case handling.
    * *Behavioral*: Structure (STAR alignment), Tone/Clarity, Depth of Action, and Cultural/Value Alignment.
  * **FR-4.2**: **Improvement Feed**: Provide rewritten/refactored code suggestions side-by-side with user-submitted code.
  * **FR-4.3**: **Personalized Study Roadmap**: Generate links to topics, documentation, and specific exercises based on the gaps identified in the session.

---

### 5. Non-Functional & Technical Requirements

#### 5.1 Security & Sandboxing
* User-submitted code must be run in secure containers with restricted system call access, disabled network interfaces, memory ceilings (256MB), and timeout limits (2 seconds).
* No user execution can access host machine storage or environment variables.

#### 5.2 Accessibility & Design (UI/UX)
* Dark mode is the default layout, styled with high-contrast elements using modern glassmorphism aesthetic guidelines.
* Screen-reader friendly layout for question text, console readouts, and feedback dashboards.
* Responsive grid layout built on CSS Grid and Flexbox to support multiple viewport resolutions seamlessly.

---

### 6. Draft Data Models

#### `User` Schema
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "target_role": "string",
  "target_level": "string",
  "created_at": "datetime"
}
```

#### `InterviewSession` Schema
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "type": "enum[coding, behavioral, conceptual]",
  "status": "enum[in-progress, completed, abandoned]",
  "started_at": "datetime",
  "ended_at": "datetime"
}
```

#### `Attempt` Schema (Coding)
```json
{
  "id": "uuid",
  "session_id": "uuid",
  "code_state": "text",
  "language": "string",
  "test_results": {
    "passed": "integer",
    "total": "integer"
  },
  "feedback_report": {
    "score": "integer",
    "complexity_analysis": "text",
    "readability_score": "integer",
    "refactoring_hints": "text"
  }
}
```
