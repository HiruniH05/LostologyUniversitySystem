import { useEffect, useState } from "react";
import { MapPin, Clock, Newspaper } from "lucide-react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const FeedPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(fetchedItems);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute bg-blue-600 opacity-60 rounded-full w-[300px] h-[300px] top-[-80px] left-[-100px] blur-3xl"></div>
          <div className="absolute bg-victory-green opacity-80 rounded-full w-[220px] h-[220px] bottom-[-60px] right-[-80px] blur-2xl"></div>
        </div>
        <div className="relative z-10 py-10 text-center px-4 sm:px-6 lg:px-8">
          <Newspaper className="w-10 h-10 mx-auto mb-3 text-white/90" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Community Feed</h1>
          <p className="text-base md:text-lg opacity-80 max-w-2xl mx-auto">
            Explore all lost and found posts from your campus
          </p>
        </div>
      </div>

      {/* Feed Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <p className="text-center text-gray-500">Loading posts...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500">No items have been posted yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (user) navigate(`/item/${item.id}`);
                  // else do nothing
                }}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2 cursor-pointer`}
              >
                <div className="relative">
                  <img
                    src={item.images?.[0] || "https://via.placeholder.com/400x300"}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                      item.type === "lost"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.type === "lost" ? "Lost" : "Found"}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{item.category}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
