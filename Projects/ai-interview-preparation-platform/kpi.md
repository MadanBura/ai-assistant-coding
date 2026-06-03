# Key Performance Indicators & Acceptance Criteria (KPI)
## Project: AI-Powered Interview Preparation Platform

This document outlines the measurable goals (KPIs) and the project acceptance criteria (AC) mapped back to the [brd.md](file:///d:/vibeCoding2026/Projects/ai-interview-preparation-platform/brd.md) file.

---

### 1. Key Performance Indicators (KPIs)

#### 1.1 Product & User Experience KPIs
* **User Satisfaction Score (CSAT)**: Maintain a CSAT of $\ge 4.2 / 5.0$ collected via post-session user feedback surveys.
* **Interview Session Completion Rate**: At least $75\%$ of initiated mock interviews should be completed by the user.
* **Weekly Active Users (WAU) Growth**: Establish a target of $15\%$ month-over-month growth in active users.
* **Retention Rate**: Target a Day-7 retention rate of $\ge 30\%$ for new sign-ups.

#### 1.2 Technical & Operational KPIs
* **AI Feedback Generation Latency**: 
  * Streaming responses must begin within $1.5\text{ seconds}$.
  * Final performance scorecard generation must complete within $5.0\text{ seconds}$ after session submission.
* **System Availability / Uptime**: Target $99.9\%$ system uptime (excluding planned maintenance).
* **Code Sandbox Safety**: Zero ($0$) security breaches or escape exploits from the execution environment.
* **Speech-to-Text Accuracy (for Voice Prep)**: Achieve a Word Error Rate (WER) of $< 10\%$ under normal audio conditions.

---

### 2. Project Acceptance Criteria (AC)

Mapped to the Business Requirements defined in [brd.md](file:///d:/vibeCoding2026/Projects/ai-interview-preparation-platform/brd.md).

#### AC-1: Coding Interview Practice (Mapped to BR-1, BR-4)
* **AC-1.1**: The system must provide a code editor that supports syntax highlighting, auto-indentation, and keybinds for at least 4 programming languages: Python, JavaScript, Java, and C++.
* **AC-1.2**: Users must be able to execute their code against standard test cases (both visible and hidden).
* **AC-1.3**: The code sandbox must isolate executions, imposing limits (e.g., maximum execution time of $2\text{ seconds}$ and memory cap of $256\text{ MB}$) to prevent resource exhaustion or malicious code execution.

#### AC-2: Behavioral Interview Practice (Mapped to BR-1, BR-2)
* **AC-2.1**: The system must support text-based and voice-based question-and-answer interactions.
* **AC-2.2**: The AI must guide the user through a multi-turn conversation (minimum 3 turns) asking follow-up questions tailored to the candidate's responses.
* **AC-2.3**: The AI must evaluate the candidate's answers using the STAR format (Situation, Task, Action, Result) and detect structural gaps.

#### AC-3: Technical Conceptual Practice (Mapped to BR-1, BR-2)
* **AC-3.1**: Users must be able to choose a tech stack or domain topic (e.g., System Design, Database Normalization, Web Security).
* **AC-3.2**: The AI must run interactive technical drill sessions, checking theoretical understanding and application of concepts.

#### AC-4: AI Feedback Engine (Mapped to BR-3)
* **AC-4.1**: Post-interview, the engine must generate a structured report outlining:
  * Overall Score ($0-100$).
  * Domain-specific breakdown scores (e.g., Syntax/Algorithm, Architecture, Communication).
  * Direct highlight of key mistakes or anti-patterns.
  * Practical, actionable suggestions for improvement.
* **AC-4.2**: The feedback report must be saved to the user's account history for future reference.

#### AC-5: Performance Dashboard (Mapped to BR-5, BR-6)
* **AC-5.1**: Users must be able to view their profile dashboard displaying progress graphs (average scores over time, number of sessions completed, target role status).
* **AC-5.2**: The UI must adapt responsively to standard desktop, laptop, and tablet screen dimensions.
