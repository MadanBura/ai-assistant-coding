const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { submitLimiter } = require('../middlewares/rateLimitMiddleware');
const { validateAssignmentCreate, validateGradeSubmission } = require('../middlewares/validator');

router.post(
  '/assignments',
  verifyToken,
  verifyRole('Instructor'),
  validateAssignmentCreate,
  assignmentController.createAssignment
);

router.post(
  '/v1/assignments',
  verifyToken,
  verifyRole('Instructor'),
  validateAssignmentCreate,
  assignmentController.createAssignment
);

// Support both :assignmentId and :id
router.post(
  '/assignments/:id/submit',
  verifyToken,
  verifyRole('Learner'),
  submitLimiter,
  assignmentController.submitAssignment
);

router.post(
  '/v1/assignments/:id/submit',
  verifyToken,
  verifyRole('Learner'),
  assignmentController.submitAssignment
);

router.post(
  '/submissions/:id/grade',
  verifyToken,
  verifyRole('Instructor'),
  validateGradeSubmission,
  assignmentController.gradeSubmission
);

router.post(
  '/v1/submissions/:id/grade',
  verifyToken,
  verifyRole('Instructor'),
  validateGradeSubmission,
  assignmentController.gradeSubmission
);

router.get(
  '/assignments',
  verifyToken,
  assignmentController.getAssignmentByTopic
);

router.get(
  '/v1/assignments',
  verifyToken,
  assignmentController.getAssignmentByTopic
);

router.get(
  '/assignments/:id/submission',
  verifyToken,
  verifyRole('Learner'),
  assignmentController.getSubmission
);

router.get(
  '/v1/assignments/:id/submission',
  verifyToken,
  verifyRole('Learner'),
  assignmentController.getSubmission
);

router.get(
  '/assignments/:id/submissions',
  verifyToken,
  verifyRole('Instructor'),
  assignmentController.getSubmissions
);

router.get(
  '/v1/assignments/:id/submissions',
  verifyToken,
  verifyRole('Instructor'),
  assignmentController.getSubmissions
);

module.exports = router;
