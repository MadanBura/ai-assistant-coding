# Feature Specification: Job Search & Advanced Discovery Index
## Feature ID: F-05

---

### 1. Feature Description
Develop a search engine index to help freelancers discover relevant client projects. The search system will process search tokens and apply filters matching skill requirements, budget parameters, categorization, and sort attributes.

---

### 2. Scope & Boundaries

#### In-Scope:
- **Keyword Search**: Full-text search matching tokens against project titles and description columns.
- **Skill Filters**: Exact array intersection match (e.g., jobs requiring 'React' AND 'TypeScript').
- **Budget Filters**: Sliding scale budget filters (min and max values) for both fixed-price projects and hourly ranges.
- **Category Filters**: Nested category filtering (e.g., Design > UI/UX, Engineering > Frontend).
- **Sorting & Pagination**: Sorting options (Newest, Budget High-to-Low, Low-to-High, Proposal Count) utilizingCursor-based pagination to ensure fast load times.

#### Out-of-Scope:
- Elasticsearch clusters (Phase 1 will utilize PostgreSQL Full-Text Search - pg_trgm and tsvector to save resources, migrating to Elasticsearch in Phase 2).
- AI-based semantic recommendations.

---

### 3. Detailed Technical Requirements

```
[ Freelancer UI: Filters ]  -->  [ GET /api/v1/projects/search ]
                                          |
                                          v
                               [ Query Builder Middleware ]
                                          |
          +-------------------------------+------------------------------+
          |                               |                              |
          v                               v                              v
[ Keyword Search: TSVECTOR ]    [ Filters: Array Containment ]   [ Pagination: Limit/Offset ]
          |                               |                              |
          +-------------------------------+------------------------------+
                                          |
                                          v
                              [ Executed Query on DB ]
```

#### 3.1. Frontend Views & UI Elements
- **Marketplace Listing Dashboard**: Dual panel view. Left panel contains collapsible filters (budget, skills, category, client history). Right panel shows search input and active project cards grid.
- **Dynamic Tag Inputs**: Tokenized input field for searching and adding skill filters dynamically.
- **Skeleton Loaders**: Tailwind-styled skeleton placeholders to improve perceived loading speeds during query changes.

#### 3.2. Backend APIs & Endpoints
- `GET /api/v1/projects/search`: Main endpoint query parameters:
  - `q` (string, search terms)
  - `skills` (comma-separated string values)
  - `min_budget` & `max_budget` (integers)
  - `budget_type` (fixed/hourly)
  - `sort_by` (newest/budget_desc/budget_asc)
  - `page` & `limit` (integers)

#### 3.3. Database Schema Impact
- **Indexes**: Create GIN indexes on `projects.skills` array and `tsvector` columns for project details:
  ```sql
  CREATE INDEX idx_projects_skills ON projects USING gin(skills);
  CREATE INDEX idx_projects_fts ON projects USING gin(to_tsvector('english', title || ' ' || description));
  ```

---

### 4. Acceptance Criteria & Edge Cases

| Scenario | Given | When | Then |
| :--- | :--- | :--- | :--- |
| **Full-Text Matching** | A project exists with title "Golang Developer for API Work" | User searches "go api development" | The search engine parses tokens and returns the Golang project. |
| **Array Skill Matching** | A project requires ['React', 'Node'] | User filters by ['React', 'Python'] | The project is excluded as it does not match all selected skills. |
| **Hourly vs Fixed Budget Filter** | User sets budget slider to $50-$100 and selects "Hourly" | Search queries are executed | System returns hourly projects with rates between $50-$100, excluding fixed-price listings. |
| **Empty Search Results** | No projects match the queried terms | The search results reload | UI displays a clean empty state card: *"No matches found. Try widening your filters."* |
| **Deep Pagination Latency** | User requests page 50 of search results | System executes pagination | Backend responds in < 1 second using cursor index instead of offset scan. |
