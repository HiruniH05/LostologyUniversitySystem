const functions = require("firebase-functions");
const admin = require("firebase-admin");
const OpenAI = require("openai");
require("dotenv").config();

admin.initializeApp();
const db = admin.firestore();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY || functions.config().openai.key,
});

// Generate embedding for text
exports.generateEmbedding = functions.https.onCall(async (data, context) => {
  const { text, itemId } = data;

  if (!text || !itemId) {
    throw new functions.https.HttpsError("invalid-argument", "Text and itemId required");
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    const embedding = response.data[0].embedding;

    // Save embedding to Firestore
    await db.collection("items").doc(itemId).update({
      embedding,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError("internal", "Failed to generate embedding");
  }
});
