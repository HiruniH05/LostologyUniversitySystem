"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.backfillEmbeddings = exports.onPostCreated = void 0;
// functions/src/index.ts
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const openaiService_1 = require("./openaiService");
admin.initializeApp();
const db = admin.firestore();
// 1) Trigger on new post create
exports.onPostCreated = functions.firestore
    .document("posts/{postId}")
    .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data)
        return null;
    const description = data.description || data.title || "";
    if (!description) {
        console.log("No description/title to embed for post", context.params.postId);
        return null;
    }
    try {
        const embedding = await (0, openaiService_1.generateEmbedding)(description);
        await db.collection("posts").doc(context.params.postId).update({ embedding });
        console.log("Saved embedding for post", context.params.postId);
    }
    catch (err) {
        console.error("Embedding generation failed for", context.params.postId, err);
    }
    return null;
});
// 2) Callable function to backfill missing embeddings
exports.backfillEmbeddings = functions.https.onCall(async (data, context) => {
    const postsSnapshot = await db.collection("posts").get();
    const missing = [];
    for (const doc of postsSnapshot.docs) {
        const postData = doc.data();
        if (!postData.embedding) {
            const text = postData.description || postData.title || "";
            if (!text)
                continue;
            const embedding = await (0, openaiService_1.generateEmbedding)(text);
            await db.collection("posts").doc(doc.id).update({ embedding });
            console.log("Backfilled", doc.id);
            missing.push(doc.id);
        }
    }
    return { updated: missing.length };
});
