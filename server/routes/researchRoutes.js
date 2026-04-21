import express from "express";
import Research from "../models/Research.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const entries = await Research.find();
  res.json(entries);
});

router.post("/", async (req, res) => {
  const newResearch = new Research({
    topic: req.body.topic,
    notes: req.body.notes,
    link: req.body.link
  });
  const savedResearch = await newResearch.save();
  res.json(savedResearch);
});

router.delete("/:id", async (req, res) => {
  await Research.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
