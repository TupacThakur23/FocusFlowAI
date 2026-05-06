import express from "express";
import Research from "../models/Research.js";

const router = express.Router();

// Get all, optionally filtered by workbook
router.get("/", async (req, res) => {
  try {
    const filter = req.query.workbook ? { workbook: req.query.workbook } : {};
    const entries = await Research.find(filter).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch research" });
  }
});

// Save research entry
router.post("/", async (req, res) => {
  try {
    if (!req.body.topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const newResearch = new Research({
      topic: req.body.topic,
      notes: req.body.notes || "",
      link: req.body.link || "",
      workbook: req.body.workbook || "Research Workbook",
      summary: req.body.summary || "",
      outputs: req.body.outputs || {},
    });

    const savedResearch = await newResearch.save();
    res.json(savedResearch);
  } catch (error) {
    res.status(500).json({ error: "Failed to save research" });
  }
});

// Delete research entry
router.delete("/:id", async (req, res) => {
  try {
    await Research.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete research" });
  }
});

// Get distinct workbook names
router.get("/workbooks", async (req, res) => {
  try {
    const workbooks = await Research.distinct("workbook");
    res.json(workbooks.length ? workbooks : ["Research Workbook"]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workbooks" });
  }
});

export default router;