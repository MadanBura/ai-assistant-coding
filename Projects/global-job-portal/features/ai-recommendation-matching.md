# Feature Specification: Vector-Based AI Recommendation & Matching Engine
## 1. Goal & Description
Integrate a vector-based semantic matching pipeline to calculate similarity scores between job descriptions and candidate profiles. Rather than simple keyword matching, this feature finds jobs that match a candidate's background conceptually, and vice versa for recruiters.

---

## 2. Scope
### In Scope
* Vector embedding pipeline translating candidate resume text/skills and job requirements into high-dimensional vectors (e.g., 384 dimensions using `all-MiniLM-L6-v2` or similar model).
* Vector storage database integration (using PostgreSQL extension `pgvector` or standalone vector DB like Pinecone).
* Cosine similarity matching algorithm calculations.
* "AI-Recommended Jobs" feed on candidate homepage.
* "AI-Suggested Candidates" list for recruiters on specific job detail views.
* Score breakdown UI component displaying match percentage (0% to 100%) and skill/term overlap visual matching.

### Out of Scope
* Automatic screening rejections (AI acts purely as an advisory ranking tool; recruiters must make all final pipeline stage decisions manually).
* External job scraping recommendation sources.

---

## 3. User Flow & UI/UX Requirements
1. **Candidate Job Recommendations Feed:**
   - Candidate logs in and sees an "AI Matches" section on their home feed.
   - Jobs are listed in descending order of matching score.
   - Each job card shows a matching percentage indicator: *"95% Match" (High Alignment)*.
2. **Employer Candidate Match Feed:**
   - Employer views a published job posting detail page.
   - Tab "AI Suggestions" lists profiles of registered candidates who haven't applied yet but have high vector similarity scores.
   - Clicking "View Profile" opens their anonymous skill sheet.
   - Recruiter can invite them to apply with a single button click.
3. **Transparency Component:**
   - Hovering over/clicking the "Match Score" displays a breakdown: *"Matches your skills: Node.js, Kubernetes"*, and *"Experience match: Senior level"*.

---

## 4. Technical Specifications & API Design

### Recommendation Architecture Flow
```
1. Profile Update / Job Publish 
   -> Text fields combined 
   -> Embedding Service (HuggingFace API / local SentenceTransformers) 
   -> Vector generated (e.g., float[384]) 
   -> Saved to DB (pgvector column)

2. Query (Match) 
   -> Select top jobs ordered by cosine distance: 
      `SELECT *, (1 - (description_embedding <=> :candidate_embedding)) AS similarity_score FROM jobs WHERE ... ORDER BY similarity_score DESC LIMIT 10`
```

### API Endpoints
* `GET /api/candidates/recommendations`
  - Auth: Candidate token.
  - Action: Fetches active candidate embedding, runs cosine distance query against published job embeddings.
  - Response: `200 OK`
    ```json
    {
      "results": [
        {
          "job_id": "job-uuid",
          "title": "Backend Architect",
          "match_score": 92.4,
          "matching_skills": ["Node.js", "Redis", "TypeScript"],
          "reasons": ["Matches your experience with distributed backends.", "Stack alignment is very high."]
        }
      ]
    }
    ```
* `GET /api/jobs/:id/suggested-candidates`
  - Auth: Owner employer token.
  - Response: `200 OK` listing candidate matches sorted by similarity score.

---

## 5. Acceptance Criteria (AC)
* **AC-1:** Recommendations must only suggest active, published jobs (excluding drafts/archived postings).
* **AC-2:** Match scoring query time must be optimized to respond within 1.5 seconds for candidate dashboard loads.
* **AC-3:** Match score calculations must filter out PII markers (name, gender, location, age) to ensure compliance and unbiased evaluation.
* **AC-4:** The similarity score formula must normalize results into a percentage format (0-100%) for candidate/recruiter display.
