import mongoose from "mongoose";

const workbookSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: "Research workspace." },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

workbookSchema.pre("save", function updateTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Workbook", workbookSchema);
