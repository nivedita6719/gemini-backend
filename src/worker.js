
const { Worker } = require('bullmq');
require('dotenv').config();
const { callGeminiAPI } = require('./utils/gemini');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL, {
  tls: true,
  rejectUnauthorized: false,
  maxRetriesPerRequest: null, // ✅ Required by BullMQ
});

const worker = new Worker(
  'gemini-message-queue',
  async (job) => {
    const { prompt, chatroomId, userId } = job.data;

    const response = await callGeminiAPI(prompt);
    console.log('✅ Gemini API response:', response);
    return response;
  },
  { connection }
);

worker.on('completed', (job, result) => {
  console.log(`✅ Job completed: ${job.id}`, result);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job failed: ${job.id}`, err);
});
