import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";
import { Search } from "lucide-react";

interface Claim {
  id: string;
  postId: string;
  itemId: string;
  userId: string;
  message: string;
  status: string;
  post?: Post; 
}

interface Post {
  id: string;
  title?: string;
  description?: string;
  [key: string]: any; 
}

export default function ManageClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchClaims = async () => {
      try {
        // Get posts owned by this user
        const postsSnap = await getDocs(query(collection(db, "posts"), where("userId", "==", user.uid)));
        const posts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Post));

        if (posts.length === 0) return;

        const allClaims: Claim[] = [];

        for (const post of posts) {
          // Get claims for this post
          const claimsSnap = await getDocs(collection(db, "posts", post.id, "claims"));
          const claimsData = claimsSnap.docs.map(doc => ({
            id: doc.id,
            postId: post.id,
            ...doc.data(),
            post: post // attach post details
          } as Claim));
          allClaims.push(...claimsData);
        }

        setClaims(allClaims);
      } catch (error) {
        console.error("Error fetching claims:", error);
      }
    };

    fetchClaims();
  }, [user]);

//update status of the claims
const handleUpdate = async (claim: Claim, newStatus: string) => {
  try {
    // ✅ Update claim
    await updateDoc(doc(db, "posts", claim.postId, "claims", claim.id), { status: newStatus });

    // ✅ Notify the claimer
    if (claim.userId !== user?.uid) {
      await addDoc(collection(db, "notifications"), {
        userId: claim.userId, // claimer
        title: `Your claim was ${newStatus}`,
        message: `The owner has ${newStatus} your claim for "${claim.post?.title}".`,
        link: `/my-claims`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    setClaims(prev =>
      prev.map(c => c.id === claim.id ? { ...c, status: newStatus } : c)
    );
  } catch (error) {
    console.error("Error updating claim:", error);
  }
};


  // Filter claims based on status and search query
const filteredClaims = claims
  .filter(claim => {
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    const matchesSearch = claim.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (claim.post?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesStatus && matchesSearch;
  })
  .sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1; // a first
    if (a.status !== "pending" && b.status === "pending") return 1;  // b first
    return 0; // keep order for same status
  });



  return (
    <>

   <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-cornflower-blue mb-6">Manage Claims</h1>

    <div className="grid lg:grid-cols-4 gap-6">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search messages or posts..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "approved" | "pending" | "rejected")
          }
          className="appearance-none w-full px-4 py-2 pr-10 border border-gray-300 rounded-xl bg-white shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    transition-all duration-200 ease-in-out"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Custom dropdown arrow */}
        <svg
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none transition-transform duration-200"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="lg:col-span-3 space-y-4">
        {filteredClaims.map((claim) => (

          <div key={claim.id} className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex gap-3 mb-4">
                <p className="font-medium">Message:</p> 
                <p>{claim.message}</p>
            </div>

            <div className="flex gap-3 items-center">
            <p className="font-medium">Status:</p>
            <span
                className={`font-semibold px-3 py-1 rounded-full ${
                claim.status === "approved"
                ? "bg-green-100 text-green-800"
                : claim.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : claim.status === "rejected"
                ? "bg-red-100 text-red-800"
                : ""
            }`}>
              {claim.status}</span>
            </div>

            {claim.post && (
              <div className="mt-2 p-2 bg-gray-100 rounded-lg mt-3">
                <p className="font-semibold text-gray-500">Post:</p>
                {claim.post.title && <p className="text-gray-500">Title: {claim.post.title}</p>}
                {claim.post.description && <p className="text-gray-500">Description: {claim.post.description}</p>}
              </div>
            )}

            {claim.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleUpdate(claim, "approved")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleUpdate(claim, "rejected")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {filteredClaims.length === 0 && <p>No claims match your filter.</p>}
      </div>

    </div>
    </div>
</>
  );
}
