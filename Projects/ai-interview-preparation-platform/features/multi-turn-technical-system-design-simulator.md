# Feature Specification: Multi-Turn Technical/System Design Simulator
## Feature Path: `features/multi-turn-technical-system-design-simulator.md`

### 1. Feature Overview
System Design and complex architectural interviews are conversational and dynamic. This simulator allows candidates to practice high-level system design topics (e.g., Designing URL Shorteners, Rate Limiters, or Real-time Feeds) with an AI mock interviewer. The interviewer adopts different corporate personas, retains memory of architectural changes proposed across multiple discussion turns, and evaluates choices like database selection and scaling patterns.

---

### 2. User Stories
* **US-9.1 (Persona Diversity)**: As a candidate, I want to select different interviewer personas (e.g., a "Strict Infrastructure Lead" or a "Collaborative Architect") to prepare for different types of interview styles.
* **US-9.2 (Dynamic Adjustments)**: As a candidate, when I suggest a database (e.g., "I will use MongoDB for my feed storage"), I want the AI to challenge that design choice and ask me to justify the selection against PostgreSQL or Cassandra.

---

### 3. Functional Requirements

#### 3.1 Interviewer Personas
* **FR-9.1.1**: The system must offer multiple interviewer profiles, including:
  * **The Strict Auditor**: Focuses heavily on edge cases, single-points-of-failure, scalability limits, and exact cost calculations.
  * **The Collaborative Mentor**: Guides the candidate, asks soft questions, offers slight hints, and values clean architecture.
  * **The Speed Advocate**: Focuses on performance, low latency, caching layers, and database query optimizations.

#### 3.2 System Design Challenges & Prompts
* **FR-9.2.1**: Offer pre-loaded system design prompts (e.g., "Design a Distributed Rate Limiter", "Design WhatsApp Backend", "Design YouTube video upload pipeline").
* **FR-9.2.2**: The AI must guide the user step-by-step:
  1. Gather Requirements (Functional & Non-Functional).
  2. Estimate Scale (QPS, storage, bandwidth).
  3. High-Level Design (APIs, core blocks).
  4. Deep-dive into scale issues (caching, database partitioning).

#### 3.3 Context Memory & Multi-Turn Conversations
* **FR-9.3.1**: Session state must track design choices (e.g., if the user chose SQL database in Turn 2, the AI shouldn't ask what database they are using in Turn 5, but rather refer to it: "Earlier you selected PostgreSQL; how will that scale when we hit 100k write QPS?").

#### 3.4 Technical Evaluation
* **FR-9.4.1**: Grade performance on:
  * Requirement gathering capability.
  * Correctness of scaling math (QPS calculations).
  * Design Trade-offs selection (latency vs consistency).
  * Communication and structure.

---

### 4. Technical Design Notes

#### Context Payload Design
When calling the AI conversation API, send a metadata context block:
```json
{
  "challenge_id": "system-design-url-shortener",
  "interviewer_persona": "strict_auditor",
  "current_stage": "scale_estimation",
  "architectural_decisions": {
    "db": "NoSQL - Key-Value store",
    "cache": "Redis",
    "calculated_qps": "10,000 writes/sec"
  }
}
```

---

### 5. Acceptance Criteria

| ID | Scenario | Given | When | Then |
| :--- | :--- | :--- | :--- | :--- |
| **AC-9.1** | Persona Selection | A user starts a session with the "Strict Infrastructure Lead" persona | AI introduces the question | The AI uses a formal, direct tone and immediately asks: "What are your non-functional scale targets for this system?" |
| **AC-9.2** | Decision Challenge | The candidate says: "I will use MySQL because it is simple." | Message is processed | The AI replies by checking if this decision aligns with the scaling goals (e.g., "Simple indeed, but how will we handle scaling writes globally with a single MySQL instance?"). |
| **AC-9.3** | Architectural Memory | Candidate shifts to a NoSQL approach | Conversing with AI | AI records the change in session state metadata to reference later in the feedback dashboard. |
