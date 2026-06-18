import { apiRequest } from './api';

/** MOD-01 — Announcements */

/** Instructor: POST /announcements */
export function createAnnouncement(courseId, { title, content, priority }) {
  return apiRequest('/announcements', {
    method: 'POST',
    body: JSON.stringify({ courseId, title, content, priority }),
  });
}

/** Learner + Instructor: GET /announcements?courseId= */
export function getAnnouncements(courseId) {
  return apiRequest(`/announcements?courseId=${courseId}`);
}
