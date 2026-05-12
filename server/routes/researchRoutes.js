import express from "express";
import Research from "../models/Research.js";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const filter = req.query.workbook ? { workbook: req.query.workbook } : {};
    const entries = await Research.find(filter).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch research" });
  }
});


router.post("/", async (req, res) => {
  try {
    if (!req.body.topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const newResearch = new Research({
      topic: req.body.topic,
      notes: req.body.notes || "",
      link: req.body.link || "",
      workbook: req.body.workbook || "Research Workbook",
      summary: req.body.summary || "",
      outputs: req.body.outputs || {},
    });

    const savedResearch = await newResearch.save();
    res.json(savedResearch);
  } catch (error) {
    res.status(500).json({ error: "Failed to save research" });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    await Research.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete research" });
  }
});


router.get("/workbooks", async (req, res) => {
  try {
    const workbooks = await Research.distinct("workbook");
    res.json(workbooks.length ? workbooks : ["Research Workbook"]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workbooks" });
  }
});

import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


router.post("/semantic-search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.json([]);

    const allResearch = await Research.find({}).sort({ date: -1 });
    



    let contextString = "Documents:\n";
    allResearch.forEach(item => {
      contextString += `ID: ${item._id}\nTopic: ${item.topic}\nSummary: ${item.summary}\nNotes: ${item.notes}\n\n`;
    });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are a semantic search engine. Given a list of documents and a user query, identify the documents that are semantically relevant to the query (even if they don't share exact keywords). Return a JSON array containing ONLY the string IDs of the relevant documents. Format: { \"relevantIds\": [\"id1\", \"id2\"] }"
    });

    const prompt = `${contextString}\n\nQuery: ${query}`;
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    
    let parsedResponse;
    try {
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(jsonStr);
    } catch (e) {
      parsedResponse = { relevantIds: [] };
    }

    const filteredResearch = allResearch.filter(item => parsedResponse.relevantIds.includes(item._id.toString()));
    
    res.json(filteredResearch.length > 0 ? filteredResearch : allResearch.filter(item => item.topic.toLowerCase().includes(query.toLowerCase()))); // Fallback to keyword if LLM fails
  } catch (error) {
    console.error("SEMANTIC SEARCH ERROR:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;