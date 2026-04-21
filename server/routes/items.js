import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

router.post("/", async (req, res) => {
  const newItem = new Item({ name: req.body.name });
  const savedItem = await newItem.save();
  res.json(savedItem);
});

export default router;
