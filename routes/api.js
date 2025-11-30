// routes/api.js
const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// robust extractor for various Gemini response shapes
function extractReplyFromGemini(data) {
  if (!data) return null;

  // Common: v1 generateContent -> candidates -> [0] -> content -> parts -> [0] -> text
  try {
    const cand = data.candidates && data.candidates[0];
    if (cand) {
      // candidate.content might be an array of items or object
      const content = cand.content;
      if (Array.isArray(content)) {
        // find first part with text
        for (const item of content) {
          if (item && item.text) return item.text;
          // nested parts
          if (item.parts && Array.isArray(item.parts) && item.parts[0] && item.parts[0].text) {
            return item.parts.map(p => p.text || '').join(' ');
          }
        }
      } else if (content && content.parts && Array.isArray(content.parts) && content.parts[0]) {
        return content.parts.map(p => p.text || '').join(' ');
      } else if (content && content.text) {
        return content.text;
      }
    }

    // Another common shape: data.output_text or data.text
    if (data.output_text) return data.output_text;
    if (data.text) return data.text;

    // openai-like shape fallback
    if (data.choices && data.choices[0]) {
      const ch = data.choices[0];
      if (ch.message && ch.message.content) {
        if (typeof ch.message.content === 'string') return ch.message.content;
        if (Array.isArray(ch.message.content)) return ch.message.content.map(c => c.text || '').join(' ');
      }
      if (ch.text) return ch.text;
      if (ch.delta && ch.delta.content) return ch.delta.content;
    }
  } catch (e) {
    // fall through to fallback
    console.warn('extractReplyFromGemini: extraction error', e);
  }

  // last resort: try to stringify something helpful
  try {
    const s = JSON.stringify(data);
    return s.length < 2000 ? s : null;
  } catch (e) {
    return null;
  }
}

router.post('/gemini-chat', async (req, res) => {
  const { chatHistory } = req.body;

  if (!GEMINI_API_KEY) {
    console.error('Gemini API key missing in env');
    return res.status(500).json({ error: 'Server misconfiguration: GEMINI_API_KEY missing' });
  }

  // Validate input
  if (!chatHistory || !Array.isArray(chatHistory)) {
    return res.status(400).json({ error: 'Invalid chat history format' });
  }

  try {
    // prepare contents - allow only 'user' and 'assistant' and convert assistant->model
    const allowedRoles = ['user', 'assistant'];
    const contents = chatHistory
      .filter(entry => allowedRoles.includes(entry.role))
      .map(entry => ({
        role: entry.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: entry.content }]
      }));

    // send request
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    // log raw response for debugging (safe for dev; remove or trim in production)
    console.log('Gemini raw response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Gemini API returned an error:', data);
      return res.status(response.status).json({
        error: data?.error?.message || 'Unknown error from Gemini API',
        details: data
      });
    }

    const reply = extractReplyFromGemini(data);

    if (!reply) {
      console.error('Gemini API response missing expected content:', data);
      return res.status(500).json({ error: 'Invalid response from Gemini API', data });
    }

    // return a consistent shape for the client
    return res.json({ reply });
  } catch (err) {
    console.error('❌ Gemini API request failed:', err);
    return res.status(500).json({ error: 'Gemini API request failed.' });
  }
});

module.exports = router;
