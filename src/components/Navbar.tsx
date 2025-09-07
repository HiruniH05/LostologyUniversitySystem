import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Menu, X, Plus, Home, ClipboardList, Bolt, Bell, MessageCircle, Settings2, Newspaper, Users, FileText } from 'lucide-react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Badge from "@mui/material/Badge";
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../AuthContext';
import { logoutUser } from '../auth';
import NotificationsPanel from './NotificationsPanel';
import ChatWindow from './ChatWindow';
import { doc, getDoc } from "firebase/firestore";

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  unread?: Record<string, number>;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<Record<string, any>>({});

  const [open, setOpen] = useState(false);    // user actions drawer
  const [open1, setOpen1] = useState(false);  // notifications drawer
  const [open2, setOpen2] = useState(false);  // chat drawer

  const [unreadCount, setUnreadCount] = useState(0);   // notifications
  const [unreadCount2, setUnreadCount2] = useState(0); // chat unread

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);

  const toggleDrawer = (newOpen: boolean) => () => setOpen(newOpen);
  const toggleDrawer1 = (newOpen: boolean) => () => setOpen1(newOpen);
  const toggleDrawer2 = (newOpen: boolean) => () => setOpen2(newOpen);

  const isActive = (path: string) => location.pathname === path;

  // Base nav links
  let navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/feed', label: 'Feed', icon: Newspaper },
    { path: '/map', label: 'Map', icon: MapPin },
  ];

  if (user) {
    navLinks.push({ path: '/post', label: 'Post Item', icon: Plus });

    if (user.role === "admin") {
    navLinks.push({ path: '/dashboard', label: 'Dashboard', icon: Home });
  }
    // navLinks.push({ path: '/dashboard', label: 'Dashboard', icon: Home });
  }

// Notifications listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false)
    );
    return onSnapshot(q, (snapshot) => setUnreadCount(snapshot.size));
  }, [user]);

// Conversations listener
useEffect(() => {
  if (!user) return;

  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", user.uid)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const convs: Conversation[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Conversation, "id">; // tell TS the shape
      return { id: doc.id, ...data };
    });

    setConversations(convs);

    // calculate total unread messages for this user
    const totalUnread = convs.reduce((sum, conv) => {
      return sum + (conv.unread?.[user.uid] ?? 0);
    }, 0);

    setUnreadCount2(totalUnread);
  });

  return () => unsubscribe();
}, [user]);


useEffect(() => {
  if (!user) return;

  const fetchUsers = async () => {
    const uids = conversations.flatMap(conv => conv.participants.filter((uid: string) => uid !== user.uid));
    const uniqueUids = [...new Set(uids)];

    const usersData: Record<string, any> = {};
    for (const uid of uniqueUids) {
      const docRef = await getDoc(doc(db, "users", uid));
      if (docRef.exists()) {
        usersData[uid] = docRef.data();
      }
    }
    setUsers(usersData);
  };

  fetchUsers();
}, [conversations, user]);


useEffect(() => {
  const handler = (e: any) => {
    const convId = e.detail;
    setActiveConversation(convId);
    setOpen2(true);
  };

  window.addEventListener("openChatWith", handler);
  return () => window.removeEventListener("openChatWith", handler);
}, []);


  return (
    <nav className="bg-white/30 backdrop-blur-lg shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-3">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 rounded-xl">
                <img src="/src/Assets/pin.png" className="w-7 h-7 text-white" />
              </div>
              <span className="text-xl font-bold text-victory-green">Lostology</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(path)
                    ? 'bg-gray-100 text-cornflower-blue'
                    : 'text-gray-600 hover:text-cornflower-blue hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <span className="text-violetBlue font-semibold mr-3 ml-5">
                  Hi, {user.fullName}
                </span>

                <Badge badgeContent={unreadCount} color="error">
                  <Bell onClick={toggleDrawer1(true)} className="text-gray-400 ml-auto cursor-pointer hover:text-cornflower-blue transition-colors duration-200" />
                </Badge>

               <Badge badgeContent={unreadCount2} color="error">
              <MessageCircle
                onClick={toggleDrawer2(true)}
                className="text-gray-400 ml-auto cursor-pointer hover:text-cornflower-blue transition-colors duration-200"
              />
            </Badge>

                <Bolt onClick={toggleDrawer(true)} className="text-gray-400 ml-auto cursor-pointer hover:text-cornflower-blue transition-colors duration-200" />
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 text-md hover:text-cornflower-blue transition-colors duration-200">Login</Link>
                <Link to="/register" className="bg-cornflower-blue text-white text-md px-4 py-1 rounded-xl hover:bg-blue-700 transition-colors duration-200">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* drawers */}

      {/* User Actions Drawer */}
      {user && (
        <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}
          PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none' } }}
          ModalProps={{ BackdropProps: { sx: { backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(1px)' } } }}
        >
          <Box sx={{ width: 320 }} role="presentation" className="flex justify-end p-4" onClick={toggleDrawer(false)}>
            <div className="bg-white flex flex-col p-4 space-y-3 rounded-xl shadow-lg w-full max-w-[300px]">
              <h2 className="text-xl font-bold text-cornflower-blue">Actions</h2>

              <Link to="/my-claims" className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-cornflower-blue hover:bg-gray-100 transition-colors duration-200">
                <ClipboardList className="w-5 h-5" /><span>My Claims</span>
              </Link>
              <Link to="/manage-claims" className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-cornflower-blue hover:bg-gray-100 transition-colors duration-200">
                <ClipboardList className="w-5 h-5" /><span>Manage Claims</span>
              </Link>

              <Link to="/my-posts" className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-cornflower-blue hover:bg-gray-100 transition-colors duration-200">
                <FileText  className="w-5 h-5" /><span>My Posts</span>
              </Link>

               {/* Admin-only link */}
                {user.role === "admin" && (
                  <Link
                    to="/manage-users"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-cornflower-blue hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Users className="w-5 h-5" />
                    <span>Manage Users</span>
                  </Link>
                )}


              <Link to="/settings" className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-cornflower-blue hover:bg-gray-100 transition-colors duration-200">
                <Settings2 className="w-5 h-5" /><span>Settings</span>
              </Link>

              <button onClick={() => { logoutUser(); navigate('/'); }}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200">
                <X className="w-5 h-5" /><span>Logout</span>
              </button>
            </div>
          </Box>
        </Drawer>
      )}

      {/* Notifications Drawer */}
      {user && (
        <Drawer anchor="right" open={open1} onClose={toggleDrawer1(false)}
          PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none' } }}
          ModalProps={{ BackdropProps: { sx: { backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(1px)' } } }}
        >
          <Box sx={{ width: 320 }} role="presentation" className="flex justify-end p-4" onClick={toggleDrawer1(false)}>
            <div className="bg-white flex flex-col p-4 space-y-3 rounded-xl shadow-lg w-full max-w-[300px]">
              <h2 className="text-lg font-bold text-cornflower-blue">Notifications</h2>
              <NotificationsPanel />
            </div>
          </Box>
        </Drawer>
      )}

      {/* Chat Drawer */}
      {user && (
        <Drawer
          anchor="right"
          open={open2}
          onClose={() => {
            setOpen2(false);
            setActiveConversation(null);
          }}
          PaperProps={{
            sx: {
              width: 350,
              borderTopLeftRadius: "1rem",
              borderBottomLeftRadius: "1rem",
              backgroundColor: "white",
              boxShadow: "-4px 0 12px rgba(0,0,0,0.1)",
            },
          }}
          ModalProps={{
            BackdropProps: {
              sx: { backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" },
            },
          }}
        >
          <Box
            sx={{ height: "90%", display: "flex", flexDirection: "column" }}
            role="presentation"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-cornflower-blue">Chat</h2>
              </div>

              {/* Inbox */}
              {!activeConversation && (
                <div className="flex-1 overflow-y-auto p-3">
                  {conversations.length === 0 ? (
                    <p className="text-gray-500 mt-4">No conversations yet.</p>
                  ) : (
                    conversations.map((conv) => {
                      const otherUserId = conv.participants.find(
                        (uid: string) => uid !== user.uid
                      );
                      const unread = conv.unread?.[user.uid] || 0;

                      return (
                       <div
                        key={conv.id}
                        onClick={() => setActiveConversation(conv.id)}
                        className="flex justify-between items-center p-3 mb-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >

                        <div className="flex items-center space-x-3">

                          <img
                            src="/src/Assets/userImg.png"
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />

                          <div>
                            <p className="font-medium">
                              {users[otherUserId]?.fullName || otherUserId}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {conv.lastMessage || "No messages yet"}
                            </p>
                          </div>
                        </div>

                        {/* Unread badge on right side */}
                        {unread > 0 && (
                          <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {unread}
                          </span>
                        )}
                      </div>

                      );
                    })
                  )}
                </div>
              )}

              {/* Chat Window */}
              {activeConversation && (
                <ChatWindow
                  conversationId={activeConversation}
                  onClose={() => setActiveConversation(null)}
                />
              )}
            </div>
          </Box>
        </Drawer>
      )}


    </nav>
  );
};

export default Navbar;
