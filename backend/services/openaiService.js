import OpenAI from "openai";

export const summarizeText = async (text) => {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "user", content: `Summarize this: ${text}` },
    ],
  });

  return response.choices[0].message.content;
};