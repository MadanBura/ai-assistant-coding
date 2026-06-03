# Feature Specification: Prompt Forking & Lineage (Feature-08)
**Status:** Ready for Development  
**Target Release:** v1.0.0  
**Author:** Community & Collaboration Team  

---

## 1. Feature Summary & Value Proposition
Developers often discover prompts that are *almost* perfect for their needs, but require minor tweaks. Editing the original prompt is impossible if they do not own it, and copy-pasting the text into a new prompt destroys the history, author credit, and improvement lineage.

The **Prompt Forking & Lineage** system allows developers to "Fork" any public prompt into their personal library. This creates a duplicate copy they can modify, while maintaining immutable metadata referencing the original author. This fosters collaborative prompt improvement and ensures creators receive proper credit for their contributions.

---

## 2. Feature Scope
*   **Fork Prompt:** One-click cloning of templates from public views into personal libraries.
*   **Lineage Tracking:** Storing reference IDs linking duplicate prompts back to their parent files.
*   **Creator Attribution:** Visual badges displaying the original author profile on all downstream forks.
*   **Version History:** Saving version snapshots so users can audit how prompts have evolved over time.
*   **Ownership Transfer:** Rules handling fork status if the original parent prompt is deleted or made private.

---

## 3. Functional Requirements

### FR-8.1: Forking Mechanism
*   **Fork Button:** Visible on all public prompt pages (except prompts owned by the currently logged-in user).
*   **Cloning Process:** Creates a new record in the `prompts` table:
    *   Set `author_id` to current user ID.
    *   Set `forked_from` to parent prompt ID.
    *   Initialize version counter to 1.
    *   Copy title, description, body, variables, tags, and categories.

### FR-8.2: Visual Attribution Badge
*   On any forked prompt's detail page, a persistent attribution link must be displayed beneath the title:
    *   *Format:* `Forked from @username/original-prompt-title`
    *   The link must resolve directly to the original parent prompt detail view.

### FR-8.3: Lineage Integrity & Deletions
*   **Parent Deletion:** If an original parent prompt is deleted, all downstream forks must remain intact, but the attribution link is updated to show: `Forked from @username (Original deleted)`. The parent ID reference remains for schema integrity, but resolves gracefully.
*   **Parent Switched to Private:** Similar to deletion, the link is preserved, but clicking it displays: `This parent prompt is now private`.

---

## 4. Database Schema Support
*   `forked_from` nullable foreign key referencing `prompts(id)`.
*   `original_author_id` nullable foreign key referencing `users(id)` (stored to retain initial creator identity even if the prompt goes through multiple generations of forks).

---

## 5. Test Scenarios

| Test ID | Input Case | Expected Behavior / Output |
|---------|------------|----------------------------|
| **TS-01** | User click "Fork" on a public prompt | Duplicate prompt created in user dashboard. Original author gets attribution credit. |
| **TS-02** | User attempts to fork their own prompt | "Fork" button is disabled/hidden. UI displays "You own this prompt". |
| **TS-03** | Parent prompt is deleted | Fork page remains active, and attribution badge updates to show parent prompt is deleted. |
