const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const progressRoutes = require('./progressRoutes');
const announcementRoutes = require('./announcementRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const doubtRoutes = require('./doubtRoutes');
const quizFeedbackRoutes = require('./quizFeedbackRoutes');
const gamificationRoutes = require('./gamificationRoutes');

router.use('/auth', authRoutes);
// progressRoutes MUST be registered before courseRoutes.
// /courses/enrolled must resolve before /courses/:id (wildcard) captures it.
router.use('/', progressRoutes);
router.use('/', announcementRoutes);
router.use('/', assignmentRoutes);
router.use('/', doubtRoutes);
router.use('/', quizFeedbackRoutes);
router.use('/', gamificationRoutes);
router.use('/', courseRoutes);

module.exports = router;



