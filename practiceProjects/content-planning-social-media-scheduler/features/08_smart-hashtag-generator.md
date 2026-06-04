# Feature Specification: Smart Hashtag Generator
## Feature ID: FEAT-302

---

## 1. Purpose
Provide creators with a smart hashtag recommendation tool that analyzes drafted post captions and suggests relevant, trending, and platform-specific hashtags. Users can click individual suggestions to append them directly into their post editor, improving searchability and reach.

---

## 2. User Stories
* **US-302:** As an Editor, I want the system to scan my caption text and suggest 5-10 relevant and trending hashtags that I can insert with a single click.

---

## 3. Functional Requirements
1. **FR-302-1:** The backend API MUST accept a body of text (post caption) and the target platform name.
2. **FR-302-2:** The system MUST parse the caption text and execute a keyword-extraction query via LLM or internal tagging dictionaries.
3. **FR-302-3:** The API MUST return an array of 5 to 10 hashtag suggestions formatted without duplicate entries.
4. **FR-302-4:** Suggested tags must be ranked based on relevance to the input copy.
5. **FR-302-5:** Clicking a suggested hashtag badge in the frontend client MUST append `#hashtag` to the end of the caption input, separated by a single space.
6. **FR-302-6:** If a selected hashtag already exists in the caption editor, clicking it again MUST prevent adding a duplicate copy.

---

## 4. Validation Rules
* **Text Input:** Caption input MUST contain at least 10 characters to perform hashtag recommendations.
* **Hashtag Format:** Suggestions returned by the API MUST begin with a `#` symbol followed exclusively by alphanumeric characters (no spaces, symbols, or punctuation).
* **Length Limit:** Recommendations must exclude hashtags exceeding 30 characters in length.

---

## 5. Edge Cases
* **Empty/Short Caption Input:** If a user clicks "Suggest Hashtags" with an empty or too-short caption, return a warning toast: *"Please write a longer caption first so we can analyze it."*
* **No Relevant Keywords Extracted:** If the analyzer finds no matching keywords (e.g. caption is just a single link or random string), return a fallback array of general marketing hashtags based on the workspace industry category (configured in workspace settings, e.g. `#marketing`, `#growth`).
* **Platform Constraints Override:** If the user selects Twitter/X as the platform, filter recommendation lists to prioritize 3-5 tags max (to prevent character limit exhaustion). If they select Instagram, offer up to 10 tags.

---

## 6. Dependencies
* **AI Analysis Integration:** Relies on the same LLM API client (Gemini/OpenAI) configured in `FEAT-301`.
* **Workspace Settings Cache:** Requires active workspace metadata (industry/topic fields) to provide fallbacks.

---

## 7. API Requirements

### 7.1 Generate Hashtag Recommendations
* **POST `/api/v1/ai/suggest-hashtags`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Request Body:**
  ```json
  {
    "caption": "We are looking for a remote software engineer to join our growing engineering team in Lisbon. Apply here!",
    "platform": "linkedin"
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "hashtags": ["#SoftwareEngineer", "#HiringRemote", "#LisbonJobs", "#TechHiring", "#JoinOurTeam"]
  }
  ```

---

## 8. Database Impact
Logs recommendation usage metrics to the `ai_generation_log` (reusing tables created in `FEAT-301`), applying small token charges. No new tables are required.

---

## 9. UI Components
* **Hashtag Suggestions Tray:** A horizontal scrolling tray of badge elements rendered directly below the post composer text area.
* **Suggest Buttons:** A wand icon action button (`Suggest Tags`) inside the text toolbar.
* **Hover Interaction:** Hovering over a badge displays a `+` symbol indicator. Selected hashtags are greyed out or hidden from the list.

---

## 10. Security Requirements
1. **Input Sanitization:** Run standard XSS sanitization checks on incoming caption text before processing.
2. **Quota Checks:** Integrate hashtag execution with the workspace monthly AI quota threshold checks to prevent bypass vectors.

---

## 11. Acceptance Criteria
* **AC-302-1:** Submitting caption text returns an array of formatted, unique hashtags.
* **AC-302-2:** Clicking suggested badges inserts hashtags into the composer textarea text buffer.
* **AC-302-3:** Re-clicking inserted tags has no effect and avoids appending duplicates.
* **AC-302-4:** Recommended outputs comply with length constraints and start with `#` prefixes.

---

## 12. Definition of Done (DoD)
1. **Parser Verification:** Tests verify parsing and tokenization functions execute correctly.
2. **UI Usability:** Keyboard interaction accessibility tested on the hashtag badges selector grid.
3. **Tests:** Coverage guarantees that fallback options function seamlessly under edge conditions.
