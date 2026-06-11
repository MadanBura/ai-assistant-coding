const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate
} = require('../middlewares/validator');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, validateProfileUpdate, authController.updateProfile);

module.exports = router;
