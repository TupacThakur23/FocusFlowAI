import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import itemsRouter from "./routes/items.js";
import dataRoutes from "./routes/dataRoutes.js";
import focusRoutes from "./routes/focusRoutes.js";
import researchRoutes from "./routes/researchRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/items", itemsRouter);
app.use("/api/data", dataRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));