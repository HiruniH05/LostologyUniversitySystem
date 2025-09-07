// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBoEjV5gCLUalMy0cbeRrROKg3WYKj70g",
  authDomain: "lostology-e3a3c.firebaseapp.com",
  projectId: "lostology-e3a3c",
  storageBucket: "lostology-e3a3c.firebasestorage.app",
  messagingSenderId: "461557392674",
  appId: "1:461557392674:web:1143c105e23c20d9deb17b",
  measurementId: "G-MR4W7YFFQR"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
