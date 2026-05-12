import mongoose from "mongoose";

const vectorChunkSchema = new mongoose.Schema({

  sourceUrl: { type: String, required: true, index: true },

  text: { type: String, required: true },

  embedding: { type: [Number], required: true },

  chunkIndex: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});


vectorChunkSchema.index({ sourceUrl: 1, chunkIndex: 1 });

export default mongoose.model("VectorChunk", vectorChunkSchema);
