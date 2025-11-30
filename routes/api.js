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

    // Use gemini-2.0-flash like your working project
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(finalPrompt);
    
    // FIXED: No await before result.response (just like your working code)
    const reply = result.response.text();

    if (!reply) {
      return res.status(500).json({ error: "Gemini returned no text." });
    }

    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);
    
    return res.status(500).json({ 
      error: "Gemini request failed", 
      detail: err.message,
      status: err.status
    });
  }
});

module.exports = router;