const express = require('express');
const router = express.Router();
const chatroomController = require('../controllers/chatroomController');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimitMiddleware = require('../middlewares/rateLimitMiddleware');

// Routes (protected)
router.post('/', authMiddleware, chatroomController.createChatroom);
router.get('/', authMiddleware, chatroomController.listChatrooms);
router.get('/:id', authMiddleware, chatroomController.getChatroom);
router.post('/:id/message', authMiddleware, rateLimitMiddleware, chatroomController.sendMessage);

module.exports = router;
