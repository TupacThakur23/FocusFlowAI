import { getEmbedding } from "../services/embeddingService.js";
import { addToVectorDB, getVectorDB } from "../services/vectorStoreService.js";
import { cosineSimilarity } from "../utils/similarity.js";




export const handleEmbed = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    
    const embedding = await getEmbedding(text);

<<<<<<< HEAD
    console.log("Saving to vector DB...");
=======
    console.log("Saving to vector DB...");  
>>>>>>> 46fc0f612b58351d49c49e171f1284ebd8bdca25

    
    addToVectorDB({ text, embedding });

    res.json({ embedding });

  } catch (err) {
    console.log("❌ EMBED ERROR:", err);
    res.status(500).json({ error: "Embedding failed" });
  }
};




export const handleSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    
    const queryEmbedding = await getEmbedding(query);

    const db = getVectorDB();

    
    const results = db.map((item) => {
      const score = cosineSimilarity(queryEmbedding, item.embedding);
      return {
        text: item.text,
        score,
      };
    });

    
    results.sort((a, b) => b.score - a.score);

    res.json({ results });

  } catch (err) {
    console.log("❌ SEARCH ERROR:", err);
    res.status(500).json({ error: "Search failed" });
  }
};