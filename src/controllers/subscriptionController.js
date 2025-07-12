// src/controllers/subscriptionController.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/db');

// Initiate Pro subscription
exports.subscribePro = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for existing Stripe customer
    let customerId = user.rows[0].stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          userId: userId,
          mobileNumber: user.rows[0].mobile_number
        }
      });

      customerId = customer.id;

      // Save customer ID to user table
      await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, userId]);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://yourdomain.com/cancel',
      metadata: {
        userId: userId
      }
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.metadata.userId;
      const subscriptionId = session.subscription;

      await pool.query(`
        INSERT INTO subscriptions (user_id, stripe_subscription_id, status, tier)
        VALUES ($1, $2, 'active', 'pro')
        ON CONFLICT (user_id) DO UPDATE
        SET stripe_subscription_id = $2, status = 'active', tier = 'pro'
      `, [userId, subscriptionId]);
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await pool.query(`
        UPDATE subscriptions 
        SET status = 'canceled'
        WHERE stripe_subscription_id = $1
      `, [subscription.id]);
      break;
  }

  res.json({ received: true });
};
exports.getSubscriptionStatus = async (req, res) => {
  const userId = req.user.userId;

  try {
    const subscription = await pool.query(`
      SELECT tier, status FROM subscriptions 
      WHERE user_id = $1 AND status = 'active'
    `, [userId]);

    if (subscription.rows.length > 0) {
      res.status(200).json({ tier: subscription.rows[0].tier });
    } else {
      res.status(200).json({ tier: 'basic' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
