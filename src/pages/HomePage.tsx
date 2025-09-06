// import React from 'react';
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Plus, MapPin, Search, Clock, Users, Shield } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginPromptDialog from "../components/LoginPromptDialog";


const HomePage = () => {
const [recentItems, setRecentItems] = useState<any[]>([]);
const [dialogOpen, setDialogOpen] = useState(false);
const { user } = useAuth();
const navigate = useNavigate();
  

//fetch from firestore
  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecentItems(items);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchRecentItems();
  }, []);

  
const [stats, setStats] = useState([
  { icon: Users, label: 'Active Users', value: '0' },
  { icon: MapPin, label: 'Items Posted', value: '0' },
  { icon: Shield, label: 'Success Rate', value: '87%' }
]);

useEffect(() => {
  const fetchStats = async () => {
    try {
      // Count active users
      const usersSnap = await getDocs(collection(db, 'users'));
      const activeUsersCount = usersSnap.size;

      // Count items posted
      const postsSnap = await getDocs(collection(db, 'posts'));
      const itemsPostedCount = postsSnap.size;

      // Optional: calculate success rate (found vs total)
      // const foundItemsCount = postsSnap.docs.filter(doc => doc.data().type === 'found').length;
      // const successRate = postsSnap.size > 0 ? Math.round((foundItemsCount / postsSnap.size) * 100) : 0;

      setStats([
        { icon: Users, label: 'Active Users', value: activeUsersCount.toLocaleString() },
        { icon: MapPin, label: 'Items Posted', value: itemsPostedCount.toLocaleString() },
        { icon: Shield, label: 'Success Rate', value: '87%' }
      ]);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  fetchStats();
}, []);


type FloatingMapPinProps = {
  top: string;
  left: string;
  delay?: string;
};

const FloatingMapPin = ({ top, left, delay }: FloatingMapPinProps) => (
  <MapPin
    className="absolute text-white/20 w-10 h-10 animate-float"
    style={{ top, left, animationDelay: delay }}
  />
);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {/* <div className="bg-navy text-white">
        <img 
        src={MapIllustration}
        alt="Map Illustration"
        className="hidden md:block absolute right-0 center-0 w-48 md:w-64 lg:w-[300px] xl:w-[350px] opacity-30 pointer-events-none select-none"
      />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-3xl md:text-6xl font-bold mb-6 leading-tight">
               Lostology
               </h1>
              <h2 className="text-wild-sand text-2xl mb-4 opacity-60">"Where Lost Meets Found"</h2>
            
            <p className="text-xl md:text-2xl mb-8 text-wild-sand max-w-3xl mx-auto leading-relaxed">
              Connect with your campus community to recover lost items and help others find theirs. 
              A centralized platform designed for university students and staff.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/post"
              className="bg-white text-violetBlue px-8 py-3 rounded-2xl font-semibold text-lg hover:bg-violetBlue hover:text-white transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plus className="w-5 h-5" />
              <span>Post an Item</span>
            </Link>
            <Link
              to="/map"
              className="border-2 border-white/60 text-white px-8 py-3 rounded-2xl font-semibold text-lg hover:bg-white hover:text-violetBlue transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-xl transform hover:-translate-y-1"
            >
              <MapPin className="w-5 h-5" />
              <span>Browse Map</span>
            </Link>
          </div>

          </div>
        </div>
      </div> */}
      <div className="relative bg-navy text-white overflow-hidden">
      {/* Abstract blob-style background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bg-blue-600 opacity-60 rounded-full w-[400px] h-[400px] top-[-100px] left-[-150px] blur-3xl"></div>
        <div className="absolute bg-victory-green opacity-80 rounded-full w-[300px] h-[300px] bottom-[-80px] right-[-100px] blur-2xl"></div>

        {/* Floating map pins */}
        <FloatingMapPin top="10%" left="63%" delay="0s" />
        <FloatingMapPin top="67%" left="80%" delay="1s" />
        <FloatingMapPin top="50%" left="15%" delay="2s" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl md:text-6xl font-bold mb-6 leading-tight">Lostology</h1>
        <h2 className="text-wild-sand text-xl mb-4 opacity-60">"Where lost things find their way back"</h2>
        <p className="text-xl md:text-2xl mb-8 text-wild-sand max-w-3xl mx-auto leading-relaxed">
          Connect with your campus community to recover lost items and help others find theirs.
          A centralized platform designed for university students and staff.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Post an Item Button (login required) */}
          <button
            onClick={() => {
              if (!user) setDialogOpen(true);
              else navigate('/post');
            }}
            className="bg-white text-cornflower-blue px-8 py-3 rounded-2xl font-semibold text-lg hover:bg-violetBlue hover:text-white transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            <span>Post an Item</span>
          </button>

          {/* Browse Map Button (always works) */}
          <Link
            to="/map"
            className="border-2 border-white/60 text-white px-8 py-3 rounded-2xl font-semibold text-lg hover:bg-white hover:text-cornflower-blue transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-xl transform hover:-translate-y-1"
          >
            <MapPin className="w-5 h-5" />
            <span>Browse Map</span>
          </Link>
        </div>

      </div>
    </div>

      {/* Stats Section - Floating Card Style */}
      <div className="relative z-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="-mt-20 bg-white rounded-2xl shadow-lg p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map(({ icon: Icon, label, value }, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-victory-green" />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
                <div className="text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Recent Items Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          See what items have been recently posted by your campus community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
       {recentItems.map((item) => (
        <div
          key={item.id}
           onClick={() => {
            if (!user) setDialogOpen(true);
            else navigate(`/item/${item.id}`);
          }}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2 cursor-pointer"
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

     <div className="text-center mt-12">
      <button
        onClick={() => {
          if (!user) setDialogOpen(true);
          else navigate('/map');
        }}
        className="bg-cornflower-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 inline-flex items-center space-x-2"
      >
        <Search className="w-5 h-5" />
        <span>View All Items</span>
      </button>
    </div>
    </div>

      <LoginPromptDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)} // MUST update state
      />


    </div>
  );
};

export default HomePage;