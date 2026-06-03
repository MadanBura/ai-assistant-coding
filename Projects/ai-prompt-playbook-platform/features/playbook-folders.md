# Feature Specification: Hierarchical Playbook Folders (Feature-06)
**Status:** Ready for Development  
**Target Release:** v1.0.0  
**Author:** Workspace & Collaboration Team  

---

## 1. Feature Summary & Value Proposition
Developers work across multiple domains, projects, and tasks. Keeping all prompts in a single, unstructured list leads to clutter. 

The **Hierarchical Playbook Folder Manager** allows developers to organize their prompt templates into clean, structured playbooks. Users can create, rename, and delete folders, drag and drop prompts into folders, and create nested folder hierarchies. This replicates standard operating file directory systems to ensure maximum organization.

---

## 2. Feature Scope
*   **Create Folders:** Instantly add new folders/playbooks with custom names and descriptions.
*   **Rename Folders:** Editable inline folder naming controls.
*   **Delete Folders:** Remove folders with cascade options (e.g. choose to delete nested items or move them to root).
*   **Drag & Drop Organization:** Move prompts between folders or re-arrange folder sequencing visually.
*   **Nested Hierarchy:** Support for parent-child folder structures up to three levels deep.

---

## 3. Functional Requirements

### FR-6.1: Folder Management
*   **Create Action:** "New Folder" button on the dashboard. User supplies Name (1-50 chars) and an optional Description.
*   **Rename Action:** Inline editing of titles by clicking an "Edit" icon next to folder headers.
*   **Delete Action:** Deletion requires a confirmation modal with options:
    *   *Option A:* Delete folder and all prompts inside.
    *   *Option B:* Delete folder, but move prompts to parent folder.

### FR-6.2: Drag-and-Drop UX
*   **Mechanic:** Users can click and hold a prompt card and drag it over a folder item in the sidebar or grid.
*   **Hover States:** The target folder must visually highlight (e.g. dotted border, scale up 2%) when a draggable element is held over it.
*   **Execution:** Releasing the mouse button triggers an asynchronous API call to update the prompt's `playbook_id`.

### FR-6.3: Nested Directory Limits
*   Users can create sub-folders inside folders up to a maximum nesting depth of 3 (Root -> Level 1 Folder -> Level 2 Folder -> Level 3 Folder). This constraint prevents UI rendering issues and database depth penalties.

---

## 4. Technical Design & Schema Additions
*   **Folder Entity Structure:**
    ```sql
    CREATE TABLE folders (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        parent_id VARCHAR(36) REFERENCES folders(id) ON DELETE CASCADE,
        owner_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```
*   **Prompt Table Reference:** Modify `prompts` table to include `folder_id VARCHAR(36) REFERENCES folders(id) ON DELETE SET NULL`.

---

## 5. Test Scenarios

| Test ID | Input Case | Expected Behavior / Output |
|---------|------------|----------------------------|
| **TS-01** | Create folder with duplicate name | Allowed (scoped within owner_id). |
| **TS-02** | Exceed depth level of 3 | UI disables "Create Sub-Folder" button at level 3, showing a tooltip explanation. |
| **TS-03** | Drag prompt card to sidebar folder | Prompt successfully maps to folder, disappears from current category view, folder count increments by 1. |
