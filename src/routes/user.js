const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

router.get('/subscription/status', auth, userController.getSubscriptionStatus);

module.exports = router;
