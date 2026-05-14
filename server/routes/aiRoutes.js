import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Research from "../models/Research.js";
dotenv.config();
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const cleanText = (text = "") => String(text).replace(/\s+/g, " ").trim();
const sentences = (text = "") => cleanText(text).split(/(?<=[.!?])\s+/).filter(Boolean);
const extractTopics = (text = "", title = "") => {
  const source = `${title} ${text}`.toLowerCase();
  const candidates = [["AI", ["ai", "artificial intelligence", "model", "machine learning", "neural"]], ["Research", ["research", "study", "paper", "analysis"]], ["Learning", ["learn", "student", "education", "revision"]], ["Technology", ["software", "browser", "extension", "web", "system"]], ["Ethics", ["ethic", "alignment", "safety", "risk"]]];
  const found = candidates.filter(([, keys]) => keys.some(key => source.includes(key))).map(([label]) => label);
  return [...new Set(found), "Context", "Knowledge"].slice(0, 5);
};
const localAnalysis = ({
  text = "",
  title = "Untitled",
  url = ""
}) => {
  const parts = sentences(text);
  const topics = extractTopics(text, title);
  return {
    summary: parts.slice(0, 2).join(" ") || `Saved research context from ${title}.`,
    keyPoints: (parts.length ? parts : [`${title} is ready for research review.`]).slice(0, 5),
    topics,
    contentType: url ? "article" : "other",
    complexity: "intermediate",
    sentiment: "analytical"
  };
};
const workbookItems = async workbook => Research.find({
  workbook: workbook || "Research Workbook"
}).sort({
  date: -1
});
const withTimeout = (promise, ms = 8000) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("AI request timed out")), ms))]);
router.post("/summarize", async (req, res) => {
  try {
    const {
      text
    } = req.body;
    if (!text) return res.status(400).json({
      error: "Text is required"
    });
    if (!process.env.GEMINI_API_KEY) return res.json({
      summary: localAnalysis({
        text
      }).summary
    });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });
    const result = await model.generateContent(text);
    res.json({
      summary: (await result.response).text()
    });
  } catch (error) {
    console.error("AI ROUTE ERROR:", error);
    res.json({
      summary: localAnalysis({
        text: req.body.text
      }).summary
    });
  }
});
router.post("/extract", async (req, res) => {
  try {
    const {
      text,
      url,
      title
    } = req.body;
    if (!text) return res.status(400).json({
      error: "Text is required"
    });
    const cleanedText = String(text).replace(/\n\s*\n/g, "\n\n").replace(/ +/g, " ").trim();
    res.json({
      cleanedText,
      url,
      title,
      wordCount: cleanedText.split(/\s+/).length
    });
  } catch (error) {
    console.error("EXTRACT ROUTE ERROR:", error);
    res.status(500).json({
      error: "Extraction processing failed"
    });
  }
});
router.post("/ask", async (req, res) => {
  try {
    const {
      context,
      question
    } = req.body;
    if (!question) return res.status(400).json({
      error: "Question is required"
    });
    const fallback = context ? `Based on the saved context, the strongest answer is: ${localAnalysis({
      text: context
    }).summary}` : `I need extracted page or workbook context to answer: ${question}`;
    if (!process.env.GEMINI_API_KEY) return res.json({
      answer: fallback
    });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });
    const prompt = context ? `Based on the following context, answer clearly.\n\nContext:\n${context.substring(0, 15000)}\n\nQuestion: ${question}` : question;
    const result = await model.generateContent(prompt);
    res.json({
      answer: (await result.response).text()
    });
  } catch (error) {
    console.error("AI ASK ERROR:", error);
    res.json({
      answer: `I could not reach the AI model, but your saved context is available. Try again after checking the API key.`
    });
  }
});
router.post("/workbook-chat", async (req, res) => {
  try {
    const {
      workbook,
      query
    } = req.body;
    if (!query) return res.status(400).json({
      error: "Query is required"
    });
    const researchItems = await workbookItems(workbook);
    const fallback = {
      introText: researchItems.length ? `I found ${researchItems.length} saved item${researchItems.length === 1 ? "" : "s"} in ${workbook || "Research Workbook"}.` : "This workbook has no saved items yet.",
      insights: researchItems.slice(0, 5).map((item, index) => ({
        title: item.topic,
        desc: item.summary || item.notes || "Saved from Aide.",
        sources: item.link ? `Source ${index + 1}` : "Saved note",
        color: ["bg-emerald-500/20 text-emerald-400", "bg-blue-500/20 text-blue-400", "bg-violet-500/20 text-violet-400"][index % 3]
      }))
    };
    if (!process.env.GEMINI_API_KEY || researchItems.length === 0) return res.json(fallback);
    let contextString = `WORKBOOK CONTEXT FOR: "${workbook || "Research Workbook"}"\n\n`;
    researchItems.forEach((item, index) => {
      contextString += `--- SOURCE ${index + 1} ---\nTopic: ${item.topic}\nURL: ${item.link || "N/A"}\nSummary: ${item.summary || ""}\nNotes: ${item.notes || ""}\nTags: ${(item.tags || []).join(", ")}\n\n`;
    });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "Answer only using workbook context. Return JSON only: { \"introText\": string, \"insights\": [ { \"title\": string, \"desc\": string, \"sources\": string, \"color\": string } ] }."
    });
    const result = await model.generateContent(`Context:\n${contextString}\n\nUser Query: ${query}`);
    const responseText = await result.response.text();
    try {
      res.json(JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim()));
    } catch {
      res.json(fallback);
    }
  } catch (error) {
    console.error("WORKBOOK CHAT ERROR:", error);
    res.status(500).json({
      error: "Failed to generate workbook response"
    });
  }
});
router.get("/workbook-insights", async (req, res) => {
  try {
    const workbook = req.query.workbook || "Research Workbook";
    const researchItems = await workbookItems(workbook);
    if (researchItems.length === 0) return res.json({
      keyInsights: [],
      topEntities: []
    });
    const fallback = {
      keyInsights: researchItems.slice(0, 3).map((item, index) => ({
        title: ["Emerging Theme", "Knowledge Gap", "Strong Focus"][index] || "Insight",
        desc: item.summary || item.topic,
        type: ["trend", "gap", "focus"][index] || "focus",
        color: ["text-emerald-400", "text-orange-400", "text-violet-400"][index] || "text-blue-400",
        chartColor: ["border-emerald-500", "border-orange-500", "border-violet-500"][index] || "border-blue-500"
      })),
      topEntities: Object.entries(researchItems.reduce((acc, item) => {
        [...(item.tags || []), ...(item.saveOptions || []), item.workbook].filter(Boolean).forEach(label => {
          acc[label] = (acc[label] || 0) + 1;
        });
        return acc;
      }, {})).slice(0, 5).map(([label, count], index) => ({
        label,
        count,
        color: ["text-blue-500", "text-emerald-500", "text-violet-500", "text-orange-500"][index % 4]
      }))
    };
    if (!process.env.GEMINI_API_KEY) return res.json(fallback);
    let contextString = `WORKBOOK CONTEXT FOR: "${workbook}"\n\n`;
    researchItems.forEach(item => {
      contextString += `Topic: ${item.topic}\nSummary: ${item.summary || ""}\nNotes: ${item.notes || ""}\n\n`;
    });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "Analyze workbook context. Return JSON only: { \"keyInsights\": [ { \"title\": string, \"desc\": string, \"type\": \"trend\" | \"gap\" | \"focus\", \"color\": string, \"chartColor\": string } ], \"topEntities\": [ { \"label\": string, \"count\": number, \"color\": string } ] }."
    });
    let result;
    try {
      result = await withTimeout(model.generateContent(contextString));
    } catch (error) {
      console.warn("WORKBOOK INSIGHTS AI FALLBACK:", error.message);
      return res.json(fallback);
    }
    const responseText = await result.response.text();
    try {
      res.json(JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim()));
    } catch {
      res.json(fallback);
    }
  } catch (error) {
    console.error("WORKBOOK INSIGHTS ERROR:", error);
    res.status(500).json({
      error: "Failed to generate workbook insights"
    });
  }
});
router.post("/deep-analysis", async (req, res) => {
  try {
    const {
      text,
      title,
      url,
      wordCount
    } = req.body;
    if (!text) return res.status(400).json({
      error: "Text content is required"
    });
    const fallback = localAnalysis({
      text,
      title,
      url
    });
    if (!process.env.GEMINI_API_KEY) return res.json(fallback);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: "Analyze webpage content. Return raw JSON only with summary, keyPoints, topics, contentType, complexity, sentiment."
    });
    const prompt = `Webpage Title: "${title || "Unknown"}"\nURL: ${url || "N/A"}\nWord Count: ${wordCount || "Unknown"}\n\n--- CONTENT ---\n${String(text).substring(0, 10000)}`;
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    try {
      res.json(JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim()));
    } catch {
      res.json(fallback);
    }
  } catch (error) {
    console.error("DEEP ANALYSIS ERROR:", error);
    res.json(localAnalysis(req.body || {}));
  }
});
export default router;
