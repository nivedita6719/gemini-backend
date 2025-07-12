// src/utils/gemini.js
const axios = require('axios');
require('dotenv').config();

async function callGeminiAPI(prompt) {
  const API_KEY = process.env.GEMINI_API_KEY;

  const response = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    {
      contents: [{ parts: [{ text: prompt }] }],
    },
    {
      params: { key: API_KEY },
    }
  );

  return response.data;
}

module.exports = { callGeminiAPI };
