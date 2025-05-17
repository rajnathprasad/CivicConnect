const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post('/gemini-chat', async (req, res) => {
  const { chatHistory } = req.body;

  // Validate input
  if (!chatHistory || !Array.isArray(chatHistory)) {
    return res.status(400).json({ error: 'Invalid chat history format' });
  }

  try {
    // Allow only 'user' and 'assistant', and convert 'assistant' to 'model'
    const allowedRoles = ['user', 'assistant'];
    const contents = chatHistory
      .filter(entry => allowedRoles.includes(entry.role))
      .map(entry => ({
        role: entry.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: entry.content }]
      }));

    // Send request to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      }
    );

    const data = await response.json();

    // Handle non-200 responses
    if (!response.ok) {
      console.error('❌ Gemini API returned an error:', data);
      return res.status(response.status).json({
        error: data?.error?.message || 'Unknown error from Gemini API',
        details: data
      });
    }

    // Extract reply from Gemini response
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error('Gemini API response missing expected content:', data);
      return res.status(500).json({ error: 'Invalid response from Gemini API', data });
    }

    res.json({ reply });
  } catch (err) {
    console.error('❌ Gemini API request failed:', err);
    res.status(500).json({ error: 'Gemini API request failed.' });
  }
});

module.exports = router;
