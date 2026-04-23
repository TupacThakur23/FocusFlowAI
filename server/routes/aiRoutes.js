import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});


router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({ reply: response.text() });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "AI failed" });
  }
});


export default router; 