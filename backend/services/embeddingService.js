import { pipeline } from "@xenova/transformers";

const model = "Xenova/all-MiniLM-L6-v2";

let pipe;

export const getEmbedding = async (text) => {
  if (!pipe) {
    pipe = await pipeline("feature-extraction", model);
  }

  const output = await pipe(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
};