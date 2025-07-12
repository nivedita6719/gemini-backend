
// src/controllers/stripeController.js

require('dotenv').config(); // ✅ Load env variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/db');

// ✅ Create Stripe Checkout Session
exports.subscribePro = async (req, res) => {
  const userId = req.user.userId;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: process.env.STRIPE_PRO_PRICE_ID, // ✅ Must be set in .env
        quantity: 1,
      }],
      success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/cancel',
      client_reference_id: userId, // ✅ Pass userId for webhook use
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: 'Stripe Checkout Failed' });
  }
};

// ✅ Stripe Webhook Handler
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // ✅ Requires express.raw in route
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.client_reference_id;
      const subscriptionId = session.subscription;

      await pool.query(
        `INSERT INTO subscriptions (user_id, stripe_subscription_id, status, tier)
         VALUES ($1, $2, 'active', 'pro')
         ON CONFLICT (user_id) DO UPDATE 
         SET stripe_subscription_id = $2, status = 'active', tier = 'pro'`,
        [userId, subscriptionId]
      );
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await pool.query(
        `UPDATE subscriptions 
         SET status = 'canceled' 
         WHERE stripe_subscription_id = $1`,
        [subscription.id]
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
