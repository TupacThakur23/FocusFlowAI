import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import VectorChunk from "../models/VectorChunk.js";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chunkText = (text, wordLimit = 200) => {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += wordLimit) {
    chunks.push(words.slice(i, i + wordLimit).join(" "));
  }
  return chunks;
};
const cosineSimilarity = (vecA, vecB) => {
  let dot = 0,
    a = 0,
    b = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    a += vecA[i] * vecA[i];
    b += vecB[i] * vecB[i];
  }
  if (!a || !b) return 0;
  return dot / (Math.sqrt(a) * Math.sqrt(b));
};
const getEmbedding = async text => {
  const model = genAI.getGenerativeModel({
    model: "gemini-embedding-001"
  });
  const result = await model.embedContent(text);
  return result.embedding.values;
};
router.post("/ingest", async (req, res) => {
  try {
    let text = req.body.rawText || "";
    const sourceUrl = req.body.url || "manual-input";
    if (req.body.url) {
      const resp = await fetch(req.body.url);
      const html = await resp.text();
      const stripped = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite"
      });
      const result = await model.generateContent(`Extract main content only:\n\n${stripped.substring(0, 40000)}`);
      const response = await result.response;
      text = response.text();
    }
    if (!text) {
      return res.status(400).json({
        error: "No content provided"
      });
    }
    const chunks = chunkText(text, 250);
    await VectorChunk.deleteMany({
      sourceUrl
    });
    const chunkDocs = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await getEmbedding(chunks[i]);
        chunkDocs.push({
          sourceUrl,
          text: chunks[i],
          embedding,
          chunkIndex: i
        });
      } catch (embErr) {
        console.error(`Embedding failed for chunk ${i}:`, embErr.message);
        chunkDocs.push({
          sourceUrl,
          text: chunks[i],
          embedding: [],
          chunkIndex: i
        });
      }
    }
    if (chunkDocs.length > 0) {
      await VectorChunk.insertMany(chunkDocs);
    }
    console.log(`Ingested ${chunkDocs.length} chunks for ${sourceUrl} (${chunkDocs.filter(c => c.embedding.length > 0).length} with embeddings)`);
    res.json({
      message: "Content ingested successfully",
      text
    });
  } catch (err) {
    console.error("INGEST ERROR:", err);
    res.status(500).json({
      error: "Ingestion failed"
    });
  }
});
router.post("/query", async (req, res) => {
  try {
    const {
      question,
      sourceUrl
    } = req.body;
    if (!question) {
      return res.status(400).json({
        error: "Question required"
      });
    }
    let chunks;
    if (sourceUrl) {
      chunks = await VectorChunk.find({
        sourceUrl
      });
    } else {
      const latest = await VectorChunk.findOne().sort({
        createdAt: -1
      });
      if (!latest) {
        return res.status(400).json({
          error: "Ingest content first"
        });
      }
      chunks = await VectorChunk.find({
        sourceUrl: latest.sourceUrl
      });
    }
    if (chunks.length === 0) {
      return res.status(400).json({
        error: "Ingest content first"
      });
    }
    let topChunks;
    const hasEmbeddings = chunks.some(c => c.embedding && c.embedding.length > 0);
    if (hasEmbeddings) {
      const questionEmbedding = await getEmbedding(question);
      const scored = chunks.filter(c => c.embedding && c.embedding.length > 0).map(chunk => ({
        text: chunk.text,
        score: cosineSimilarity(questionEmbedding, chunk.embedding)
      }));
      topChunks = scored.sort((a, b) => b.score - a.score).slice(0, 3);
    } else {
      const words = question.toLowerCase().split(/\s+/);
      const scored = chunks.map(chunk => {
        const text = chunk.text.toLowerCase();
        const score = words.filter(word => text.includes(word)).length;
        return {
          text: chunk.text,
          score
        };
      });
      topChunks = scored.sort((a, b) => b.score - a.score).slice(0, 3);
    }
    const context = topChunks.map(c => c.text).join("\n\n");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });
    const result = await model.generateContent(`
Use the context below to answer clearly.

Context:
${context}

Question:
${question}
    `);
    const response = await result.response;
    res.json({
      answer: response.text(),
      topRelevantChunks: topChunks.map(c => c.text)
    });
  } catch (err) {
    console.error("QUERY ERROR:", err);
    res.status(500).json({
      error: "Query failed"
    });
  }
});
router.get("/stats", async (req, res) => {
  try {
    const totalChunks = await VectorChunk.countDocuments();
    const sources = await VectorChunk.distinct("sourceUrl");
    const withEmbeddings = await VectorChunk.countDocuments({
      "embedding.0": {
        $exists: true
      }
    });
    res.json({
      totalChunks,
      totalSources: sources.length,
      chunksWithEmbeddings: withEmbeddings,
      sources
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to get stats"
    });
  }
});
export default router;
