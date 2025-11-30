// routes/api.js
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Init client with API key
const genAI = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// POST /api/gemini-chat
router.post("/gemini-chat", async (req, res) => {
  try {
    const { chatHistory } = req.body;

    if (!chatHistory || !Array.isArray(chatHistory)) {
      return res.status(400).json({ error: "Invalid chat history format" });
    }

    // Convert your chat history into a simple single string prompt
    // because the new SDK supports multi-turn chat in a different format
    let finalPrompt = "";

    chatHistory.forEach((msg) => {
      if (!msg || !msg.content) return;
      if (msg.role === "user") {
        finalPrompt += `User: ${msg.content}\n`;
      } else if (msg.role === "assistant") {
        finalPrompt += `Assistant: ${msg.content}\n`;
      }
    });

    finalPrompt += "\nAssistant:";

    // Call Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const response = await model.generateContent({
      contents: finalPrompt,
    });

    const reply = response.text();

    if (!reply) {
      return res.status(500).json({ error: "Gemini returned no text." });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({ error: "Gemini request failed", detail: err.message });
  }
});

module.exports = router;
