import express from "express";
import dotenv from "dotenv";
import aiRoutes from "./routes/aiRoutes.js"; 

dotenv.config({ path: "./.env" });
console.log("ENV TEST:", process.env.OPENAI_API_KEY);

const app = express();

app.use(express.json());

// connect routes
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

