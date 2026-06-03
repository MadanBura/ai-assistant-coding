# Feature Specification: Visibility & Access Controls (Feature-07)
**Status:** Ready for Development  
**Target Release:** v1.0.0  
**Author:** Security & Access Team  

---

## 1. Feature Summary & Value Proposition
Developers want to share useful general prompts with the community, but they must keep proprietary business logic, system prompts, or secure client templates completely confidential.

The **Visibility & Access Controls** system allows developers to specify exactly who can view and execute their prompts. By offering three tier settings (Public, Unlisted, and Private) backed by secure database row-level security, users have total confidence that sensitive templates remain private while public ones remain accessible.

---

## 2. Feature Scope
*   **Public Visibility:** Prompts searchable by anyone, listed on author profiles, and indexable by search engines.
*   **Unlisted Sharing:** Hidden from search and public profile pages, but viewable by anyone possessing the direct unique URL.
*   **Private Access:** Visible and editable strictly by the prompt owner.
*   **Ownership Controls:** Restricting editing/deletion actions solely to the verified creator.
*   **Permission Management:** Shared workspace configurations for business/team scopes.

---

## 3. Functional Requirements

### FR-7.1: Visibility Levels
*   **Settings Selector:** A simple, high-visibility 3-way toggle or dropdown menu inside the Prompt Editor.
    *   *Public:* Open to all.
    *   *Unlisted:* Accessible only via randomized unique link hash (e.g., `/prompts/share-a7f3b8de9c12`).
    *   *Private:* Visible only to owner.
*   **Default State:** All newly drafted prompts default to `Private` to prevent accidental public leakages.

### FR-7.2: Row-Level Security (RLS)
*   The API backend must enforce access checks at the database query level.
*   If a user requests `/api/prompts/:id` and the prompt is marked `Private`, the API must return a `404 Not Found` (rather than a `403 Forbidden`) to prevent attackers from verifying the existence of private prompt IDs.

### FR-7.3: Share Token Generation
*   Unlisted prompts must generate a unique UUID or highly secure random slug representation.
*   A "Copy Link" action button must copy the absolute unlisted sharing link to the clipboard.

---

## 4. Security Architecture (Draft RLS Rule)

If utilizing PostgreSQL with Row-Level Security, the policy structure should map as follows:

```sql
-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Select Policy: Users can view public prompts, unlisted prompts, or their own private prompts.
CREATE POLICY prompts_read_policy ON prompts
    FOR SELECT
    USING (
        is_private = FALSE 
        OR author_id = auth.uid()
    );

-- Modify Policy: Users can update or delete only their own prompts.
CREATE POLICY prompts_modify_policy ON prompts
    FOR ALL
    USING (author_id = auth.uid());
```

---

## 5. Test Scenarios

| Test ID | Input Case | Expected Behavior / Output |
|---------|------------|----------------------------|
| **TS-01** | Non-owner tries to query `/prompts/{id}` of a private prompt | Server returns `404 Not Found`. |
| **TS-02** | Non-owner queries `/prompts/{id}` of an unlisted prompt | Server returns data successfully. |
| **TS-03** | Global search query run by public guest | Search returns zero private or unlisted prompts in results. |
| **TS-04** | Owner switches public prompt to private | Prompt is immediately purged from search index caches. |
