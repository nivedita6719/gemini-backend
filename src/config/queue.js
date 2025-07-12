// src/config/queue.js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
require('dotenv').config();

const connection = new IORedis(process.env.REDIS_URL, {
  tls: true,
  rejectUnauthorized: false,
});

const GeminiQueue = new Queue('gemini-message-queue', {
  connection,
});

module.exports = GeminiQueue;
