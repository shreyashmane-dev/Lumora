"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  monthlyQuota?: number;
  role?: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync or create user profile in Firestore
  const syncUserToFirestore = async (fbUser: FirebaseUser): Promise<UserProfile> => {
    let profile: UserProfile = {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Developer",
      monthlyQuota: 10000,
      role: "developer",
      isDemo: false
    };

    if (db) {
      try {
        const userRef = doc(db, "users", fbUser.uid);
        const snapshot = await getDoc(userRef);
        if (!snapshot.exists()) {
          await setDoc(userRef, {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: profile.displayName,
            monthlyQuota: 10000,
            role: "developer",
            createdAt: serverTimestamp()
          });
        } else {
          const data = snapshot.data();
          profile.monthlyQuota = data?.monthlyQuota || 10000;
          profile.role = data?.role || "developer";
        }
      } catch (e) {
        console.warn("[AuthContext] Firestore sync notice (non-fatal):", e);
      }
    }

    return profile;
  };

  useEffect(() => {
    // Check local storage for persistent guest/demo session
    const savedUser = localStorage.getItem("lumora_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }

    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const profile = await syncUserToFirestore(fbUser);
          setUser(profile);
          localStorage.setItem("lumora_user", JSON.stringify(profile));
        } else if (!savedUser) {
          setUser(null);
          localStorage.removeItem("lumora_user");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const profile = await syncUserToFirestore(cred.user);
        setUser(profile);
        localStorage.setItem("lumora_user", JSON.stringify(profile));
      } catch (err: any) {
        // Humanize common Firebase auth error codes
        if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          throw new Error("Invalid email or password. If you are new, please click 'Create Account' above.");
        } else if (err.code === "auth/too-many-requests") {
          throw new Error("Too many unsuccessful login attempts. Please try again later or use Instant Demo Login.");
        } else if (err.code === "auth/network-request-failed") {
          throw new Error("Network request failed. Please check your internet connection.");
        }
        throw err;
      }
    } else {
      // Local dev session
      const profile: UserProfile = {
        uid: `user_${Math.random().toString(36).substring(2, 9)}`,
        email: email,
        displayName: email.split("@")[0],
        isDemo: true
      };
      setUser(profile);
      localStorage.setItem("lumora_user", JSON.stringify(profile));
    }
  };

  const signup = async (email: string, pass: string) => {
    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        const profile = await syncUserToFirestore(cred.user);
        setUser(profile);
        localStorage.setItem("lumora_user", JSON.stringify(profile));
      } catch (err: any) {
        if (err.code === "auth/email-already-in-use") {
          throw new Error("This email is already registered. Please sign in or use a different email.");
        } else if (err.code === "auth/weak-password") {
          throw new Error("Password must be at least 6 characters long.");
        }
        throw err;
      }
    } else {
      await login(email, pass);
    }
  };

  const loginWithGoogle = async () => {
    if (auth) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const cred = await signInWithPopup(auth, provider);
        const profile = await syncUserToFirestore(cred.user);
        setUser(profile);
        localStorage.setItem("lumora_user", JSON.stringify(profile));
      } catch (err: any) {
        if (err.code === "auth/popup-closed-by-user") {
          throw new Error("Google sign-in popup was closed before completion.");
        }
        throw err;
      }
    } else {
      loginAsDemo();
    }
  };

  const loginAsDemo = () => {
    const profile: UserProfile = {
      uid: "dev_default_user",
      email: "developer@lumora.ai",
      displayName: "Pro Developer (Demo)",
      monthlyQuota: 10000,
      role: "developer",
      isDemo: true
    };
    setUser(profile);
    localStorage.setItem("lumora_user", JSON.stringify(profile));
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error(e);
      }
    }
    setUser(null);
    localStorage.removeItem("lumora_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
