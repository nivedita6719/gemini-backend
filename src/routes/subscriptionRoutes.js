const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes
router.post('/subscribe/pro', authMiddleware, subscriptionController.subscribePro);
router.get('/status', authMiddleware, subscriptionController.getSubscriptionStatus);

module.exports = router;
