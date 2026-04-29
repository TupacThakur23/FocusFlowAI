import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

export default mongoose.model("Item", fileSchema);
