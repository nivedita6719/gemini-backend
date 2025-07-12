// worker.js
const Queue = require('./config/queue'); // adjust if queue is in a different path
const { callGeminiAPI } = require('./utils/gemini'); // your Gemini API helper

Queue.process(async (job) => {
  const { prompt, chatroomId, userId } = job.data;

  try {
    const geminiResponse = await callGeminiAPI(prompt);
    console.log('✅ Gemini response processed:', geminiResponse);
    return geminiResponse;
  } catch (error) {
    console.error('❌ Failed to process job:', error);
    throw error;
  }
});

Queue.on('completed', (job, result) => {
  console.log(`✅ Job completed:`, job.id, '→ Result:', result);
});

Queue.on('failed', (job, err) => {
  console.error(`❌ Job failed:`, job.id, '→', err);
});
