// src/services/embeddingService.ts
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

// cosine similarity
export const cosineSimilarity = (a: number[], b: number[]) => {
  const dot = a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
  const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (na === 0 || nb === 0) return 0;
  return dot / (na * nb);
};

export const getUserPosts = async (userId: string) => {
  const q = query(collection(db, "posts"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
};

export const findMatchesForPost = async (postId: string) => {
  // get the post itself
  const snapAll = await getDocs(collection(db, "posts"));
  const all = snapAll.docs.map(d => ({ id: d.id, ...d.data() }) as any);

  const post = all.find(p => p.id === postId);
  if (!post || !post.embedding) return [];

  // filter others with embeddings
  const others = all.filter(p => p.id !== postId && p.embedding && Array.isArray(p.embedding));
  const scored = others.map((p) => ({
    ...p,
    similarity: cosineSimilarity(post.embedding, p.embedding),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, 5);
};
