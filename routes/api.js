const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Init client with API key - FIXED: Pass API key directly as string
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/gemini-chat
router.post("/gemini-chat", async (req, res) => {
  try {
    const { chatHistory } = req.body;

    if (!chatHistory || !Array.isArray(chatHistory)) {
      return res.status(400).json({ error: "Invalid chat history format" });
    }

    // Convert chat history to proper format
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

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // FIXED: Correct way to call generateContent
    const result = await model.generateContent(finalPrompt);
    
    // FIXED: Correct way to extract text from response
    const response = await result.response;
    const reply = response.text();

    if (!reply) {
      return res.status(500).json({ error: "Gemini returned no text." });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({ 
      error: "Gemini request failed", 
      detail: err.message 
    });
  }
});

module.exports = router;