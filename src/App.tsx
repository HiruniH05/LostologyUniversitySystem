// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from "./components/ScrollToTop";
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MapPage from './pages/MapPage';
import PostItemPage from './pages/PostItemPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import FloatingChatButton from './components/FloatingChatButton';
import { AuthProvider } from './AuthContext';
import MyClaims from './pages/MyClaims';
import ManageClaims from './pages/ManageClaims';
import FeedPage from './pages/FeedPage';
import Settings from './pages/Settings';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
        <Navbar />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/post" element={<PostItemPage />} />
          <Route path="/item/:id" element={<ItemDetailsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/my-claims" element={<MyClaims />} />
          <Route path="/manage-claims" element={<ManageClaims />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>

         <FloatingChatButton />
         
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;