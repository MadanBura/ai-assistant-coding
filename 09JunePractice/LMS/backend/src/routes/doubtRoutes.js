const express = require('express');
const router = express.Router();
const doubtController = require('../controllers/doubtController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { validateDoubtCreate, validateAnswerCreate } = require('../middlewares/validator');

router.post(
  '/doubts',
  verifyToken,
  verifyRole('Learner'),
  validateDoubtCreate,
  doubtController.createDoubt
);

router.post(
  '/v1/doubts',
  verifyToken,
  verifyRole('Learner'),
  validateDoubtCreate,
  doubtController.createDoubt
);

// Support both :id and :doubtId
router.post(
  '/doubts/:id/answers',
  verifyToken,
  validateAnswerCreate,
  doubtController.postAnswer
);

router.post(
  '/v1/doubts/:id/answers',
  verifyToken,
  validateAnswerCreate,
  doubtController.postAnswer
);

router.get(
  '/doubts',
  verifyToken,
  doubtController.getDoubts
);

router.get(
  '/v1/doubts',
  verifyToken,
  doubtController.getDoubts
);

module.exports = router;
