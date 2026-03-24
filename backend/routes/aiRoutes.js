import express from "express";
import {
  handleEmbed,
  handleSearch,
  handleSummarize,
} from "../controllers/aiController.js";

const router = express.Router();

router.get("/summarize", (req, res) => {
  res.send("Route working");
});

router.post("/embed", handleEmbed);
router.post("/search", handleSearch);
router.post("/summarize", handleSummarize);

export default router;