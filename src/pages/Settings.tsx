// src/pages/Settings.tsx
import React from "react";
import { User, Lock, Bell, LogOut } from "lucide-react";
import { useAuth } from "../AuthContext";
import { logoutUser } from "../auth";
import { useNavigate } from "react-router-dom";
import { getAuth, updatePassword } from "firebase/auth";

const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();

  // 🔹 Change password
  const handleChangePassword = async () => {
    const newPassword = prompt("Enter your new password:");
    if (!newPassword) return;

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        alert("Password updated successfully!");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Failed to update password. You may need to re-login.");
    }
  };

  // 🔹 Logout
  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Container */}
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-cornflower-blue">
            User Settings
          </h1>
        </div>

        {/* Profile */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-700 flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-500" />
            Profile
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Name</span>
              <span className="text-gray-800 font-medium">
                {user?.fullName || "Not set"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email</span>
              <span className="text-gray-800 font-medium">
                {user?.email || "Not set"}
              </span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-700 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-gray-500" />
            Security
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Change Password</span>
              <button
                onClick={handleChangePassword}
                className="text-indigo-600 hover:underline"
              >
                Update
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Two-Factor Authentication</span>
              <button className="text-indigo-600 hover:underline" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-700 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-gray-500" />
            Notifications
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Push Notifications</span>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white shadow rounded-lg p-6 flex items-center justify-between">
          <div className="flex items-center text-red-600">
            <LogOut className="w-5 h-5 mr-2" />
            <span className="font-medium">Log Out</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
