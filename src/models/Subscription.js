const pool = require('../config/db');

exports.getUserSubscription = (userId) => {
  return pool.query(
    'SELECT tier, status FROM subscriptions WHERE user_id = $1 AND status = $2',
    [userId, 'active']
  );
};

exports.upsertProSubscription = (userId, stripeSubId) => {
  return pool.query(`
    INSERT INTO subscriptions (user_id, stripe_subscription_id, status, tier)
    VALUES ($1, $2, 'active', 'pro')
    ON CONFLICT (user_id) DO UPDATE
    SET stripe_subscription_id = $2, status = 'active', tier = 'pro'
  `, [userId, stripeSubId]);
};

exports.cancelSubscription = (stripeSubId) => {
  return pool.query(`UPDATE subscriptions SET status = 'canceled' WHERE stripe_subscription_id = $1`, [stripeSubId]);
};
