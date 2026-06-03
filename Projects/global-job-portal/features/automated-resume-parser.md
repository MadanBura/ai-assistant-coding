# Feature Specification: Automated PDF Resume Parser
## 1. Goal & Description
Automatically process and parse uploaded PDF resumes using text extraction and NLP to extract structured metadata (skills, past job titles, dates, education). This reduces user input friction by automatically populating profile fields upon resume upload.

---

## 2. Scope
### In Scope
* PDF text extraction engine (using libraries like `pdf-parse` or PyPDF2).
* Regular expression and keyword matching lists to parse contact details (email, phone).
* NLP/AI model classification (or rule-based parsing) to identify skills, employment history blocks, and education.
* Automatic updates/populating of candidate profile database fields.
* Form review interface allowing candidates to confirm or edit parsed information before final database save.

### Out of Scope
* Parsing scanned image PDFs (OCR parsing) - reserved for future updates (resumes must be selectable-text PDFs).
* Standardizing unstructured company names to industry database listings (e.g., matching "G-Suite Co" to "Google").

---

## 3. User Flow & UI/UX Requirements
1. **Upload Trigger:** Candidate uploads their PDF resume in the profile dashboard.
2. **Parsing Screen:** A loader animation displays: "Parsing your resume... Please wait."
3. **Verification Form:** Once processed (within 3 seconds), the dashboard displays a multi-step form pre-populated with extracted values:
   - Personal Details (Name, Phone, Email)
   - Skills List (represented as tags)
   - Experience list (Pre-filled timeline boxes)
   - Education list
4. **User Correction:** Candidate reviews the parsed fields, makes any corrections to incorrect text or dates, and clicks "Save Profile".
5. **Database Commit:** Corrected and confirmed details are saved, updating the candidate's main profile.

---

## 4. Technical Specifications & API Design

### Engine Flow
```
PDF Upload -> Text Extraction (pdf-parse) -> NLP Parsing Layer -> Structured JSON -> Profile Auto-Fill Form
```

### API Endpoints
* `POST /api/candidate/resume/parse`
  - Body: `{ resume_url }` or uploaded file.
  - Processing:
    1. Extracts raw text from PDF.
    2. Runs text through parser (Regex + Named Entity Recognition).
    3. Packages output into structured JSON.
  - Response: `200 OK` with payload:
    ```json
    {
      "full_name": "John Doe",
      "email": "johndoe@email.com",
      "phone": "+1234567890",
      "extracted_skills": ["Node.js", "React", "TypeScript", "AWS"],
      "experience": [
        {
          "company": "Tech Corp",
          "title": "Software Engineer",
          "start_date": "2024-01-01",
          "end_date": "Present",
          "description": "Built REST APIs using Express..."
        }
      ],
      "education": [
        {
          "institution": "State University",
          "degree": "B.S. Computer Science",
          "year": "2023"
        }
      ]
    }
    ```

---

## 5. Acceptance Criteria (AC)
* **AC-1:** System must achieve $\ge$ 90% parsing accuracy for standard text-based CV layout formats.
* **AC-2:** If the PDF is unreadable, corrupted, or encrypted, the API must fail gracefully, returning `422 Unprocessable Entity` with message: `"Unable to parse PDF text. Please fill profile fields manually."`
* **AC-3:** Parsed skills must automatically cross-reference a standardized skills vocabulary dictionary to filter out junk tags.
* **AC-4:** The parsing operation must run asynchronously or resolve synchronously in under 3.0 seconds to prevent client-side network request timeouts.
