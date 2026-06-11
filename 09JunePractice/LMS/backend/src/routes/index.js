const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const progressRoutes = require('./progressRoutes');

router.use('/auth', authRoutes);
router.use('/', courseRoutes);
router.use('/', progressRoutes);

module.exports = router;
