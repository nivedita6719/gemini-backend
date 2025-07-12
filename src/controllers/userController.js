const pool = require('../config/db');

exports.getSubscriptionStatus = async (req, res) => {
  const userId = req.user.userId;
  const user = await pool.query('SELECT tier FROM users WHERE id = $1', [userId]);
  res.json({ tier: user.rows[0].tier || 'basic' });
};
