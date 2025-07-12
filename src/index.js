
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config(); // Load env variables

const app = express(); // ✅ Define app before using it

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatroomRoutes = require('./routes/chatroomRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paymentRoutes = require('./routes/payment');

// Import Stripe webhook controller
const subscriptionController = require('./controllers/subscriptionController');

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json()); // for JSON bodies

// Stripe webhook requires raw body parser
app.post('/webhook/stripe', bodyParser.raw({ type: 'application/json' }), subscriptionController.stripeWebhook);

// ✅ Mount API routes AFTER `app` is defined
app.use('/auth', authRoutes);
app.use('/chatroom', chatroomRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/api', paymentRoutes); // <-- this must come AFTER app is defined

// Health check
app.get('/', (req, res) => {
  res.send('✅ Gemini backend API running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
