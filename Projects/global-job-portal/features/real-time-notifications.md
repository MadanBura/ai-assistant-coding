# Feature Specification: Real-Time Status Tracking & Notifications
## 1. Goal & Description
Keep candidates updated throughout the application process by providing in-app system notifications and email updates immediately when a recruiter moves their application card to a new stage in the recruitment pipeline.

---

## 2. Scope
### In Scope
* In-app notification center (bell icon dropdown displaying read/unread logs).
* WebSockets (e.g., Socket.io) or Server-Sent Events (SSE) to push live status updates to active candidates.
* SMTP/Email dispatch service (using Nodemailer, SendGrid, or AWS SES) to send transactional emails.
* Trigger points:
  - Application received (Candidate confirmation).
  - Status changed (`Under Review`, `Interviewing`, `Offered`, `Rejected`).
  - Job posting archived (notifying active applicants that the opening is closed).
* Unsubscribe settings / notification preference configuration panel.

### Out of Scope
* SMS notifications.
* Interactive chat/messaging between recruiters and candidates (notifications only).

---

## 3. User Flow & UI/UX Requirements
1. **Recruiter Action:** Employer drags Alex's application from `Under Review` to `Interviewing`.
2. **In-App Toast (Live):** If Alex is currently online, a slide-in banner toast displays in the top-right corner: *"Good news! Your application for Senior Developer has been moved to 'Interviewing'."*
3. **Notification Badge:** The navbar bell icon badge increments to `1` (red dot). Clicking the bell opens a dropdown list of recent events, marking them read when clicked.
4. **Email Dispatch:** An automated email is dispatched to Alex's registered inbox within 1 minute, displaying professional formatting and direct link to their application tracker page.
5. **Dashboard Status Update:** The candidate's dashboard applications table reflects "Interviewing" in real-time.

---

## 4. Technical Specifications & API Design

### Live Notification Architecture
```
Recruiter Action -> PATCH /api/applications/:id/status 
                 -> Save to DB 
                 -> Dispatch System Event
                 -> [WebSockets/Socket.io] -> Push to online client
                 -> [SMTP Queue] -> Send transaction email
```

### API Endpoints
* `GET /api/notifications`
  - Auth: Authenticated user (Candidate or Employer).
  - Query: `page=1&limit=10`
  - Response: `200 OK`
    ```json
    {
      "unread_count": 1,
      "notifications": [
        {
          "id": "notif-uuid",
          "title": "Interview Scheduled",
          "message": "Your application for Senior Developer is now in Interviewing stage.",
          "is_read": false,
          "created_at": "2026-06-03T12:00:00Z"
        }
      ]
    }
    ```
* `PATCH /api/notifications/:id/read`
  - Auth: Authenticated owner user.
  - Action: Marks specific notification as read.
  - Response: `200 OK`.
* `PATCH /api/notifications/read-all`
  - Response: `200 OK`.

---

## 5. Acceptance Criteria (AC)
* **AC-1:** Email updates must be dispatched within 60 seconds of a recruiter dragging an applicant's status card on the Kanban board.
* **AC-2:** In-app toast alerts must render on the candidate's screen within 2 seconds if they are online (verified via active WebSocket connection).
* **AC-3:** Transitioning an application to `'REJECTED'` must trigger a respectful templated email, concealing details of other applicants.
* **AC-4:** Candidates must only be able to view or edit their own notification logs, verified by user token authentication.
