import { getEmbedding } from "../services/embeddingService.js";
import { cosineSimilarity } from "../utils/similarity.js";

// 🔹 EMBED TEXT
export const handleEmbed = async (req, res) => {
  const { text } = req.body;

  const embedding = await getEmbedding(text);

  res.json({ embedding });
};

// 🔹 SEARCH SIMILAR TEXTS
export const handleSearch = async (req, res) => {
  const { query, data } = req.body;

  const queryEmbedding = await getEmbedding(query);

  const results = data.map((item) => {
    const score = cosineSimilarity(queryEmbedding, item.embedding);
    return { ...item, score };
  });

  results.sort((a, b) => b.score - a.score);

  res.json({ results });
};