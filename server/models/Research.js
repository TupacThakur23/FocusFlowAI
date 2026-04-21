import mongoose from "mongoose";

const researchSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  notes: String,
  link: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Research", researchSchema);
