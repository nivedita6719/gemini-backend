
// src/config/db.js

const { Pool } = require('pg');           // PostgreSQL client
require('dotenv').config();               // Load environment variables from .env

// Create a pool of connections
const pool = new Pool({
  user: process.env.DB_USER,             // e.g., postgres
  host: process.env.DB_HOST,             // e.g., localhost
  database: process.env.DB_NAME,         // e.g., gemini_db
  password: process.env.DB_PASSWORD,     // e.g., your actual password
  port: process.env.DB_PORT,             // e.g., 5432
});

// Optional: test connection when server starts
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL Database'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err));

module.exports = pool;
