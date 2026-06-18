const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const { validateAnnouncementCreate, validateAnnouncementGet } = require('../middlewares/validator');

// /api/announcements or /api/v1/announcements
router.post(
  '/announcements',
  verifyToken,
  verifyRole('Instructor'),
  validateAnnouncementCreate,
  announcementController.createAnnouncement
);

router.post(
  '/v1/announcements',
  verifyToken,
  verifyRole('Instructor'),
  validateAnnouncementCreate,
  announcementController.createAnnouncement
);

router.get(
  '/announcements',
  verifyToken,
  validateAnnouncementGet,
  announcementController.getAnnouncements
);

router.get(
  '/v1/announcements',
  verifyToken,
  validateAnnouncementGet,
  announcementController.getAnnouncements
);

// /api/courses/:id/announcements
router.post(
  '/courses/:id/announcements',
  verifyToken,
  verifyRole('Instructor'),
  validateAnnouncementCreate,
  announcementController.createAnnouncement
);

router.get(
  '/courses/:id/announcements',
  verifyToken,
  validateAnnouncementGet,
  announcementController.getAnnouncements
);

module.exports = router;
