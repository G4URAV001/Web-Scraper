const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register route
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 8 characters').isLength({ min: 8 })
  ],
  authController.register
);

// Login route
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// Get current user
router.get('/me', protect, authController.getMe);

// Regenerate API key
router.post('/regenerate-api-key', protect, authController.regenerateApiKey);

// Update webhook URL
router.post(
  '/webhook',
  [
    check('webhookUrl', 'Valid webhook URL is required').isURL()
  ],
  protect,
  authController.updateWebhook
);

module.exports = router;
