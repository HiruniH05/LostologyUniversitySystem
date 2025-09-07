// functions/src/index.ts
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { generateEmbedding } from "./openaiService";

admin.initializeApp();
const db = admin.firestore();

// 1) Trigger on new post create
export const onPostCreated = functions.firestore
  .document("posts/{postId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data) return null;
    const description: string = data.description || data.title || "";

    if (!description) {
      console.log("No description/title to embed for post", context.params.postId);
      return null;
    }

    try {
      const embedding = await generateEmbedding(description);
      await db.collection("posts").doc(context.params.postId).update({ embedding });
      console.log("Saved embedding for post", context.params.postId);
    } catch (err) {
      console.error("Embedding generation failed for", context.params.postId, err);
    }
    return null;
  });

// 2) Callable function to backfill missing embeddings
export const backfillEmbeddings = functions.https.onCall(async (data, context) => {
  const postsSnapshot = await db.collection("posts").get();
  const missing: string[] = [];

  for (const doc of postsSnapshot.docs) {
    const postData = doc.data();
    if (!postData.embedding) {
      const text = postData.description || postData.title || "";
      if (!text) continue;

      const embedding = await generateEmbedding(text);
      await db.collection("posts").doc(doc.id).update({ embedding });
      console.log("Backfilled", doc.id);
      missing.push(doc.id);
    }
  }

  return { updated: missing.length };
});