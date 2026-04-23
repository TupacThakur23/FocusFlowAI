import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let vectorStore = [];

// ------------------ UTIL FUNCTIONS ------------------

const chunkText = (text, wordLimit = 200) => {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += wordLimit) {
    chunks.push(words.slice(i, i + wordLimit).join(" "));
  }
  return chunks;
};

const cosineSimilarity = (vecA, vecB) => {
  let dot = 0, a = 0, b = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    a += vecA[i] * vecA[i];
    b += vecB[i] * vecB[i];
  }
  if (!a || !b) return 0;
  return dot / (Math.sqrt(a) * Math.sqrt(b));
};

// ------------------ INGEST ------------------

router.post("/ingest", async (req, res) => {
  try {
    let text = req.body.rawText || "";

    if (req.body.url) {
      const resp = await fetch(req.body.url);
      const html = await resp.text();

      const stripped = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const result = await model.generateContent(
        `Extract main content only:\n\n${stripped.substring(0, 40000)}`
      );

      const response = await result.response;
      text = response.text();
    }

    if (!text) {
      return res.status(400).json({ error: "No content provided" });
    }

    const chunks = chunkText(text, 250);

    const embeddingModel = genAI.getGenerativeModel({
      model: "embedding-001",
    });

    const embeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const result = await embeddingModel.embedContent(chunk);
        return result.embedding.values;
      })
    );

    vectorStore = chunks.map((chunk, i) => ({
      id: Date.now() + i,
      text: chunk,
      embedding: embeddings[i],
    }));

    res.json({ message: "Content ingested successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ingestion failed" });
  }
});

// ------------------ QUERY ------------------

router.post("/query", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question required" });
    }

    if (vectorStore.length === 0) {
      return res.status(400).json({ error: "Ingest content first" });
    }

    const embeddingModel = genAI.getGenerativeModel({
      model: "embedding-001",
    });

    const queryEmbeddingResp = await embeddingModel.embedContent(question);
    const queryEmbedding = queryEmbeddingResp.embedding.values;

    const scored = vectorStore.map((c) => ({
      ...c,
      score: cosineSimilarity(queryEmbedding, c.embedding),
    }));

    const topChunks = scored.sort((a, b) => b.score - a.score).slice(0, 3);

    const context = topChunks.map(c => c.text).join("\n\n");

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(
      `Answer using context:\n\n${context}\n\nQuestion: ${question}`
    );

    const response = await result.response;

    res.json({
      answer: response.text(),
      topRelevantChunks: topChunks.map(c => c.text),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
});

export default router;