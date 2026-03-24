import fs from "fs";

const FILE_PATH = "./vectorStore.json";

if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, JSON.stringify([]));
}

const readDB = () => JSON.parse(fs.readFileSync(FILE_PATH));
const writeDB = (data) => fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

export const addToVectorDB = (doc) => {
  const db = readDB();
  db.push(doc);
  writeDB(db);
};

export const getVectorDB = () => readDB();