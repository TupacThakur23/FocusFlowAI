import express from "express";
import OpenAI from "openai";

const router = express.Router();

router.post("/summarize", async (req, res) => {
  const openai = new OpenAI(); // Ensure dotenv loads first before instantiating
  const { text } = req.body;
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", content: text }
    ]
  });
  res.json({ summary: response.choices[0].message.content });
});

export default router;
