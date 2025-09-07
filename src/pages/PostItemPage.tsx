import { useState } from "react";
import { Upload, MapPin, Calendar, Tag, FileImage, X, Sparkles } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { db, storage, auth } from "../firebaseConfig";
import MapPicker from "../components/MapComponent";
import { getCategoryFromVision } from "../vision"; //import Vision helper

const PostItemPage = () => {
  const [itemType, setItemType] = useState("lost");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null); // 👈 new state
  const navigate = useNavigate();
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);

  const categories = [
    "Electronics",
    "Accessories",
    "IDs",
    "Stationery",
    "Clothing",
    "Keys",
    "Books",
    "Jewelry",
    "Sports Equipment",
    "Other",
  ];


  // Convert image to base64 and call Vision API
  const analyzeImage = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(",")[1]; // remove "data:image/...;base64,"
      const result = await getCategoryFromVision(base64String);
      setSuggestedCategory(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!mapLocation) {
      alert("Please select a location on the map");
      setLoading(false);
      return;
    }

    try {
      // 1. Upload images
      const imageUrls: string[] = [];
      for (let i = 0; i < selectedImages.length; i++) {
        const imageFile = selectedImages[i] as File;
        const storageRef = ref(storage, `posts/${Date.now()}-${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      }

      // 2. Save post in Firestore
      await addDoc(collection(db, "posts"), {
        userId: auth.currentUser?.uid,
        type: itemType,
        title: (document.getElementById("title") as HTMLInputElement).value,
        category: (document.getElementById("category") as HTMLSelectElement).value,
        suggestedCategory, // 👈 Save Vision suggestion
        description: (document.getElementById("description") as HTMLTextAreaElement).value,
        date: (document.getElementById("date") as HTMLInputElement).value,
        location: (document.getElementById("location") as HTMLInputElement).value,
        contactInfo: (document.getElementById("contactInfo") as HTMLInputElement).value,
        mapLocation: {
          lat: mapLocation.lat,
          lng: mapLocation.lng,
        },
        images: imageUrls,
        createdAt: serverTimestamp(),
        status: "active",
      });

      alert("Post added successfully ✅");
      navigate("/");
    } catch (error: any) {
      console.error("Error posting item:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post an Item</h1>
          <p className="text-lg text-gray-600">
            Help build our community by posting details about lost or found items
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">


            {/* Item Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What are you posting?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setItemType('lost')}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                    itemType === 'lost'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-red-300 text-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">I Lost Something</h3>
                    <p className="text-sm">Post details about an item you've lost</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setItemType('found')}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                    itemType === 'found'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-300 text-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Tag className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">I Found Something</h3>
                    <p className="text-sm">Post details about an item you've found</p>
                  </div>
                </button>
              </div>
            </div>

             <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Item Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., iPhone 14 Pro, Blue Backpack"
                />
              </div>

            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={suggestedCategory || ""}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Show AI suggestion if available */}
              {suggestedCategory && (
                <div className="mt-2 flex items-center text-sm text-blue-600">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Suggested: <span className="font-medium ml-1">{suggestedCategory}</span>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos
              </label>
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload photos of the item</p>
                    <p className="text-sm text-gray-500 mb-4">
                      PNG, JPG up to 5MB each (max 3 photos)
                    </p>
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                id="fileInput"
                onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    setSelectedImages(files);

                    // Run Vision only on the first image for category suggestion
                    if (files[0]) analyzeImage(files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById("fileInput")?.click()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Files</span>
              </button>
              </div>
              </div>

              {/* Image Preview */}
              {selectedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((file: any, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImages(selectedImages.filter((_, i) => i !== index))
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide detailed description including color, brand, size, distinguishing features..."
              />
            </div>

             {/* Date and Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                              Date {itemType === 'lost' ? 'Lost' : 'Found'} *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="w-5 h-5 text-gray-400" />
                              </div>
                              <input
                                type="date"
                                id="date"
                                name="date"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                              Location *
                            </label>
                            <input
                              type="text"
                              id="location"
                              name="location"
                              required
                              className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g., Library 2nd Floor, Student Center"
                            />
                          </div>
                        </div>
            
            
                        {/* Map Location Selector */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pin Location on Map
                          </label>
                          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
                            <MapPicker onLocationSelect={(loc) => setMapLocation(loc)} />
                          </div>
            
                          {/* Lat/Lng Caption */}
                          {mapLocation && (
                            <p className="mt-2 text-sm text-gray-600 text-left">
                              Selected Location: <span className="font-medium">{mapLocation.lat.toFixed(6)}</span>,{" "}
                              <span className="font-medium">{mapLocation.lng.toFixed(6)}</span>
                            </p>
                          )}
                        </div>

                         {/* Contact Information */}
            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Contact Information (Optional)
              </label>
              <input
                type="text"
                id="contactInfo"
                name="contactInfo"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Phone number, dorm room, etc."
              />
              <p className="mt-2 text-sm text-gray-500">
                Your university email will be the primary contact method
              </p>
            </div>
            

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  itemType === "lost"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {loading ? "Posting..." : `Post ${itemType === "lost" ? "Lost" : "Found"} Item`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostItemPage;
