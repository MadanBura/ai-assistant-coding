import { apiRequest } from './api';

/** MOD-05 — Gamification & Custom Badges */

/**
 * Instructor: POST /gamification/badges
 * triggerType: 'CourseCompletion' | 'PerfectQuizzes' | 'FastTrack'
 */
export function createBadge({ courseId, title, description, iconUrl, triggerType }) {
  return apiRequest('/gamification/badges', {
    method: 'POST',
    body: JSON.stringify({ courseId, title, description, iconUrl, triggerType }),
  });
}

/**
 * Learner: GET /gamification/badges
 * Returns [{ badgeId: { id, title, description, iconUrl }, unlockedAt }]
 */
export function getUserBadges() {
  return apiRequest('/gamification/badges');
}
