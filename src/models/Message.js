const pool = require('../config/db');

exports.create = (chatroomId, userMessage) => {
  return pool.query(
    'INSERT INTO messages (chatroom_id, user_message) VALUES ($1, $2) RETURNING *',
    [chatroomId, userMessage]
  );
};

exports.updateAIResponse = (messageId, aiResponse) => {
  return pool.query(
    'UPDATE messages SET ai_response = $1 WHERE id = $2',
    [aiResponse, messageId]
  );
};

exports.countTodayMessages = (userId, today) => {
  return pool.query(`
    SELECT COUNT(*) FROM messages 
    WHERE chatroom_id IN (
      SELECT id FROM chatrooms WHERE user_id = $1
    ) AND created_at >= $2
  `, [userId, today]);
};
