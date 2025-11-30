// routes/api.js
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Init client (use object form for server)
const genAI = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// configurable model
const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function safeExtractText(result) {
  try {
    // Preferred: SDK provides .text() on the result
    if (result && typeof result.text === "function") {
      return result.text();
    }

    // Some versions return a `response` object with .text()
    if (result && result.response && typeof result.response.text === "function") {
      return result.response.text();
    }

    // If result.candidates... try common shapes
    if (result && result.candidates && result.candidates[0]) {
      const cand = result.candidates[0];
      if (cand.content) {
        if (Array.isArray(cand.content)) {
          return cand.content.map(c => c.text || (c.parts && c.parts.map(p=>p.text||"").join(" ")) || "").join(" ");
        }
        if (cand.content.parts && Array.isArray(cand.content.parts)) {
          return cand.content.parts.map(p => p.text || "").join(" ");
        }
      }
      if (cand.text) return cand.text;
    }

    // fallback: try stringify (short)
    const s = JSON.stringify(result);
    return s.length < 2000 ? s : null;
  } catch (e) {
    console.warn("safeExtractText error", e);
    return null;
  }
}

router.post("/gemini-chat", async (req, res) => {
  try {
    const { chatHistory } = req.body;
    if (!chatHistory || !Array.isArray(chatHistory)) {
      return res.status(400).json({ error: "Invalid chat history format" });
    }

    // build simple textual prompt (same approach as your working client)
    let finalPrompt = "";
    for (const msg of chatHistory) {
      if (!msg || !msg.content) continue;
      if (msg.role === "user") finalPrompt += `User: ${msg.content}\n`;
      else if (msg.role === "assistant") finalPrompt += `Assistant: ${msg.content}\n`;
    }
    finalPrompt += "\nAssistant:";

    // create model instance
    const model = genAI.getGenerativeModel({ model: MODEL });

    // call generateContent with canonical shape
    const result = await model.generateContent({
      contents: finalPrompt,
    });

    // Log raw result (trimmed) so you can see in Render logs when debugging
    try {
      const raw = JSON.stringify(result, null, 2);
      console.log("Gemini raw result (trimmed):", raw.length > 2000 ? raw.slice(0, 2000) + "...(truncated)" : raw);
    } catch (e) {
      console.log("Gemini raw result: (could not stringify)", e);
    }

    // extract reply safely
    let reply = safeExtractText(result);

    // If extraction failed, try an async extraction if present (some shapes)
    if (!reply && result && result.response && typeof result.response.text === "function") {
      try {
        reply = await result.response.text();
      } catch (e) {
        // ignore
      }
    }

    if (!reply) {
      console.error("No reply extracted from Gemini result. Full result:", result);
      return res.status(500).json({ error: "No reply extracted from Gemini", raw: result });
    }

    return res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);
    // return helpful info to client (not leaking sensitive data)
    return res.status(500).json({
      error: "Gemini request failed",
      detail: err?.message || String(err),
    });
  }
});

module.exports = router;