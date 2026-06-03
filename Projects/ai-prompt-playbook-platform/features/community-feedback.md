# Feature Specification: Community Feedback System (Feature-09)
**Status:** Ready for Development  
**Target Release:** v1.0.0  
**Author:** Community Engagement Team  

---

## 1. Feature Summary & Value Proposition
Without community vetting, users have no signal on whether a prompt actually yields high-quality outputs or is obsolete.

The **Community Feedback System** establishes quality trust. By offering ratings (1-5 stars) restricted to one vote per user and a threaded discussion panel for prompt usage tips, it enables developers to validate, optimize, and discuss prompts, generating a crowd-sourced reputation score for every template.

---

## 2. Feature Scope
*   **1-5 Star Ratings:** Star ratings widget allowing users to review prompt performance.
*   **One Vote per User:** Restricting duplicate votes to ensure aggregate ratings remain unmanipulated.
*   **Comment Threads:** Rich discussions below prompt detail pages.
*   **Replies:** Threaded, nested response hierarchies for debugging conversations.
*   **Moderation Support:** Flagging content for administration cleanup.

---

## 3. Functional Requirements

### FR-9.1: Ratings Mechanism
*   **星 Input:** 5-star interactive SVG rating widget.
*   **Restricted Vote:** The database must use a unique constraint on `(user_id, prompt_id)` in the reviews table. Clicking a star rating updates the user's existing vote if they previously voted, rather than creating a new record.
*   **Aggregate Score:** Display the average rating and total vote count on prompt preview cards.

### FR-9.2: Threaded Comment System
*   **Post Comments:** Users can write markdown-supported comments under a prompt.
*   **Replies:** Supporting nested, single-level replies (indentation in the UI) to focus debugging conversations.
*   **Visual Highlights:** Highlight comments written by the prompt author with a "Creator" badge.

### FR-9.3: Report / Flag Content
*   Users can flag a prompt or comment for violating terms (e.g. containing harmful content or spam). Flagged items are queued in the admin review dashboard.

---

## 4. Technical Architecture & Schema

#### `Reviews` Table
```sql
CREATE TABLE reviews (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    prompt_id VARCHAR(36) REFERENCES prompts(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, prompt_id)
);
```

#### `Comments` Table
```sql
CREATE TABLE comments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    prompt_id VARCHAR(36) REFERENCES prompts(id) ON DELETE CASCADE,
    parent_id VARCHAR(36) REFERENCES comments(id) ON DELETE CASCADE, -- Null for root comments
    body TEXT NOT NULL,
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Test Scenarios

| Test ID | Input Case | Expected Behavior / Output |
|---------|------------|----------------------------|
| **TS-01** | User submits a rating of 4 stars, then changes to 5 | Rating updates in database. The total vote count remains the same, average rating is recalculated. |
| **TS-02** | Guest user attempts to post comment or rate | Action is blocked. UI triggers signup/login prompt. |
| **TS-03** | User comments on a prompt and replies to another comment | Nested reply structure renders with correct indentation alignment. |
