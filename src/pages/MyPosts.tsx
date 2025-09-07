// src/pages/MyPosts.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { getUserPosts, findMatchesForPost } from "../services/embeddingService";
import { Link } from "react-router-dom";

const MyPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const uPosts = await getUserPosts(user.uid);
      setPosts(uPosts);
    })();
  }, [user]);

  const handleFindMatches = async (postId: string) => {
    setLoading(true);
    setSelectedPost(postId);
    const res = await findMatchesForPost(postId);
    setMatches(res);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Posts</h1>
      {posts.length === 0 && <p>No posts yet.</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {posts.map(p => (
          <div key={p.id} className="border p-4 rounded-lg bg-white shadow-sm">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{p.category} • {p.location}</p>
            <p className="text-sm mb-3">{p.description?.slice(0, 180)}{p.description?.length > 180 ? "…" : ""}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleFindMatches(p.id)}
                className="px-3 py-2 bg-blue-600 text-white rounded"
              >
                {loading && selectedPost === p.id ? "Searching…" : "Find a match"}
              </button>
              <Link to={`/item/${p.id}`} className="px-3 py-2 border rounded">View</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Possible matches</h2>
        {selectedPost == null && <p className="text-gray-500">Choose a post and click “Find a match”.</p>}
        {selectedPost && matches.length === 0 && <p className="text-gray-500">No matches found (or embeddings missing).</p>}
        <div className="grid md:grid-cols-3 gap-4">
          {matches.map(m => (
            <div key={m.id} className="border p-3 rounded-lg bg-white">
              <h4 className="font-medium">{m.title}</h4>
              <p className="text-sm text-gray-600">{m.category} • {m.location}</p>
              <p className="text-sm mt-2">{m.description?.slice(0, 120)}{m.description?.length > 120 ? "…" : ""}</p>
              <div className="text-xs text-gray-500 mt-2">Similarity: { (m.similarity || 0).toFixed(3) }</div>
              <div className="mt-3">
                <Link to={`/item/${m.id}`} className="text-blue-600 underline">View item</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPosts;
