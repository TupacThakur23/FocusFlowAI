import fs from "fs";

const FILE_PATH = "./data/vectorStore.json";

const readDB = () => {
  const data = fs.readFileSync(FILE_PATH);
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
};

export const addToVectorDB = (doc) => {
  const db = readDB();
  db.push(doc);
  writeDB(db);
};

export const getVectorDB = () => {
  return readDB();
};