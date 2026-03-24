import express from "express";
import { handleSummarize } from "../controllers/aiController.js";

const router = express.Router();

// ✅ TEMP GET ROUTE (for browser testing)
router.get("/summarize", (req, res) => {
  res.send("Summarize route working");
});

// ✅ ACTUAL POST ROUTE (real API)
router.post("/summarize", handleSummarize);

export default router;