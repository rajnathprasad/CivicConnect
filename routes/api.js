// routes/api.js
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/gemini-chat", async (req, res) => {
  try {
    const { chatHistory } = req.body;

    if (!chatHistory || !Array.isArray(chatHistory)) {
      return res.status(400).json({ error: "Invalid chat history format" });
    }

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

    // Try gemini-1.5-flash-latest first
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const result = await model.generateContent(finalPrompt);
    const response = result.response;
    const reply = response.text();

    if (!reply) {
      return res.status(500).json({ error: "Gemini returned no text." });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);
    
    if (err.status === 429) {
      return res.status(429).json({ 
        error: "Rate limit exceeded", 
        message: "Please wait a moment and try again."
      });
    }
    
    if (err.status === 404) {
      return res.status(500).json({ 
        error: "Model not found", 
        message: "The specified Gemini model is not available."
      });
    }
    
    return res.status(500).json({ 
      error: "Gemini request failed", 
      detail: err.message 
    });
  }
});

module.exports = router;