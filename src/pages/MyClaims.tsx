import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";

interface Claim {
  id: string;
  postId: string;
  postTitle: string;
  message: string;
  status: string;
}

export default function MyClaims() {
  const { user } = useAuth();
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  // Status filter
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");

  useEffect(() => {
    if (!user) return;

    //fetch claims
    const fetchMyClaims = async () => {
      try {
        const postsSnapshot = await getDocs(collection(db, "posts"));
        let allClaims: Claim[] = [];

        for (let postDoc of postsSnapshot.docs) {
          const claimsRef = collection(db, "posts", postDoc.id, "claims");
          const claimsSnapshot = await getDocs(claimsRef);

          claimsSnapshot.forEach((claimDoc) => {
            const claimData = claimDoc.data();
            if (claimData.userId === user.uid) {
              allClaims.push({
                id: claimDoc.id,
                postId: postDoc.id,
                postTitle: postDoc.data().title,
                message: claimData.message,
                status: claimData.status,
              });
            }
          });
        }

        setMyClaims(allClaims);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching claims:", error);
        setLoading(false);
      }
    };

    fetchMyClaims();
  }, [user]);



  // Apply status filter + keep pending on top
  const filteredClaims = myClaims
    .filter((c) => statusFilter === "all" || c.status === statusFilter)
    .sort((a, b) => {
      const order = { pending: 1, approved: 2, rejected: 3 };
      return order[a.status as keyof typeof order] - order[b.status as keyof typeof order];
    });


  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header with filter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-cornflower-blue">My Claims</h2>

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

      {filteredClaims.length === 0 ? (
        <p className="text-gray-600">No claims match your filter.</p>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((c) => (
            <div
              key={c.id}
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                {c.postTitle}
              </h3>
              <p className="text-gray-700 mt-1">{c.message}</p>

              <p className="text-sm text-gray-500 mt-5">
                Status:{" "}
                <span
                  className={`font-semibold px-2 py-1 rounded-full ${
                    c.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : c.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : c.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : ""
                  }`}
                >
                  {c.status}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
