import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function NotificationsPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [user]);

  const handleNotificationClick = async (n: any) => {
    // Mark as read
    await updateDoc(doc(db, "notifications", n.id), { read: true });
    // Redirect to the notification's link
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications</p>
      ) : (
        notifications.map((n) => (
          <div 
            key={n.id} 
            className={`p-3 rounded-lg cursor-pointer ${n.read ? "bg-gray-50" : "bg-blue-50"}`}
            onClick={() => handleNotificationClick(n)} // pass whole notif
          >
            <p className="font-semibold text-gray-800">{n.title}</p>
            <p className="text-sm text-gray-600">{n.message}</p>
          </div>
        ))
      )}
    </div>
  );
}
