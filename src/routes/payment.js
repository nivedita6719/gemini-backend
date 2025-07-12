const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const auth = require('../middlewares/authMiddleware');

// Route to subscribe to PRO plan
router.post('/subscribe/pro', auth, stripeController.subscribePro);

// Stripe webhook (note: this must use raw body parser in index.js)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

module.exports = router;
