import express from "express";
import {
  handleSummarize,
  handleEmbed,
  handleSearch,
} from "../controllers/aiController.js";

const router = express.Router();

// test route
router.get("/summarize", (req, res) => {
  res.send("Summarize route working");
});

// real routes
router.post("/summarize", handleSummarize);
router.post("/embed", handleEmbed);
router.post("/search", handleSearch);

export default router;