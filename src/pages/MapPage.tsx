import { useState, useEffect } from "react";
import { Search, List, MapPin, Clock, User } from 'lucide-react';
import { GoogleMap, Marker, useJsApiLoader} from '@react-google-maps/api';
import { db } from "../firebaseConfig";
import {InfoWindow } from "@react-google-maps/api";
import { collection, getDocs } from "firebase/firestore";
import { getDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";


const MapPage = () => {
  const [viewMode, setViewMode] = useState('map');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [items, setItems] = useState<any[]>([]);  
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();


  // filters
const [searchQuery, setSearchQuery] = useState("");
const [dateRange, setDateRange] = useState("all");

// filtering logic
const filteredItems = items.filter((item) => {
  // category check
  const matchCategory =
    selectedCategory === "all" ||
    item.category?.toLowerCase() === selectedCategory.toLowerCase();

  // type check
  const matchType =
    selectedType === "all" ||
    item.type?.toLowerCase() === selectedType.toLowerCase();

  // search check (title + description)
  const matchSearch =
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase());

  // date check
  let matchDate = true;
  if (dateRange !== "all" && item.date) {
    const itemDate = new Date(item.date); // assuming item.date is string/timestamp
    const now = new Date();
    if (dateRange === "24h") {
      matchDate = now.getTime() - itemDate.getTime() <= 24 * 60 * 60 * 1000;
    } else if (dateRange === "week") {
      matchDate = now.getTime() - itemDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
    } else if (dateRange === "month") {
      matchDate = now.getTime() - itemDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
    }
  }

  return matchCategory && matchType && matchSearch && matchDate;
});

//map components 
const GOOGLE_MAPS_API_KEY = "AIzaSyD0E_jViDB_d8xsDv6hV1tdVgwiNVbEzP8"; // declared at top

const containerStyle = {
  width: '100%',
  height: '100%',
};

const center = { lat: 7.2539, lng: 80.5918 };
const bounds = {
  north: 7.2667,
  south: 7.2400,
  west: 80.5800,
  east: 80.6000,
};

const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });


  const categories = [
    'All Categories',
    'Electronics',
    'Accessories',
    'IDs',
    'Stationery',
    'Clothing',
    'Keys',
    'Other'
  ];

// fetch posts
useEffect(() => {
  const fetchItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, "posts"));
      
      const fetched = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let userName = "Unknown";

          if (data.userId) {
            try {
              console.log("Looking for user:", data.userId); // 👀 debug
              const userDoc = await getDoc(doc(db, "users", data.userId));
              if (userDoc.exists()) {
                console.log("User doc data:", userDoc.data()); // 👀 see fields
                userName =
                  userDoc.data().name ||
                  userDoc.data().fullName ||
                  userDoc.data().username ||
                  userDoc.data().email ||
                  "Unknown";
              } else {
                console.log("No user found for:", data.userId);
              }
            } catch (err) {
              console.error("Error fetching user:", err);
            }
          }

          return { id: docSnap.id, ...data, userName };
        })
      );

      setItems(fetched);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  fetchItems();
}, []);



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h1 className="text-2xl font-bold text-gray-900">Campus Map & Items</h1>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'map'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <MapPin className="w-4 h-4 inline mr-1" />
                Map View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <List className="w-4 h-4 inline mr-1" />
                List View
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  placeholder="Search items..."
                />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
               <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map((category, index) => (
                  <option key={index} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="all"
                      checked={selectedType === 'all'}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Items</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="lost"
                      checked={selectedType === 'lost'}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Lost Items</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="found"
                      checked={selectedType === 'found'}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Found Items</span>
                  </label>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {viewMode === 'map' ? (
              /* Map View */
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
               <div className="h-96 lg:h-[600px]">
                {isLoaded && (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={15}
                  options={{
                    restriction: { latLngBounds: bounds, strictBounds: false },
                    streetViewControl: false,
                    mapTypeControl: false,
                  }}
                >
                  {filteredItems.map((item) => {
                    // Make sure we pull lat/lng correctly
                    const lat = item.mapLocation?.lat ?? item.lat;
                    const lng = item.mapLocation?.lng ?? item.lng;

                    if (lat === undefined || lng === undefined) return null;

                    const isLost = item.type?.toLowerCase() === "lost";

                    return (
                      <Marker
                        key={item.id}
                        position={{ lat, lng }}
                        onClick={() => setActiveMarker(item.id)}
                        icon={{
                          url: isLost
                            ? "https://maps.google.com/mapfiles/kml/paddle/red-circle.png"
                            : "https://maps.google.com/mapfiles/kml/paddle/grn-circle.png",
                          scaledSize: new window.google.maps.Size(50, 50), // 🔴🟢 bigger & highlighted
                        }}
                      >
                        {activeMarker === item.id && (
                          <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                            <div className="text-sm max-w-[200px]">
                              <h3 className="font-bold">{item.title}</h3>
                              <p className="text-gray-600">{item.category}</p>
                              <p className="text-xs text-gray-500">{item.location}</p>
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    );
                  })}
                </GoogleMap>
                )}
               </div>

      <div className="p-4 text-center">
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Lost Items</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Found Items</span>
          </div>
        </div>
      </div>
    </div>
            ) : (
              /* List View */
              <div className="space-y-4">
               {filteredItems.map((item) => (
    <div
      key={item.id}
      onClick={() => {
        if (user) navigate(`/item/${item.id}`);
        // else do nothing
      }}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200"
    >
      <div className="flex flex-col md:flex-row">
        <img
          src={item.images?.[0] || "https://via.placeholder.com/150"}
          alt={item.title}
          className="w-full md:w-32 h-32 object-cover rounded-lg"
        />
        <div className="flex-1 md:ml-6">
          <h3 className="text-lg font-semibold">
            {item.title}{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.type === "lost"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {item.type}
            </span>
          </h3>
          <p className="text-gray-600">{item.description}</p>
          <div className="flex items-center text-sm text-gray-500 space-x-4 mt-2">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> {item.location}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />{" "}
              {item.date || "No date provided"}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" /> Posted by {item.userName}
            </div>
          </div>
        </div>
      </div>
    </div>
  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

  );
};

export default MapPage;