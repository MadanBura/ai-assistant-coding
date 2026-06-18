# Feature: Global Module Management

## Overview
A centralized interface allowing instructors to manage (CRUD) modules across all their courses from a single screen.

## Frontend
- **Route:** `/instructor/modules/global`
- **Entry Point:** `<Sidebar />` -> "Create Module" NavLink
- **Main Component:** `frontend/src/pages/Course/GlobalModuleManagement.jsx`
- **Capabilities:**
  - Fetches courses filtered by logged-in instructor (`user.id`).
  - Dropdown state controls target course.
  - Form issues `POST` to create a new module.
  - Inline editing issues `PUT` updates to a module's title.
  - Safely issues `DELETE` with a confirmation modal.

## Backend Endpoints Added
- **Update Module:** 
  - `PUT /modules/:moduleId`
  - Body: `{ title: String }`
  - Auth: `verifyToken`, `verifyRole('Instructor')`
- **Delete Module:**
  - `DELETE /modules/:moduleId`
  - Auth: `verifyToken`, `verifyRole('Instructor')`

## Database & Services
- **Service Layer:** `backend/src/services/courseService.js`
  - `updateModule(moduleId, { title }, instructorId)`
  - `deleteModule(moduleId, instructorId)`
- **Data Integrity (Cascading Deletes):**
  - Calling `courseService.deleteModule` cascade-deletes all associated `Topic` and `Resource` documents to prevent orphans in MongoDB.
