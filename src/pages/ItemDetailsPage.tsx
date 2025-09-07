import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, limit, getDocs} from "firebase/firestore";
import { orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { MapPin, Calendar, Tag, Mail, Flag, Heart, Share2, Clock } from "lucide-react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import userImg from '../Assets/userImg.png';
import { InfoWindow } from "@react-google-maps/api";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {addDoc, serverTimestamp } from "firebase/firestore";
import ClaimDialog from "../components/ClaimDialog";
import { updateDoc } from "firebase/firestore";

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "lost" | "found";
  images: string[];
  location: string;
  mapLocation?: { lat: number; lng: number };
  date?: string;
  createdAt?: any;
  userId: string;   // Firestore reference to users collection
  status?: string;
  user?: User;      // we’ll attach this dynamically
}

interface User {
  fullName: string;
  role?: string; 
}


const ItemDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [similarItems, setSimilarItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const [claims, setClaims] = useState<any[]>([]);
  const [selected, setSelected] = useState(false);


const { user } = useAuth();
const isOwner = user?.uid === item?.userId;
  
// Load Google Maps API
const { isLoaded } = useJsApiLoader({
  googleMapsApiKey: "AIzaSyD0E_jViDB_d8xsDv6hV1tdVgwiNVbEzP8", 
});

const mapContainerStyle = {
  width: "100%",
  height: "250px",
  borderRadius: "12px",
};

// constants 
const center = { lat: 7.2539, lng: 80.5918 };
const bounds = {
  north: 7.2667,
  south: 7.2400,
  west: 80.5800,
  east: 80.6000,
};


//fetch
useEffect(() => {
  const fetchItemAndUser = async () => {
    if (!id) return;

    try {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        let itemData = { id: docSnap.id, ...docSnap.data() } as any;

        console.log("Raw item data from Firestore:", itemData);

        // ✅ Normalize mapLocation into plain {lat, lng} numbers
        if (itemData.mapLocation) {
          itemData.mapLocation = {
            lat: typeof itemData.mapLocation.lat === "number"
              ? itemData.mapLocation.lat
              : itemData.mapLocation.lat.toNumber?.() || parseFloat(itemData.mapLocation.lat),
            lng: typeof itemData.mapLocation.lng === "number"
              ? itemData.mapLocation.lng
              : itemData.mapLocation.lng.toNumber?.() || parseFloat(itemData.mapLocation.lng),
          };
        }
        console.log("Item mapLocation just before rendering:", itemData.mapLocation);
        console.log("Normalized mapLocation:", itemData.mapLocation);

        // Fetch user info
        if (itemData.userId) {
          const userRef = doc(db, "users", itemData.userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            itemData = {
              ...itemData,
              user: userSnap.data() as User,
            };
          }
        }

        setItem(itemData);

        // Fetch similar items
        if (itemData.category) {
          const q = query(
            collection(db, "posts"),
            where("category", "==", itemData.category),
            limit(3)
          );
          const querySnapshot = await getDocs(q);
          const items = querySnapshot.docs
            .map((d) => ({ id: d.id, ...d.data() } as Item))
            .filter((d) => d.id !== id);

          setSimilarItems(items);
        }
      } else {
        console.warn("No item found for ID:", id);
      }
    } catch (err) {
      console.error("Error fetching item:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchItemAndUser();
}, [id]);


//claiming 
const handleClaimSubmit = async (message: string) => {
  if (!user) {
    alert("You need to log in to claim this item.");
    return;
  }

  try {
    // 1️⃣ Add the claim to the claims subcollection
    const claimsRef = collection(db, "posts", item.id, "claims");
    await addDoc(claimsRef, {
      userId: user.uid,
      userName: user.fullName,
      message: message,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // 2️⃣ Send a notification to the item owner
    if (item.userId && item.userId !== user.uid) { // prevent notifying self
      await addDoc(collection(db, "notifications"), {
        userId: item.userId, // owner of the item
        title: "New Claim",
        message: `${user.fullName} submitted a claim for your item "${item.title}".`,
        link: `/manage-claims`, // or wherever you want them to go
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    alert("✅ Claim submitted! The owner will review it.");
  } catch (err) {
    console.error("Error submitting claim:", err);
    alert("❌ Failed to submit claim. Try again.");
  }
};


// Fetch claims (always for count, but details only visible to owner)
useEffect(() => {
  if (!item?.id) return;

  const claimsRef = collection(db, "posts", item.id, "claims");
  const q = query(claimsRef, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const claimList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClaims(claimList);
  });

  return () => unsubscribe();
}, [item?.id]);



//update claim status
const updateClaimStatus = async (claimId: string, status: string) => {
  try {
    const claimRef = doc(db, "posts", item.id, "claims", claimId);

    //Update the claim status
    await updateDoc(claimRef, { status });

    //Get the claim data to know who to notify
    const claimSnap = await getDoc(claimRef);
    if (claimSnap.exists()) {
      const claimData: any = claimSnap.data();

      // Only notify if the claimer is not the owner
      if (claimData.userId !== user?.uid) {
        await addDoc(collection(db, "notifications"), {
          userId: claimData.userId, // claimer
          title: `Your claim was ${status}`,
          message: `The owner has ${status} your claim for "${item.title}".`,
          link: `/my-claims`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    alert(`Claim ${status}!`);
  } catch (error) {
    console.error("Error updating claim:", error);
  }
};


//chat
const startConversation = async () => {
  if (!user || !item?.userId) return;
  if (user.uid === item.userId) {
    alert("You cannot message yourself.");
    return;
  }

  try {
    // Check if a conversation already exists
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    );
    const snapshot = await getDocs(q);

    let existingConv = snapshot.docs.find((doc) => {
      const data = doc.data();
      return data.participants.includes(item.userId);
    });

    let convId;
    if (existingConv) {
      convId = existingConv.id;
    } else {
      // Create new conversation
      const newConv = await addDoc(collection(db, "conversations"), {
        participants: [user.uid, item.userId],
        createdAt: serverTimestamp(),
      });
      convId = newConv.id;
    }

    // Dispatch event to open chat drawer with this conversation
    window.dispatchEvent(new CustomEvent("openChatWith", { detail: convId }));
  } catch (err) {
    console.error("Error starting conversation:", err);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

    {!item ? (
      <p className="text-center mt-10 text-red-500">Item not found</p>
    ) : (
      <>
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.type === "lost"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.type === "lost" ? "Lost Item" : "Found Item"}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    <span>{item.category}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>
                      {item.createdAt?.toDate
                        ? item.createdAt.toDate().toLocaleString()
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button 

                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Message Owner</span>
                </button>
                <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button className="border border-gray-300 text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Images */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.images?.map((image: string, index: number) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`${item.title} - Image ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{item.description}</p>
            </div>

            {/* Location and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{item.location}</p>
                      <p className="text-gray-600 text-sm">{item.specificLocation}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.type === "lost" ? "Date Lost" : "Date Found"}
                      </p>
                      <p className="text-gray-600 text-sm">{item.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Map Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location on Map</h2>
            <div className="bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
              
              {isLoaded && item.mapLocation ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  onLoad={(map) => {
                    const bounds = new window.google.maps.LatLngBounds(item.mapLocation);
                    map.fitBounds(bounds);
                    map.setZoom(14); // override fitBounds zoom
                  }}
                >
                  <Marker
                  position={item.mapLocation}
                  icon={{
                    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="red">
                        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/>
                      </svg>
                    `),
                    scaledSize: new window.google.maps.Size(60, 60),
                    anchor: new window.google.maps.Point(30, 60),
                  }}
                />
                </GoogleMap>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
                    <MapPin className="w-8 h-8 mb-2 text-blue-600" />
                    <p>No map location available</p>
                  </div>
                )}
            </div>
          </div>
          </div>
        </div>
        

        {/* Sidebar Info */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Posted By */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Posted By</h3>
            <div className="flex items-center space-x-3 mb-4">
            <img
                src={userImg} 
                alt={item.user?.fullName || "Unknown"}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {item.user?.fullName || "Unknown User"}
                  </span>
                  {item.user?.verified && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">{item.user?.role || "Student"}</p>
              </div>
            </div>
            <button 
             onClick={startConversation}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
              Send Message
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Claims</span>
                <span className="font-semibold text-softpurple">{claims.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Views</span>
                <span className="font-semibold text-gray-900">127</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Saves</span>
                <span className="font-semibold text-gray-900">23</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setOpenClaimDialog(true)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
              >
                Claim This Item
              </button>
              <button className="w-full border border-gray-300 text-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2">
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>

              <ClaimDialog
                open={openClaimDialog}
                onClose={() => setOpenClaimDialog(false)}
                onSubmit={handleClaimSubmit}
              />


            </div>
          </div>

        </div>

       {isOwner && (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Claims</h3>
          {claims.length === 0 ? (
            <p className="text-gray-500">No claims yet.</p>
          ) : (
            claims.map((claim) => (
              <div
                key={claim.id}
                className="border-b py-3 flex items-center justify-between"
              >
                {/* Left side: message + user */}
                <div>
                  <p className="font-medium">{claim.message}</p>
                  <p className="text-sm text-gray-600">By: {claim.userName}</p>
                </div>

                {/* Middle: status with color */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold
                    ${
                      claim.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : claim.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }
                  `}
                >
                  {claim.status}
                </span>

                {/* Right side: buttons */}
                {claim.status === "pending" && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => updateClaimStatus(claim.id, "approved")}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateClaimStatus(claim.id, "rejected")}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}



        {/* Similar Items */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Similar Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarItems.length > 0
              ? similarItems.map((sim) => (
                  <Link
                    key={sim.id}
                    to={`/item/${sim.id}`}   // ✅ navigate to item details with new ID
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 block"
                  >
                    <div className="bg-gray-200 h-32 rounded-lg mb-3">
                      <img
                        src={sim.images?.[0] || "https://via.placeholder.com/150"}
                        alt={sim.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{sim.title}</h4>
                    <p className="text-sm text-gray-600">
                      {sim.category} • {sim.location}
                    </p>
                  </Link>
                ))
              : [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-4 h-48 bg-gray-50"
                  />
                ))}
          </div>
        </div>

        </>
      )}

      </div>
    </div>
  );
};

export default ItemDetailsPage;
