import express from "express";
import { GoogleGenAI } from "@google/genai";

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
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let text = req.body.rawText || "";

    if (req.body.url) {
      const resp = await fetch(req.body.url);
      const html = await resp.text();
      let stripped = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                 .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                 .replace(/<[^>]+>/g, ' ')
                 .replace(/\s+/g, ' ')
                 .trim();
                 
      const fallbackPrompt = `Extract ONLY the primary article content from this scraped website text. Completely ignore and remove all navigational menus, sidebars, ad crumbs, legal footers, and unrelated buttons. Return strictly the clean, logical main content.`;
      const customPrompt = req.body.instruction 
         ? `Extract information from this scraped website exactly adhering to this strict user instruction: "${req.body.instruction}". Ignore everything else.`
         : fallbackPrompt;
      
      try {
          // Send a significantly optimized chunk to avoid strict 429 Quota Exceeded limits
          const cleanReq = await ai.models.generateContent({
             model: "gemini-2.0-flash",
             contents: `${customPrompt}\n\nWebsite Text:\n${stripped.substring(0, 40000)}` 
          });
          text = cleanReq.text;
      } catch (geminiError) {
          console.warn("Gemini Quota Exceeded during filter step. Falling back to native regex scraper mapping to prevent UI crashing.");
          // Unconditionally fallback to the naive regex parsed text so the ingestion never crashes for the user
          text = stripped.substring(0, 50000); 
      }
    }

    if (!text) return res.status(400).json({ error: "No content provided" });

    const chunks = chunkText(text, 250);
    
    // Generate Gemini embeddings for all chunks context
    const embeddingsResp = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: chunks
    });

    const newEntries = embeddingsResp.embeddings.map((emb, index) => ({
      id: Date.now() + index,
      text: chunks[index],
      embedding: emb.values
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
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { question } = req.body;

    if (vectorStore.length === 0) {
      return res.status(400).json({ error: "Vector store is empty. Ingest content first." });
    }

    // Embed the query using Gemini
    const queryEmbResp = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: question
    });
    const queryEmb = queryEmbResp.embeddings[0].values;

    // Calculate similarities & sort
    const scoredChunks = vectorStore.map(chunk => ({
      ...chunk,
      score: cosineSimilarity(queryEmb, chunk.embedding)
    })).sort((a, b) => b.score - a.score);

    // Get top 3 chunks
    const topChunks = scoredChunks.slice(0, 3);
    const context = topChunks.map(c => c.text).join("\n\n---\n\n");

    // Send context to Gemini
    const prompt = `Use the following context to answer the question.\n\nContext:\n${context.substring(0, 30000)}\n\nQuestion:\n${question}`;
    
    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt
        });

        res.json({ 
          answer: response.text,
          topRelevantChunks: topChunks.map(c => c.text) 
        });
    } catch(geminiErr) {
        if (geminiErr.status === 429 || geminiErr.status === 503) {
           res.json({ 
              answer: "⚠️ Google Gemini Free Tier Speed Limit Hit.\n\nThe vector search retrieved relevant context chunks safely (shown below), but generation was temporarily throttled. Wait 60 seconds and try your query again.",
              topRelevantChunks: topChunks.map(c => c.text) 
           });
        } else {
           throw geminiErr;
        }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
});

export default router;
