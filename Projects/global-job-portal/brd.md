# Business Requirements Document (BRD)
## Project: Global AI-Powered Job Portal

---

### 1. Executive Summary
#### 1.1 Problem Statement
Traditional job portals often act as static bulletin boards. Candidates face "black hole" application processes where they submit resumes and never receive updates, leading to anxiety and poor engagement. Employers are overwhelmed by a high volume of unqualified applications, making manual screening tedious and time-consuming. Additionally, keyword-based search algorithms fail to understand semantic context, resulting in poor matches for both parties.

#### 1.2 Vision & Value Proposition
The **Global AI-Powered Job Portal** aims to bridge this gap by transforming job searching and recruitment into an active, transparent, and intelligent experience. 
* **For Candidates:** A platform that provides real-time application tracking (pipeline view) and personalized, AI-driven job recommendations matching their skills and career trajectory.
* **For Employers:** An automated screening and pipeline management system that uses semantic AI match-scoring to bubbles up the most qualified candidates instantly.

---

### 2. Business Objectives & Goals
* **Time-to-Hire Reduction:** Decrease the average screening and shortlisting phase for recruiters by 40% using AI scoring.
* **Application Transparency:** Achieve a 100% notification rate for candidates regarding status updates of their applications.
* **User Retention & Engagement:** Increase active candidate monthly return rate by 30% through relevant, personalized job recommendations.
* **AI Match Accuracy:** Ensure at least 80% of candidates recommended by the AI match the requirements specified by the employer in the job posting.

---

### 3. Stakeholders & User Roles
* **Candidates (Job Seekers):** Individuals searching for employment, building profiles, uploading resumes, tracking application statuses, and viewing recommended jobs.
* **Employers (Recruiters/Hiring Managers):** Representatives of organizations posting jobs, managing applicants through a pipeline, and viewing AI-recommended candidates for their roles.
* **System Administrators:** Internal operators responsible for platform moderation, dispute resolution, user management, and AI feedback loops monitoring.

---

### 4. High-Level Scope

#### 4.1 In Scope
1. **User Identity & Roles:** Segregated onboarding and registration flow for Candidates and Employers.
2. **Job Board & Postings:** Full CRUD operations for jobs, including categorization, salary ranges, location types (remote/hybrid/onsite), and skill tags.
3. **Application Tracking System (ATS):**
   - Candidate-facing tracker (Applied -> Under Review -> Interviewing -> Decision).
   - Employer-facing kanban pipeline to drag-and-drop candidates across application stages.
4. **AI-Powered Recommendation Engine:**
   - Candidate recommendation engine (suggesting jobs based on profile/resume content).
   - Recruiter candidate-matching engine (suggesting candidate profiles matching a specific job posting).
5. **Real-time Notifications:** Automated email and in-app notifications triggered by application stage changes.

#### 4.2 Out of Scope (Future Phases)
1. **Integrated Video Interviewing Tool:** Direct online interviews within the portal (handled via Zoom/Teams integration links for Phase 1).
2. **Paid Job Boosts & Premium Subscriptions:** Stripe-integrated monetization models for recruiters.
3. **Background Verification:** Automated screening checks (third-party API integration).

---

### 5. Business Constraints & Risks
* **Data Privacy & Compliance (GDPR/CCPA):** Storing personal identifying information (PII) in resumes and candidate profiles requires strict security measures and consent logs.
* **AI Bias Mitigation:** AI scoring algorithms must prioritize skills and experience over demographic indicators (name, gender, age, location) to prevent systemic bias.
* **Data Quality Dependency:** The AI recommendation engine is highly dependent on high-quality parsing of unstructured resumes and job descriptions.

---

### 6. High-Level Requirements

#### 6.1 Functional Requirements
* **FR-1:** Candidates must be able to upload resumes in PDF/Word format.
* **FR-2:** The system must parse resume data to extract skills, experience, and education.
* **FR-3:** Employers must be able to create, publish, edit, archive, and delete job postings.
* **FR-4:** Candidates must see a dashboard detailing the real-time status of every active job application.
* **FR-5:** The AI recommendation engine must calculate a match percentage score between candidate profiles and job requirements.

#### 6.2 Non-Functional Requirements
* **Security (NFR-1):** Resume files and PII must be encrypted at rest and in transit.
* **Scalability (NFR-2):** The system must handle up to 10,000 concurrent active users without performance degradation.
* **Latency (NFR-3):** Recommendation engine calculations must complete within 2 seconds for a candidate dashboard load.
