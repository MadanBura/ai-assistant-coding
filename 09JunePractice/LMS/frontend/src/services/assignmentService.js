import { apiRequest, apiUpload } from './api';

/** MOD-02 — Assignment Portal */

/** Instructor: POST /assignments */
export function createAssignment({ topicId, title, description, maxScore, dueDate, referenceFileUrl }) {
  return apiRequest('/assignments', {
    method: 'POST',
    body: JSON.stringify({ topicId, title, description, maxScore, dueDate, referenceFileUrl }),
  });
}

/**
 * GET /assignments?topicId=
 * Returns { success, data: Assignment|null }
 */
export function getAssignmentByTopic(topicId) {
  return apiRequest(`/assignments?topicId=${topicId}`);
}

/**
 * Learner: GET /assignments/:id/submission
 * Returns { success, data: Submission|null }
 */
export function getSubmission(assignmentId) {
  return apiRequest(`/assignments/${assignmentId}/submission`);
}

/**
 * Instructor: GET /assignments/:id/submissions
 * Returns { success, data: Submission[] }
 */
export function getSubmissions(assignmentId) {
  return apiRequest(`/assignments/${assignmentId}/submissions`);
}

/**
 * Learner: POST /assignments/:id/submit  (multipart)
 * @param {string} assignmentId
 * @param {FormData} formData  — must include field 'submissionFile'
 */
export function submitAssignment(assignmentId, formData) {
  return apiUpload(`/assignments/${assignmentId}/submit`, 'POST', formData);
}

/**
 * Instructor: POST /submissions/:id/grade  (multipart)
 * @param {string} submissionId
 * @param {FormData} formData  — fields: grade, feedback, feedbackFile?
 */
export function gradeSubmission(submissionId, formData) {
  return apiUpload(`/submissions/${submissionId}/grade`, 'POST', formData);
}
