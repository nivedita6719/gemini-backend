// src/controllers/chatroomController.js

const pool = require('../config/db');
const redisClient = require('../config/redis');
const { addGeminiJob } = require('../queues/geminiQueue');

// Create a new chatroom
exports.createChatroom = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;

  try {
    const newChatroom = await pool.query(
      'INSERT INTO chatrooms (user_id, name) VALUES ($1, $2) RETURNING *',
      [userId, name || 'New Chat']
    );
    res.status(201).json(newChatroom.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// List all chatrooms for the user (with Redis caching)
exports.listChatrooms = async (req, res) => {
  const userId = req.user.userId;
  const cacheKey = `user:${userId}:chatrooms`;

  try {
    const cachedChatrooms = await redisClient.get(cacheKey);
    if (cachedChatrooms) {
      return res.status(200).json(JSON.parse(cachedChatrooms));
    }

    const chatrooms = await pool.query('SELECT * FROM chatrooms WHERE user_id = $1', [userId]);

    await redisClient.setEx(cacheKey, 300, JSON.stringify(chatrooms.rows)); // TTL = 5 mins
    res.status(200).json(chatrooms.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Get a specific chatroom by id
exports.getChatroom = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const chatroom = await pool.query(
      'SELECT * FROM chatrooms WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (chatroom.rows.length === 0) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    res.status(200).json(chatroom.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Send a message in a chatroom and get Gemini response (async via queue)
exports.sendMessage = async (req, res) => {
  const { id: chatroomId } = req.params;
  const { message: userMessage } = req.body;
  const userId = req.user.userId;

  try {
    // Check if the chatroom belongs to the user
    const chatroom = await pool.query(
      'SELECT * FROM chatrooms WHERE id = $1 AND user_id = $2',
      [chatroomId, userId]
    );

    if (chatroom.rows.length === 0) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }

    // Save the user message
    const newMessage = await pool.query(
      'INSERT INTO messages (chatroom_id, user_message) VALUES ($1, $2) RETURNING *',
      [chatroomId, userMessage]
    );

    // Add job to queue for Gemini response
    await addGeminiJob({
      messageId: newMessage.rows[0].id,
      chatroomId,
      userMessage
    });

    res.status(202).json({
      message: 'Message received. Processing AI response.'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
