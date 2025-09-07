import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthChange } from "./auth";
import { db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface User {
  uid: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser: any) => {
      if (firebaseUser) {
        // 🔹 Fetch Firestore user document
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Merge Firebase Auth + Firestore data
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: userData.fullName,
            role: userData.role,
          });
        } else {
          // fallback if no Firestore doc
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.displayName || "Unnamed",
            role: "user", // default
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
