# KPI & Acceptance Criteria Document
## Project: Global AI-Powered Job Portal

---

### 1. Key Performance Indicators (KPIs)
These metrics measure the operational, technical, and business success of the portal post-deployment.

#### 1.1 Technical & Performance KPIs
* **AI Recommendation Latency:** The system must generate and load job/candidate recommendations in less than 2.0 seconds for 95% of queries (p95 latency).
* **System Uptime:** Maintain $\ge$ 99.9% application uptime on a monthly basis.
* **Resume Parsing Accuracy:** Achieve $\ge$ 90% accuracy in parsing key entities (skills, experience duration, job titles) from resume PDFs.

#### 1.2 Business & Product KPIs
* **Candidate Application Completion Rate:** $\ge$ 75% of candidates who initiate the application process should complete it.
* **Recruiter Action Time:** Decrease average recruiter time spent shortlisting candidates by 40% (compared to traditional keyword systems).
* **Match Relevance Score (NPS-equivalent for AI):** Recruiter satisfaction feedback rating for AI candidate matches must average $\ge$ 4.0 out of 5.0 stars.
* **Notification Delivery Rate:** 100% of application status changes must successfully trigger a notification log, with $\ge$ 98% email delivery success.

---

### 2. Functional Acceptance Criteria (Module-wise)

#### 2.1 User Onboarding & Profiles
| User Story / Requirement | Acceptance Criteria |
|---|---|
| **AC-1.1: Registration & Role Choice** | - Onboarding MUST require selecting a role (Candidate or Employer).<br>- Changing roles post-registration is blocked unless authorized by Admin.<br>- Email validation is required before activating the account. |
| **AC-1.2: Candidate Resume Upload** | - Candidate can upload a PDF resume.<br>- File size is limited to 5MB; uploads larger than 5MB show a clear error validation message.<br>- System parses candidate's text and saves the parsed details (skills, work history) to their profile structure automatically. |
| **AC-1.3: Employer Company Profile** | - Employer must fill in: Company Name, Size, Industry, and description.<br>- Logos uploaded must support common image types (PNG, JPG) and automatically resize to fit standard dimensions. |

#### 2.2 Job Board & Management
| User Story / Requirement | Acceptance Criteria |
|---|---|
| **AC-2.1: Job Creation (Employer)** | - Job creation requires a Title, Description, Requirements, Job Type, Salary (min/max), and Skills tags.<br>- If any mandatory fields are missing, form submission fails and highlights the incomplete fields.<br>- Employers can save jobs as `Draft` or publish them directly. |
| **AC-2.2: Search and Filters** | - Search matches keywords in job titles and descriptions.<br>- Filtering by Location (Remote, Hybrid, Onsite), Job Type, and Salary range is instantaneous ($\le$ 500ms).<br>- Results page shows total count of matching jobs. |

#### 2.3 Job Applications & Pipeline Tracking
| User Story / Requirement | Acceptance Criteria |
|---|---|
| **AC-3.1: Application Submission** | - Candidate can apply to an active job post with a single click if profile is complete.<br>- Candidate cannot apply to the same job multiple times; "Apply" button changes to "Applied" with application date. |
| **AC-3.2: Recruiter Kanban Board** | - Recruiter can see all applicants for a job categorized by: `Applied`, `Under Review`, `Interviewing`, `Offered`, `Rejected`.<br>- Recruiter can drag and drop a candidate from one column to another.<br>- The board state persists in the database instantly. |
| **AC-3.3: Application Tracking (Candidate)** | - Candidate can view a dashboard showing all submitted applications.<br>- Dashboard reflects the exact stage status from the Recruiter's board in real time.<br>- Status updates must trigger an automated email and in-app system notification. |

#### 2.4 AI Job Recommendation & Matching Engine
| User Story / Requirement | Acceptance Criteria |
|---|---|
| **AC-4.1: Vector Generation** | - Saving a Candidate Profile or Job Post automatically triggers vector embedding generation of the textual profile/job description.<br>- Embedding vectors are stored securely in the database. |
| **AC-4.2: Recommendations Display** | - Candidates see a list of recommended jobs sorted descending by Match Score.<br>- Only jobs with a match score $\ge$ 50% are shown in the standard "Recommended" section.<br>- Jobs with expired deadlines are filtered out. |
| **AC-4.3: Match Score Transparency** | - The candidate profile matching display shows recruiters a percentage score (e.g., "92% Match") and highlights overlapping skills and keywords to explain the AI evaluation. |
