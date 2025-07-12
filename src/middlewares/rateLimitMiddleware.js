const pool = require('../config/db');

module.exports = async (req, res, next) => {
  const userId = req.user.userId;

  try {
    // Get user's subscription tier
    const subscription = await pool.query(`
      SELECT tier FROM subscriptions 
      WHERE user_id = $1 AND status = 'active'
    `, [userId]);

    const tier = subscription.rows.length > 0 ? subscription.rows[0].tier : 'basic';

    if (tier === 'basic') {
      // Count messages today for the user
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const messageCount = await pool.query(`
        SELECT COUNT(*) FROM messages 
        WHERE chatroom_id IN (
          SELECT id FROM chatrooms WHERE user_id = $1
        ) AND created_at >= $2
      `, [userId, today]);

      const count = parseInt(messageCount.rows[0].count);

      if (count >= 5) {
        return res.status(429).json({ error: 'Daily message limit reached for basic tier' });
      }
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
