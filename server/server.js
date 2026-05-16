import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import focusRoutes from "./routes/focusRoutes.js";
import researchRoutes from "./routes/researchRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2, process.env.EXTENSION_URL].filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({
  limit: "5mb"
}));
app.use("/api/focus", focusRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/ai", aiRoutes);
app.get("/", (req, res) => {
  res.send("FocusFlow AI API Running");
});
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({
    error: err.message || "Internal server error"
  });
});
let serverStarted = false;
const startServer = () => {
  if (serverStarted) return;
  serverStarted = true;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log("MongoDB connected");
  startServer();
}).catch(err => {
  console.log("MongoDB connection failed:", err.message);
  console.log("Starting API with in-memory research storage for this session.");
  startServer();
});
