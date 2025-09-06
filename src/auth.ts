import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Register user
export const registerUser = async (fullName: string, email: string, password: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const user = res.user;

  // Save user info in Firestore
  await setDoc(doc(db, "users", user.uid), {
    fullName,
    email,
    role: "user",
    createdAt: serverTimestamp(),
  });

  return user;
};

// Login user
export const loginUser = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, "users", res.user.uid));
  return { ...res.user, role: userDoc.data()?.role, fullName: userDoc.data()?.fullName };
};

// Logout user
export const logoutUser = async () => {
  await signOut(auth);
};

// Listen to auth changes
export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      callback({ uid: user.uid, email: user.email, fullName: userDoc.data()?.fullName, role: userDoc.data()?.role });
    } else {
      callback(null);
    }
  });
};
