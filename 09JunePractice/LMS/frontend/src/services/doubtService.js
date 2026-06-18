import { apiRequest } from './api';

/** MOD-03 — Doubts Q&A */

/** Learner: POST /doubts */
export function createDoubt(topicId, question) {
  return apiRequest('/doubts', {
    method: 'POST',
    body: JSON.stringify({ topicId, question }),
  });
}

/** GET /doubts?topicId= */
export function getDoubts(topicId) {
  return apiRequest(`/doubts?topicId=${topicId}`);
}

/**
 * POST /doubts/:id/answers
 * Both Learner and Instructor can reply.
 * @param {string} doubtId
 * @param {{ content: string, isOfficial: boolean }} payload
 */
export function postAnswer(doubtId, { content, isOfficial }) {
  return apiRequest(`/doubts/${doubtId}/answers`, {
    method: 'POST',
    body: JSON.stringify({ content, isOfficial }),
  });
}
