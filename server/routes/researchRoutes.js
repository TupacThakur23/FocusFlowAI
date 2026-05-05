import express from "express";
import Research from "../models/Research.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const entries = await Research.find().sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch research" });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.body.topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const newResearch = new Research({
      topic: req.body.topic,
      notes: req.body.notes || "",
      link: req.body.link || ""
    });

    const savedResearch = await newResearch.save();
    res.json(savedResearch);
  } catch (error) {
    res.status(500).json({ error: "Failed to save research" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Research.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete research" });
  }
});

export default router;