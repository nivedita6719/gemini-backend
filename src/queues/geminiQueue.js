// src/queues/geminiQueue.js

const { Queue, Worker } = require('bullmq');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require('../config/db');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Queue config
const queueName = 'gemini-queue';
const connection = {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  }
};

// Create queue
const geminiQueue = new Queue(queueName, connection);

// Add job to queue
const addGeminiJob = async (data) => {
  await geminiQueue.add('process-message', data);
};

// Process job
const worker = new Worker(queueName, async job => {
  const { messageId, chatroomId, userMessage } = job.data;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();

    // Save Gemini response to DB
    await pool.query(
      'UPDATE messages SET ai_response = $1 WHERE id = $2',
      [text, messageId]
    );

    return text;
  } catch (error) {
    console.error('Error processing Gemini job:', error);
    throw error;
  }
}, connection);

module.exports = {
  addGeminiJob
};
