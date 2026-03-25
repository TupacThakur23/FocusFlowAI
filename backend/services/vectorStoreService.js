import fs from "fs";
import path from "path";


const FILE_PATH = path.resolve("data/vectorStore.json");


export const getVectorDB = () => {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([]));
  }

  const data = fs.readFileSync(FILE_PATH, "utf-8");
  return JSON.parse(data);
};


export const addToVectorDB = (entry) => {
  const db = getVectorDB();

  db.push(entry);

  fs.writeFileSync(FILE_PATH, JSON.stringify(db, null, 2));

  console.log("Data saved to vector DB");
};