import Data from "../models/Data.js";

export const getData = async (req, res) => {
  const data = await Data.find();
  res.json(data);
};

export const createData = async (req, res) => {
  const newData = new Data(req.body);
  const saved = await newData.save();
  res.json(saved);
};