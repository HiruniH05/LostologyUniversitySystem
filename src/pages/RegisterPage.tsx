// import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, MapPin } from 'lucide-react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from '../auth';

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!fullName.trim()) {
    alert("Full name is required");
    return;
  }

  if (!email.trim()) {
    alert("Email is required");
    return;
  }

  if (!password) {
    alert("Password is required");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const user = await registerUser(fullName.trim(), email.trim(), password);

    console.log("User registered:", user);
    alert("Account created successfully ✅");
    navigate("/");   // redirect to homepage

  } catch (error: any) {
    console.error("Registration error:", error.message);
    alert(error.message);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-600 p-3 rounded-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Lostology</h2>
          <p className="text-gray-600">Create your account to start finding lost items</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}   // controlled
                onChange={(e) => setFullName(e.target.value)}  
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                placeholder="John Doe"
              />
              </div>
            </div>

             <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          University Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="w-5 h-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}  //controlled input
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
            placeholder="student@university.edu"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Must be a valid university email address
        </p>
      </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                id="password"
                name="password"
                type="password"
                required
                value={password}   //controlled value
                onChange={(e) => setPassword(e.target.value)}  
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                placeholder="Create a strong password"
              />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
               <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                placeholder="Confirm your password"
              />
              </div>
            </div>

            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                Student/Staff ID (Optional)
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                placeholder="Enter your ID number"
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-green-600 hover:text-green-500 transition-colors duration-200">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-green-600 hover:text-green-500 transition-colors duration-200">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">University Verification</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Only university email addresses are accepted to ensure a safe and trusted community for students and staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;