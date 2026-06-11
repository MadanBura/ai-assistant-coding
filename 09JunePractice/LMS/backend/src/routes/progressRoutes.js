const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { validateQuizSubmit } = require('../middlewares/validator');

router.get('/courses/enrolled', verifyToken, verifyRole('Learner'), progressController.getEnrolledCourses);
router.post('/courses/:id/enroll', verifyToken, verifyRole('Learner'), progressController.enroll);
router.get('/courses/:id/progress', verifyToken, verifyRole('Learner'), progressController.getProgress);
router.post('/topics/:topicId/complete', verifyToken, verifyRole('Learner'), progressController.completeTopic);
router.get('/courses/:id/topics/:topicId', verifyToken, verifyRole('Learner'), progressController.getTopicDetails);

// Evaluation endpoints
router.get('/topics/:topicId/assessment', verifyToken, verifyRole('Learner'), progressController.getTopicAssessment);
router.post('/topics/:topicId/assessment/submit', verifyToken, verifyRole('Learner'), validateQuizSubmit, progressController.submitQuizAssessment);
router.get('/courses/:id/final-exam', verifyToken, verifyRole('Learner'), progressController.getFinalExam);
router.post('/courses/:id/final-exam/submit', verifyToken, verifyRole('Learner'), validateQuizSubmit, progressController.submitFinalExam);
router.get('/courses/:id/certificate', verifyToken, verifyRole('Learner'), progressController.getCertificate);

module.exports = router;
