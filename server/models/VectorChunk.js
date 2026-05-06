import mongoose from "mongoose";

const vectorChunkSchema = new mongoose.Schema({
  // The source URL or identifier this chunk belongs to
  sourceUrl: { type: String, required: true, index: true },
  // The original text of this chunk
  text: { type: String, required: true },
  // The Gemini embedding vector (3072 dimensions for gemini-embedding-001)
  embedding: { type: [Number], required: true },
  // Chunk position in the original document
  chunkIndex: { type: Number, default: 0 },
  // When this chunk was created
  createdAt: { type: Date, default: Date.now },
});

// Compound index for fast lookups by source
vectorChunkSchema.index({ sourceUrl: 1, chunkIndex: 1 });

export default mongoose.model("VectorChunk", vectorChunkSchema);
