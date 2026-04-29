import mongoose from "mongoose";

const focusSessionSchema = new mongoose.Schema({
  task: { type: String, required: true },
  startTime: Date,
  endTime: Date,
  status: { type: String, default: "active" }
});

export default mongoose.model("FocusSession", focusSessionSchema);
