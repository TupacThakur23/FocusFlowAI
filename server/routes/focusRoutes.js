import express from "express";
import OpenAI from "openai";

const router = express.Router();

// Memory vector store: { id, text, embedding }
let vectorStore = [];

const chunkText = (text, wordLimit = 200) => {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += wordLimit) {
    chunks.push(words.slice(i, i + wordLimit).join(" "));
  }
  return chunks;
};

const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

router.post("/ingest", async (req, res) => {
  try {
    const openai = new OpenAI();
    let text = req.body.rawText || "";

    if (req.body.url) {
      const resp = await fetch(req.body.url);
      const html = await resp.text();
      // Extremely basic HTML stripping matching user constraint for no complex tools
      text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                 .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                 .replace(/<[^>]+>/g, ' ')
                 .replace(/\s+/g, ' ')
                 .trim();
    }

    if (!text) return res.status(400).json({ error: "No content provided" });

    const chunks = chunkText(text, 250);
    
    // Generate embeddings for all chunks context
    const embeddingsResp = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunks
    });

    const newEntries = embeddingsResp.data.map((emb, index) => ({
      id: Date.now() + index,
      text: chunks[index],
      embedding: emb.embedding
    }));

    // Clear and replace old store
    vectorStore = newEntries;

    res.json({ message: `Successfully stored ${chunks.length} chunks.`, text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ingestion failed" });
  }
});

router.post("/query", async (req, res) => {
  try {
    const openai = new OpenAI();
    const { question } = req.body;

    if (vectorStore.length === 0) {
      return res.status(400).json({ error: "Vector store is empty. Ingest content first." });
    }

    // Embed the query
    const queryEmbResp = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question
    });
    const queryEmb = queryEmbResp.data[0].embedding;

    // Calculate similarities & sort
    const scoredChunks = vectorStore.map(chunk => ({
      ...chunk,
      score: cosineSimilarity(queryEmb, chunk.embedding)
    })).sort((a, b) => b.score - a.score);

    // Get top 3 chunks
    const topChunks = scoredChunks.slice(0, 3);
    const context = topChunks.map(c => c.text).join("\n\n---\n\n");

    // Send to OpenAI
    const prompt = `Use the following context to answer the question.\n\nContext:\n${context}\n\nQuestion:\n${question}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ 
      answer: response.choices[0].message.content,
      topRelevantChunks: topChunks.map(c => c.text) 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
});

export default router;
