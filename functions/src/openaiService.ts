// functions/src/openaiService.ts
import OpenAI from "openai";
import * as functions from "firebase-functions";

const apiKey = functions.config().openai?.key;
if (!apiKey) throw new Error("OpenAI key not set in functions config.");

export const openai = new OpenAI({ apiKey });

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
};
