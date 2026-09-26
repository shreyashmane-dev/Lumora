import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBhpQW-3qD_MZNOaGN2hXscOakV5zCggAA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "one-for-all-5e842.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "one-for-all-5e842",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "one-for-all-5e842.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "993610150510",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:993610150510:web:670661e393b7de3720ec7f",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-9XW8QMVNT4"
};

export const isFirebaseConfigured = true;

// Initialize Firebase app singleton
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
let auth: Auth;
let db: Firestore;

try {
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("[Firebase] Initialization warning:", e);
}

export { app, auth, db };
