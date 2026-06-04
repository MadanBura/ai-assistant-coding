# Feature Specification: AI Caption Generator
## Feature ID: FEAT-301

---

## 1. Purpose
Empower content creators and editors to generate context-specific, engaging, and platform-optimized caption options using Generative AI (Google Gemini or OpenAI APIs). The helper takes keywords, select tones, and platform target inputs to produce draft caption copy. A multi-tenant quota validation engine manages billing limits.

---

## 2. User Stories
* **US-301:** As an Editor, I want to select a text prompt, tone of voice (e.g., Professional, Playful, Bold), target platform, and length to generate optimized caption variations.

---

## 3. Functional Requirements
1. **FR-301-1:** The backend API MUST receive user prompts, tone parameters, length choices, and target platform tags.
2. **FR-301-2:** The AI service builder MUST translate inputs into structured prompts adding platform constraints (e.g. character thresholds, emoji guidelines, line break styles).
3. **FR-301-3:** The API MUST query the LLM engine and fetch at least 3 distinct option outputs.
4. **FR-301-4:** Prior to query execution, the backend MUST verify if the workspace has available AI tokens (`ai_quota_used` < `ai_quota_limit`).
5. **FR-301-5:** Upon AI execution success, the system MUST calculate LLM tokens consumed (prompt + completion tokens) and record/increment it in the workspace quota table.
6. **FR-301-6:** Generated caption selections MUST feature a copy-to-clipboard button and a "Use Caption" button which overwrites the active caption editor text.

---

## 4. Validation Rules
* **Prompt Input:** Must be between 5 and 500 characters.
* **Tone Values:** Must belong to: `['PROFESSIONAL', 'CASUAL', 'BOLD', 'PLAYFUL', 'HUMOROUS']`.
* **Length Constraints:** Must belong to: `['SHORT' (1-2 sentences), 'MEDIUM' (1-2 paragraphs), 'LONG' (bulleted article style)]`.
* **Quota Check:** If current monthly tokens used exceeds workspace package bounds, abort prompt execution, return HTTP `402 Payment Required` code.

---

## 5. Edge Cases
* **AI Provider API Timeout:** If the Gemini/OpenAI API fails to respond within 15 seconds, return `504 Gateway Timeout` and notify the user: *"AI generator is temporarily unresponsive. Please try again in a few moments."* Token usage is NOT incremented for failed requests.
* **Inappropriate / Safety Blocked Content:** If the LLM returns safety block indications:
  1. Return `400 Bad Request` to client.
  2. Display message: *"Prompt blocked by safety filters. Please refine your inputs."*
  3. No quota tokens are deducted.
* **Quota Race Condition:** If a workspace has 10 tokens left and two team members trigger generation calls simultaneously, implement a Postgres row lock on the workspace settings row to serialize checks, ensuring the second caller receives a quota-exceeded rejection.

---

## 6. Dependencies
* **Generative LLM Client Integration:** Access to Google Gemini API (or OpenAI GPT API) with valid API tokens.
* **Quota Limits Configuration:** A settings table outlining token limits per workspace billing plan tier.

---

## 7. API Requirements

### 7.1 Generate Caption Options
* **POST `/api/v1/ai/generate-caption`**
* **Headers:** `Authorization: Bearer <JWT>`, `X-Workspace-ID: <workspace_id>`
* **Request Body:**
  ```json
  {
    "prompt": "Announce our eco-friendly packaging launch",
    "tone": "BOLD",
    "platform": "linkedin",
    "length": "MEDIUM"
  }
  ```
* **Response `200 OK`:**
  ```json
  {
    "options": [
      "We're making a change! 🌿 Starting today, our orders ship in 100% compostable packaging. Check out the details...",
      "Bold steps for a green future. 🌎 Say goodbye to plastic waste. Our new packaging has landed. Let's make an impact..."
    ],
    "quota_remaining": 8450
  }
  ```

---

## 8. Database Impact
Direct reads/writes tracking usage metrics:

```sql
CREATE TABLE workspace_ai_quota (
    workspace_id UUID PRIMARY KEY REFERENCES workspace(id) ON DELETE CASCADE,
    ai_quota_limit INTEGER NOT NULL DEFAULT 50000, -- Max LLM tokens per month
    ai_quota_used INTEGER NOT NULL DEFAULT 0,
    reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_generation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id),
    prompt_text TEXT NOT NULL,
    tokens_billed INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_log_workspace ON ai_generation_log(workspace_id);
```

---

## 9. UI Components
* **AI Panel Drawer:** Overlay panel accessible from the editor workspace. Contains text prompt input, Tone toggle buttons, length choice dropdown, and target channel indicators.
* **Option Card Carousel:** 3-column container showcasing generated texts. Includes a copy button and a select checkmark action.
* **Token Quota Bar:** Progress bar located at the bottom of the drawer indicating the user's monthly generation usage.

---

## 10. Security Requirements
1. **Prompt Sanitization:** Sanitize input prompt strings to strip HTML script nodes, protecting against script injection vector risks.
2. **Quota Isolation Verification:** Verify that calculations for AI execution tokens are strictly applied to the workspace parameter header target.

---

## 11. Acceptance Criteria
* **AC-301-1:** Requesting caption generation constructs a system prompt, queries the API, and returns structured textual options.
* **AC-301-2:** Selecting options copies text into the active Composer post input body.
* **AC-301-3:** AI execution decrements remaining token values from database limits.
* **AC-301-4:** Prompting with zero tokens remaining is rejected, outputting an informative subscription warning.

---

## 12. Definition of Done (DoD)
1. **Prompt Quality Review:** Test prompt sets validated to verify tones align with parameters.
2. **Billing Verification:** Verify that quota records accurately update under simulation.
3. **Integration Mocking:** Ensure that test files mock Gemini API responses so that standard tests run without internet network connectivity.
