# Product Requirements Document (PRD)
## Project Name: AI Prompt Playbook Platform (PromptForge)

---

## 1. Product Overview
PromptForge is a web-based repository and collaborative workspace designed specifically for prompt management. The platform enables developers to store, categorize, template, and share prompts that drive LLMs. Its core value lies in making prompt templates dynamic through user-defined variables and providing clean, high-performance sharing and discovery workflows.

---

## 2. User Personas & Use Cases

### Persona A: Alex, Full-Stack Developer
*   **Need:** Alex frequently uses LLMs to convert Tailwind styles, refactor boilerplate components, and generate mock data.
*   **Pain Point:** He keeps a random notepad open with his "good prompts," but has to manually copy, paste, and replace text placeholders each time.
*   **Solution:** Alex uses PromptForge to save these prompts as parameterized templates, replacing placeholder values inside the UI fields and hitting "Copy".

### Persona B: Sarah, Tech Lead
*   **Need:** Sarah wants to make sure all developers on her team use the same system prompt constraints for security, styling, and test coverage when coding.
*   **Pain Point:** Junior developers use varied prompts, leading to disparate output quality and inconsistent testing frameworks.
*   **Solution:** Sarah sets up a Private Team Workspace on PromptForge, containing the approved "Test Generation Playbook" and "Code Refactor Playbook".

---

## 3. User Stories & Acceptance Criteria

### US-1: Prompt Search & Filters
*   **As a** developer,
*   **I want to** search prompts using text queries and filter them by category, tag, or target LLM,
*   **So that** I can rapidly locate a prompt suitable for my immediate task (e.g., "Refactor Python").

### US-2: Interactive Templates (Variables)
*   **As a** user viewing a prompt template,
*   **I want to** see form fields corresponding to the template variables and fill them in directly,
*   **So that** the final clipboard copy contains my custom inputs merged cleanly into the prompt text.

### US-3: Custom Playbook Organization
*   **As a** registered developer,
*   **I want to** create custom folders ("Playbooks") to group related prompts,
*   **So that** I can quickly pull up a sequence of prompts for my dev workflow (e.g., a multi-step debugging playbook).

### US-4: Social Discovery (Forking/Sharing)
*   **As a** community member,
*   **I want to** "Fork" a public prompt to my personal library to modify it,
*   **So that** I can build on others' work without affecting their original prompt version.

---

## 4. Feature Specifications

### 4.1 Prompt Editor & Parameterization Engine
*   **Template Syntax:** Standard curly brace notation for variables (e.g., `{{CODE_BLOCK}}`, `{{LANGUAGE}}`, `{{DESIGN_PATTERN}}`).
*   **Markdown Preview:** Live rendering of markdown text inside prompts to ensure clean readability.
*   **Target Model Tags:** Dropdown to tag target models (e.g., GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro).
*   **Variable Extraction:** The system parses the prompt body on-the-fly to extract variables and render input forms in the viewer pane.

### 4.2 Playbook / Folder Management
*   **Hierarchical Folders:** Nested folders to organize templates.
*   **Drag-and-Drop:** Ability to drag prompts into folders or re-order prompts inside playbooks.
*   **Workspace Settings:** Toggle playbooks between `Public`, `Unlisted` (accessible via direct link), or `Private`.

### 4.3 Interactive Prompt Details Page
*   **Left Column:** Prompt details, statistics (view count, copy count, fork count, ratings), tags, and comments.
*   **Right Column (Interactive Panel):** Auto-generated form fields for each `{{variable}}`. A primary "Copy Compiled Prompt" CTA copies the merged prompt.
*   **Version History Tab:** Shows previous versions, authors, and diff checks for changes.

---

## 5. Technical Architecture & Database Schema

### Database Entity Relationship Diagrams (Conceptual)

#### `Users` Table
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `Prompts` Table
```sql
CREATE TABLE prompts (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    body TEXT NOT NULL, -- Contains template e.g. "Fix this {{LANGUAGE}} code..."
    author_id VARCHAR(36) REFERENCES users(id),
    target_model VARCHAR(50),
    is_private BOOLEAN DEFAULT FALSE,
    forked_from VARCHAR(36) REFERENCES prompts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `Playbooks` (Collections) Table
```sql
CREATE TABLE playbooks (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id VARCHAR(36) REFERENCES users(id),
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `Playbook_Prompts` (Association Table)
```sql
CREATE TABLE playbook_prompts (
    playbook_id VARCHAR(36) REFERENCES playbooks(id) ON DELETE CASCADE,
    prompt_id VARCHAR(36) REFERENCES prompts(id) ON DELETE CASCADE,
    position INT NOT NULL, -- For custom sorting ordering
    PRIMARY KEY (playbook_id, prompt_id)
);
```

---

## 6. User Experience & Design Guidelines
*   **Aesthetic:** Dark-theme first, using premium colors (e.g., slate/indigo gradients, clean borders, glassmorphic card overlays).
*   **Copy Feedback:** Interactive micro-animations (e.g., button pulses, changing icon state from clipboard to checkmark) when copying prompts.
*   **Variable Live Preview:** Below the input forms, show a live read-only text output of the compiled prompt dynamically changing as the user types.

---

## 7. Security, Compliance & Governance
*   **Secret Detection:** Implement client-side and server-side pattern scanners to prevent users from accidentally saving API keys, secrets, or passwords within prompts.
*   **Content Moderation:** Flagging system for prompts containing abusive or malicious patterns.
*   **Access Control:** Strict row-level security ensuring private prompts cannot be queried or exposed to non-owners.
