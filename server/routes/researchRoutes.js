import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import Research from "../models/Research.js";
import Workbook from "../models/Workbook.js";
import { assignContextCluster } from "../services/ContextIsolation.js";
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const memoryResearch = [];
const memoryWorkbooks = new Map([["Research Workbook", {
  name: "Research Workbook",
  description: "Research workspace.",
  updatedAt: new Date()
}]]);
const isDatabaseReady = () => mongoose.connection.readyState === 1;
const keywordFilter = (items, query) => {
  const q = String(query || "").toLowerCase();
  if (!q) return items;
  return items.filter(item => [item.topic, item.summary, item.notes, item.workbook, ...(item.tags || []), ...(item.saveOptions || [])].filter(Boolean).join(" ").toLowerCase().includes(q));
};
router.get("/", async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const entries = req.query.workbook ? memoryResearch.filter(item => item.workbook === req.query.workbook) : memoryResearch;
      return res.json([...entries].sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
    const filter = req.query.workbook ? {
      workbook: req.query.workbook
    } : {};
    const entries = await Research.find(filter).sort({
      date: -1
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch research"
    });
  }
});
router.post("/", async (req, res) => {
  try {
    if (!req.body.topic) {
      return res.status(400).json({
        error: "Topic is required"
      });
    }
    const outputs = req.body.outputs || {};
    const workbookName = req.body.workbook || "Research Workbook";
    const existingItems = isDatabaseReady() ? await Research.find({
      workbook: workbookName
    }).sort({
      date: -1
    }).limit(25) : memoryResearch.filter(item => item.workbook === workbookName).slice(0, 25);
    const assignedContext = req.body.contextId ? {
      contextId: req.body.contextId,
      contextFingerprint: req.body.contextFingerprint || req.body.contextId,
      contextTerms: req.body.contextTerms || [],
      contextSimilarity: 1
    } : assignContextCluster({
      ...req.body,
      outputs
    }, existingItems);
    if (!isDatabaseReady()) {
      memoryWorkbooks.set(workbookName, {
        name: workbookName,
        description: "Research workspace.",
        updatedAt: new Date()
      });
      const savedResearch = {
        _id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        topic: req.body.topic,
        notes: req.body.notes || "",
        link: req.body.link || "",
        workbook: workbookName,
        summary: req.body.summary || "",
        ...assignedContext,
        tags: Array.isArray(req.body.tags) ? req.body.tags : outputs.tags || [],
        saveOptions: Array.isArray(req.body.saveOptions) ? req.body.saveOptions : outputs.saveOptions || [],
        outputs,
        date: new Date()
      };
      memoryResearch.unshift(savedResearch);
      return res.json(savedResearch);
    }
    await Workbook.findOneAndUpdate({
      name: workbookName
    }, {
      name: workbookName,
      description: "Research workspace.",
      updatedAt: new Date()
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
    const newResearch = new Research({
      topic: req.body.topic,
      notes: req.body.notes || "",
      link: req.body.link || "",
      workbook: workbookName,
      summary: req.body.summary || "",
      ...assignedContext,
      tags: Array.isArray(req.body.tags) ? req.body.tags : outputs.tags || [],
      saveOptions: Array.isArray(req.body.saveOptions) ? req.body.saveOptions : outputs.saveOptions || [],
      outputs
    });
    const savedResearch = await newResearch.save();
    res.json(savedResearch);
  } catch (error) {
    console.error("SAVE RESEARCH ERROR:", error);
    res.status(500).json({
      error: "Failed to save research"
    });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const index = memoryResearch.findIndex(item => String(item._id) === String(req.params.id));
      if (index >= 0) memoryResearch.splice(index, 1);
      return res.json({
        success: true
      });
    }
    await Research.findByIdAndDelete(req.params.id);
    res.json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete research"
    });
  }
});
router.get("/workbooks", async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      const names = [...memoryWorkbooks.values()].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map(workbook => workbook.name);
      return res.json([...new Set([...names, ...memoryResearch.map(item => item.workbook), "Research Workbook"].filter(Boolean))]);
    }
    const savedWorkbooks = await Workbook.find({}).sort({
      updatedAt: -1
    });
    const researchWorkbooks = await Research.distinct("workbook");
    const names = [...new Set([...savedWorkbooks.map(workbook => workbook.name), ...researchWorkbooks, "Research Workbook"].filter(Boolean))];
    res.json(names);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch workbooks"
    });
  }
});
router.post("/workbooks", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({
      error: "Workbook name is required"
    });
    if (!isDatabaseReady()) {
      const workbook = {
        _id: `local_workbook_${Date.now()}`,
        name,
        description: req.body.description || "Research workspace.",
        updatedAt: new Date()
      };
      memoryWorkbooks.set(name, workbook);
      return res.json(workbook);
    }
    const workbook = await Workbook.findOneAndUpdate({
      name
    }, {
      name,
      description: req.body.description || "Research workspace.",
      updatedAt: new Date()
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
    res.json(workbook);
  } catch (error) {
    console.error("CREATE WORKBOOK ERROR:", error);
    res.status(500).json({
      error: "Failed to create workbook"
    });
  }
});
router.post("/semantic-search", async (req, res) => {
  try {
    const {
      query
    } = req.body;
    if (!query) return res.json([]);
    if (!isDatabaseReady()) {
      return res.json(keywordFilter(memoryResearch, query));
    }
    const allResearch = await Research.find({}).sort({
      date: -1
    });
    const localResults = keywordFilter(allResearch, query);
    if (!process.env.GEMINI_API_KEY || allResearch.length === 0) {
      return res.json(localResults);
    }
    let contextString = "Documents:\n";
    allResearch.forEach(item => {
      contextString += `ID: ${item._id}\nTopic: ${item.topic}\nSummary: ${item.summary}\nNotes: ${item.notes}\nTags: ${(item.tags || []).join(", ")}\n\n`;
    });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are a semantic search engine. Given documents and a query, return JSON only: { \"relevantIds\": [\"id1\"] }."
    });
    const result = await model.generateContent(`${contextString}\n\nQuery: ${query}`);
    const responseText = await result.response.text();
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim());
    } catch {
      parsedResponse = {
        relevantIds: []
      };
    }
    const semanticResults = allResearch.filter(item => parsedResponse.relevantIds?.includes(item._id.toString()));
    res.json(semanticResults.length > 0 ? semanticResults : localResults);
  } catch (error) {
    console.error("SEMANTIC SEARCH ERROR:", error);
    res.status(500).json({
      error: "Search failed"
    });
  }
});
export default router;
