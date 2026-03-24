import { getEmbedding } from "../services/embeddingService.js";
import { cosineSimilarity } from "../utils/similarity.js";
import { addToVectorDB, getVectorDB } from "../services/vectorStoreService.js";

// EMBED + STORE
export const handleEmbed = async (req, res) => {
  try {
    const { text } = req.body;

    const embedding = await getEmbedding(text);

    console.log("Saving to vector DB...");  // ✅ here

    addToVectorDB({ text, embedding });

    res.json({ embedding });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Embedding failed" });
  }
};

// SEARCH
export const handleSearch = async (req, res) => {
  try {
    const { query } = req.body;

    const queryEmbedding = await getEmbedding(query);

    const data = getVectorDB();

    const results = data.map((item) => {
      const score = cosineSimilarity(queryEmbedding, item.embedding);
      return { ...item, score };
    });

    results.sort((a, b) => b.score - a.score);

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
};

// SIMPLE TEST
export const handleSummarize = async (req, res) => {
  res.json({ summary: "Test summary working" });
};