import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

router.post("/summarize", async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { text } = req.body;
    
    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: text.substring(0, 50000) // Cap the string arbitrarily to protect token allowance
        });
        res.json({ summary: response.text });
    } catch(geminiErr) {
        if (geminiErr.status === 429 || geminiErr.status === 503) {
            res.json({ summary: "⚠️ Google Gemini Free Tier Quota Exceeded (Speed Limit).\n\nPlease wait about 60 seconds for your rate limit to refresh before triggering this operation again." });
        } else {
            throw geminiErr;
        }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate AI content" });
  }
});

export default router;
