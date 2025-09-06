import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../AuthContext";

export function useInbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageAt", "desc")
    );

    return onSnapshot(q, (snap) => {
      setConversations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  return conversations;
}
