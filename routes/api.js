// routes/api.js
const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

// Init client - pass apiKey directly in the config object
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

console.log("Server GEMINI_API_KEY starts with:", process.env.GEMINI_API_KEY?.slice(0, 5));

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

router.post("/gemini-chat", async (req, res) => {
  try {
    const { chatHistory } = req.body;
    if (!chatHistory || !Array.isArray(chatHistory)) {
      return res.status(400).json({ error: "Invalid chat history format" });
    }

    // Build prompt from chat history
    let finalPrompt = "";
    for (const msg of chatHistory) {
      if (!msg || !msg.content) continue;
      if (msg.role === "user") finalPrompt += `User: ${msg.content}\n`;
      else if (msg.role === "assistant") finalPrompt += `Assistant: ${msg.content}\n`;
    }
    finalPrompt += "\nAssistant:";

    // Call the API with the new SDK
    const result = await genAI.models.generateContent({
      model: MODEL,
      contents: finalPrompt,
    });

    const reply = result.text; // Direct property access, not a function

    if (!reply) {
      console.error("No reply from Gemini");
      return res.status(500).json({ error: "No reply from Gemini" });
    }

    return res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({
      error: "Gemini request failed",
      detail: err?.message || String(err),
    });
  }
});

module.exports = router;