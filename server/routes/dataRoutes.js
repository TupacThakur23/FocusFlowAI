import express from "express";
import Data from "../models/Data.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await Data.find();
  res.json(data);
});

router.post("/", async (req, res) => {
  const newData = new Data({ name: req.body.name });
  const savedData = await newData.save();
  res.json(savedData);
});

export default router;