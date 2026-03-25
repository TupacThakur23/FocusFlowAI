import express from "express";
import {
  handleEmbed,
  handleSearch,
  
} from "../controllers/aiController.js";

const router = express.Router();

router.get("/summarize", (req, res) => {
  res.send("Route working");
});

router.post("/embed", handleEmbed);
router.post("/search", handleSearch);


export default router;