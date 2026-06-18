const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { validateBadgeCreate } = require('../middlewares/validator');

router.post(
  '/gamification/badges',
  verifyToken,
  verifyRole('Instructor'),
  validateBadgeCreate,
  gamificationController.createBadge
);

router.get(
  '/gamification/instructor/badges',
  verifyToken,
  verifyRole('Instructor'),
  gamificationController.getInstructorBadges
);

router.post(
  '/v1/gamification/badges',
  verifyToken,
  verifyRole('Instructor'),
  validateBadgeCreate,
  gamificationController.createBadge
);

router.post(
  '/courses/:id/badges',
  verifyToken,
  verifyRole('Instructor'),
  validateBadgeCreate,
  gamificationController.createBadge
);

router.get(
  '/gamification/badges',
  verifyToken,
  gamificationController.getUserBadges
);

router.get(
  '/v1/gamification/badges',
  verifyToken,
  gamificationController.getUserBadges
);

router.get(
  '/users/badges',
  verifyToken,
  gamificationController.getUserBadges
);

module.exports = router;
