const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post('/gemini-chat', async (req, res) => {
  const { chatHistory } = req.body;

  if (!chatHistory || !Array.isArray(chatHistory)) {
    return res.status(400).json({ error: 'Invalid chat history format' });
  }

  try {
    // Only allow 'user' and 'model' roles
    const contents = chatHistory.map(entry => ({
      role: entry.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: entry.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error('Gemini API response missing expected content:', data);
      return res.status(500).json({ error: 'Invalid response from Gemini API' });
    }

    res.json({ reply });
  } catch (err) {
    console.error('❌ Gemini error:', err);
    res.status(500).json({ error: 'Gemini API failed.' });
  }
});

module.exports = router;
