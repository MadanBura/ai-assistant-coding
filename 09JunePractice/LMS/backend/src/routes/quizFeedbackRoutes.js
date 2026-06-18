const express = require('express');
const router = express.Router();
const quizFeedbackController = require('../controllers/quizFeedbackController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { validateQuizSubmit, validateQuizFeedbackSetup } = require('../middlewares/validator');

router.post(
  '/quiz-feedback/setup',
  verifyToken,
  verifyRole('Instructor'),
  validateQuizFeedbackSetup,
  quizFeedbackController.setupQuiz
);

router.post(
  '/v1/quiz-feedback/setup',
  verifyToken,
  verifyRole('Instructor'),
  validateQuizFeedbackSetup,
  quizFeedbackController.setupQuiz
);

router.post(
  '/quiz-feedback/submit',
  verifyToken,
  verifyRole('Learner'),
  validateQuizSubmit,
  quizFeedbackController.submitQuiz
);

router.post(
  '/v1/quiz-feedback/submit',
  verifyToken,
  verifyRole('Learner'),
  validateQuizSubmit,
  quizFeedbackController.submitQuiz
);

// Retrieve attempt
router.get(
  '/attempts/:id',
  verifyToken,
  quizFeedbackController.getQuizAttempt
);

router.get(
  '/v1/attempts/:id',
  verifyToken,
  quizFeedbackController.getQuizAttempt
);

module.exports = router;
