import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthChange } from "./auth";

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
    const unsubscribe = onAuthChange((firebaseUser: User | null) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
