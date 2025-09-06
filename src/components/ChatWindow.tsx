// src/components/ChatWindow.tsx
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../AuthContext";
import { X } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

interface ChatWindowProps {
  conversationId: string;
  onClose?: () => void;
}

export default function ChatWindow({ conversationId, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [participantNames, setParticipantNames] = useState<string[]>([]);

  // Load conversation meta
  useEffect(() => {
    if (!conversationId) return;
    const fetchConv = async () => {
      const convRef = doc(db, "conversations", conversationId);
      const convSnap = await getDoc(convRef);
      if (convSnap.exists()) {
        setConversation({ id: convSnap.id, ...convSnap.data() });
      }
    };
    fetchConv();
  }, [conversationId]);

  // Reset unread when chat is opened
  useEffect(() => {
    if (!conversationId || !user) return;
    const resetUnread = async () => {
      const convRef = doc(db, "conversations", conversationId);
      await updateDoc(convRef, {
        [`unread.${user.uid}`]: 0,
      });
    };
    resetUnread();
  }, [conversationId, user]);

  // Load messages in real time
  useEffect(() => {
    if (!conversationId) return;
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !conversation || !newMessage.trim()) return;

    // Add the message
    await addDoc(collection(db, "conversations", conversationId, "messages"), {
      senderId: user.uid,
      text: newMessage,
      createdAt: serverTimestamp(),
    });

    // Update conversation metadata + increment unread for others
    const convRef = doc(db, "conversations", conversationId);
    const updates: any = {
      lastMessage: newMessage,
      lastMessageAt: serverTimestamp(),
    };

    conversation.participants.forEach((p: string) => {
      if (p !== user.uid) {
        updates[`unread.${p}`] = increment(1);
      }
    });

    await updateDoc(convRef, updates);

    setNewMessage("");
  };


useEffect(() => {
  if (!conversation?.participants || !user) return;

  // Filter out the current user
  const otherIds: string[] = conversation.participants.filter(
    (p: string) => p !== user.uid
  );

  const fetchNames = async () => {
    try {
      const names = await Promise.all(
        otherIds.map(async (id: string) => {
          const docRef = doc(db, "users", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            return data.fullName || "Unknown";
          }
          return "Unknown";
        })
      );
      setParticipantNames(names);
    } catch (error) {
      console.error("Error fetching participant names:", error);
    }
  };

  fetchNames();
}, [conversation, user]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b font-semibold flex justify-between items-center">
        <div className="flex items-center space-x-3">
            
            <img
            src="/src/Assets/userImg.png"
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
            />
            <span>Chat with {participantNames.join(", ")}</span>
        </div>

        {onClose && (
            <button
            onClick={onClose}
            className="text-red-600 p-1 hover:bg-gray-200 rounded-full"
            >
            <X className="w-4 h-4" />
            </button>
        )}
    </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.uid;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 max-w-[70%] text-sm shadow-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-2xl rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-2xl rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t flex space-x-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-cornflower-blue text-white px-4 py-2 rounded-xl"
        >
          Send
        </button>
      </form>
    </div>
  );
}
