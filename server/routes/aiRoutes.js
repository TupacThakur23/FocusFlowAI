import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Research from "../models/Research.js";

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

// Clean extraction text (optional cleanup if needed by frontend)
router.post("/extract", async (req, res) => {
  try {
    const { text, url, title } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    
    // Very basic cleaning for MVP: collapse multiple newlines and spaces
    const cleanedText = text
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/ +/g, ' ')
      .trim();

    res.json({
      cleanedText,
      url,
      title,
      wordCount: cleanedText.split(/\s+/).length
    });
  } catch (error) {
    console.error("EXTRACT ROUTE ERROR:", error);
    res.status(500).json({ error: "Extraction processing failed" });
  }
});

// Q&A based on context
router.post("/ask", async (req, res) => {
  try {
    const { context, question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const prompt = context 
      ? `Based on the following context, answer the user's question.\n\nContext:\n${context.substring(0, 15000)}\n\nQuestion: ${question}`
      : question;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({
      answer: response.text(),
    });

  } catch (error) {
    console.error("AI ASK ERROR:", error);
    res.status(500).json({
      error: "AI answering failed",
    });
  }
});

// Workbook Context Chat (Phase 1 & 3)
router.post("/workbook-chat", async (req, res) => {
  try {
    const { workbook, query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const researchItems = await Research.find({ workbook: workbook || "Research Workbook" });
    
    let contextString = `WORKBOOK CONTEXT FOR: "${workbook || 'Research Workbook'}"\n\n`;
    researchItems.forEach((item, index) => {
      contextString += `--- SOURCE ${index + 1} ---\n`;
      contextString += `Topic: ${item.topic}\n`;
      if (item.link) contextString += `URL: ${item.link}\n`;
      if (item.summary) contextString += `Summary: ${item.summary}\n`;
      if (item.notes) contextString += `Notes: ${item.notes}\n`;
      contextString += `Date: ${item.date}\n\n`;
    });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are the AI Research Copilot. Answer the user's query ONLY using the provided workbook context. Your response must be highly structured. Always cite sources from the context when making claims. Output your response as a JSON object with this exact structure: { \"introText\": \"A brief 1-2 sentence introduction\", \"insights\": [ { \"title\": \"Theme or Insight title\", \"desc\": \"Detailed explanation\", \"sources\": \"E.g. 2 sources (Topic Name)\", \"color\": \"bg-blue-500/20 text-blue-400\" } ] } Do not output raw markdown, only the JSON object."
    });

    const prompt = `Context:\n${contextString}\n\nUser Query: ${query}`;
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    
    let parsedResponse;
    try {
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(jsonStr);
    } catch (e) {
      parsedResponse = { introText: responseText, insights: [] };
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error("WORKBOOK CHAT ERROR:", error);
    res.status(500).json({ error: "Failed to generate workbook response" });
  }
});

// Workbook Context Insights (Phase 4 & 5)
router.get("/workbook-insights", async (req, res) => {
  try {
    const workbook = req.query.workbook || "Research Workbook";
    const researchItems = await Research.find({ workbook });
    
    if (researchItems.length === 0) {
      return res.json({ keyInsights: [], topEntities: [] });
    }

    let contextString = `WORKBOOK CONTEXT FOR: "${workbook}"\n\n`;
    researchItems.forEach((item) => {
      contextString += `Topic: ${item.topic}\n`;
      if (item.summary) contextString += `Summary: ${item.summary}\n`;
      contextString += `\n`;
    });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "Analyze the research workbook context. Identify the 3 most prominent themes/insights and the top 5 entities/concepts. Output as JSON: { \"keyInsights\": [ { \"title\": \"Insight Title\", \"desc\": \"Brief description\", \"type\": \"trend\" | \"gap\" | \"focus\", \"color\": \"text-emerald-400\", \"chartColor\": \"border-emerald-500\" } ], \"topEntities\": [ { \"label\": \"Concept Name\", \"count\": number, \"color\": \"text-blue-500\" } ] } Do not include markdown formatting, just JSON."
    });

    const result = await model.generateContent(contextString);
    const responseText = await result.response.text();
    
    let parsedResponse;
    try {
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(jsonStr);
    } catch (e) {
      parsedResponse = { keyInsights: [], topEntities: [] };
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error("WORKBOOK INSIGHTS ERROR:", error);
    res.status(500).json({ error: "Failed to generate workbook insights" });
  }
});

export default router;