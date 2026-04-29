import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const result = await model.generateContent(text);
    const response = await result.response;

    res.json({
      summary: response.text(),
    });

  } catch (error) {
    console.error("AI ROUTE ERROR:", error);
    res.status(500).json({
      error: "AI failed",
    });
  }
});

export default router;