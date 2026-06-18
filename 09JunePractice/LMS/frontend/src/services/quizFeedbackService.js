import { apiRequest } from './api';

/** MOD-04 — Interactive Quiz Feedback & Explanations */

/**
 * Instructor: POST /quiz-feedback/setup
 * releaseRule: 'Always' | 'OnPassing' | 'AfterDeadline'
 */
export function setupQuizFeedback(topicId, { questions, releaseRule }) {
  return apiRequest('/quiz-feedback/setup', {
    method: 'POST',
    body: JSON.stringify({ topicId, questions, releaseRule }),
  });
}

/**
 * Learner: POST /quiz-feedback/submit
 * Returns { attemptId, score, passed, questions[] }
 * questions[]: { questionText, options, userAnswerIndex, correctOptionIndex, explanation? }
 */
export function submitQuizFeedback(topicId, answers) {
  return apiRequest('/quiz-feedback/submit', {
    method: 'POST',
    body: JSON.stringify({ topicId, answers }),
  });
}

/**
 * GET /attempts/:id
 * Returns { id, score, passed, questions[] }
 */
export function getQuizAttempt(attemptId) {
  return apiRequest(`/attempts/${attemptId}`);
}
