// DashboardPage.tsx
import { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2, Clock, MapPin, User, Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, getDocs, doc, getCountFromServer, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface Post {
  id: string;
  title: string;
  type: "lost" | "found";
  status: string;
  location: string;
  views?: number;
  createdAt?: Timestamp;
  images?: string[];
  claimsCount: number;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalClaims, setTotalClaims] = useState(0);
  const [activeTab, setActiveTab] = useState("my-posts");
  const [chartData, setChartData] = useState<any[]>([]);

  // Fetch posts with claims count
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const postsSnapshot = await getDocs(postsQuery);
        const postsData: Post[] = [];

        let totalClaimsCounter = 0;

        for (const postDoc of postsSnapshot.docs) {
          const claimsColRef = collection(db, `posts/${postDoc.id}/claims`);
          const claimsCountSnap = await getCountFromServer(claimsColRef);

          totalClaimsCounter += claimsCountSnap.data().count;

          postsData.push({
            id: postDoc.id,
            claimsCount: claimsCountSnap.data().count,
            ...(postDoc.data() as Omit<Post, "id" | "claimsCount">),
          });
        }

        setPosts(postsData);
        setTotalClaims(totalClaimsCounter);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Fetch total users
  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        setTotalUsers(usersSnap.size);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsersCount();
  }, []);

  // Prepare chart data: posts per type over time
  useEffect(() => {
    const countsByDate: Record<string, { lost: number; found: number }> = {};

    posts.forEach((post) => {
      const date = post.createdAt?.toDate().toLocaleDateString() || "Unknown";
      if (!countsByDate[date]) countsByDate[date] = { lost: 0, found: 0 };
      countsByDate[date][post.type] += 1;
    });

    const chartArray = Object.entries(countsByDate).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    setChartData(chartArray);
  }, [posts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "claimed":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Overview of posts, users, and claims</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{posts.length}</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{totalClaims}</div>
              <div className="text-sm text-gray-600">Total Claims</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-engineRed mb-1">{totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange mb-1">
                {posts.filter((p) => p.type === "lost").length}
              </div>
              <div className="text-sm text-gray-600">Lost Items</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Posts Overview</h2>
          {chartData.length === 0 ? (
            <p className="text-gray-500">No data to display</p>
          ) : (
             <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="lost" stroke="#ef5f18" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="found" stroke="#4f46e5" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8 py-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("my-posts")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "my-posts"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Posts
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {posts.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("claims")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "claims"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Claims
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {totalClaims}
                </span>
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === "my-posts" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={post.images?.[0] || "https://via.placeholder.com/100"}
                        alt={post.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.title}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              post.type === "lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                            }`}
                          >
                            {post.type === "lost" ? "Lost" : "Found"}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{post.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{post.createdAt?.toDate().toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              <span>{post.claimsCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "claims" && (
              <p className="text-gray-500">Claims are counted per post. Total: {totalClaims}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
