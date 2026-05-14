import mongoose from "mongoose";

const researchSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  notes: String,
  link: String,
  workbook: { type: String, default: "Research Workbook", index: true },
  summary: String,
  tags: [{ type: String }],
  saveOptions: [{ type: String }],
  outputs: {
    summary: String,
    answer: String,
    question: String,
    selectedText: String,
    studyNotes: String,
    saveType: String,
    saveOptions: [{ type: String }],
    tags: [{ type: String }],
    relatedSources: [{ id: Number, text: String, url: String, title: String }],
    flashcards: [{ q: String, a: String }],
    viva: [{ q: String, a: String }],
  },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Research", researchSchema);
