import mongoose from "mongoose";

const researchSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  notes: String,
  link: String,
  workbook: { type: String, default: "Research Workbook" },
  summary: String,
  outputs: {
    summary: String,
    answer: String,
    question: String,
    selectedText: String,
    studyNotes: String,
    relatedSources: [{ id: Number, text: String }],
  },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Research", researchSchema);
