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
  login: (email: string, pass: string) => Promise<UserProfile>;
  signup: (email: string, pass: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  loginAsDemo: () => UserProfile;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync or create user profile in Firestore with a fast non-blocking timeout
  const syncUserToFirestore = async (fbUser: FirebaseUser): Promise<UserProfile> => {
    const profile: UserProfile = {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Developer",
      monthlyQuota: 10000,
      role: "developer",
      isDemo: false
    };

    if (db) {
      // Protect login from slow Firestore networks: max 2.5s wait before proceeding
      const timeout = new Promise((resolve) => setTimeout(resolve, 2500));
      const firestoreTask = (async () => {
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
          console.warn("[AuthContext] Firestore sync warning (proceeding with session):", e);
        }
      })();

      await Promise.race([firestoreTask, timeout]);
    }

    return profile;
  };

  useEffect(() => {
    // 1. Check local storage for persistent session
    const savedUser = localStorage.getItem("lumora_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        console.error("[AuthContext] Error parsing saved session:", e);
      }
    }

    // 2. Listen to Firebase Auth state
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const profile = await syncUserToFirestore(fbUser);
          setUser(profile);
          localStorage.setItem("lumora_user", JSON.stringify(profile));
        } else {
          // If Firebase says no user, only clear if NOT an active demo/offline session
          const currentStorage = localStorage.getItem("lumora_user");
          if (currentStorage) {
            try {
              const currentParsed = JSON.parse(currentStorage);
              if (currentParsed?.isDemo) {
                // Keep the demo session active across page navigations
                setUser(currentParsed);
                setLoading(false);
                return;
              }
            } catch (err) {}
          }
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

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    const cleanEmail = email.trim();
    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        const profile = await syncUserToFirestore(cred.user);
        setUser(profile);
        localStorage.setItem("lumora_user", JSON.stringify(profile));
        return profile;
      } catch (err: any) {
        // Humanize common Firebase auth error codes
        if (
          err.code === "auth/invalid-credential" ||
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password"
        ) {
          throw new Error("INVALID_CREDENTIALS");
        } else if (err.code === "auth/too-many-requests") {
          throw new Error("Too many unsuccessful login attempts. Please wait a moment or use 1-Click Developer Access.");
        } else if (err.code === "auth/network-request-failed") {
          throw new Error("Network request failed. Please check your internet connection.");
        } else if (err.code === "auth/operation-not-allowed") {
          throw new Error("Email/Password sign-in is not enabled in Firebase Console. Please use 1-Click Developer Access.");
        }
        throw new Error(err.message || "Failed to sign in.");
      }
    } else {
      // Local dev session fallback
      const profile: UserProfile = {
        uid: `user_${Math.random().toString(36).substring(2, 9)}`,
        email: cleanEmail,
        displayName: cleanEmail.split("@")[0],
        isDemo: true
      };
      setUser(profile);
      localStorage.setItem("lumora_user", JSON.stringify(profile));
      return profile;
    }
  };

  const signup = async (email: string, pass: string): Promise<UserProfile> => {
    const cleanEmail = email.trim();
    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        const profile = await syncUserToFirestore(cred.user);
        setUser(profile);
        localStorage.setItem("lumora_user", JSON.stringify(profile));
        return profile;
      } catch (err: any) {
        if (err.code === "auth/email-already-in-use") {
          throw new Error("EMAIL_ALREADY_IN_USE");
        } else if (err.code === "auth/weak-password") {
          throw new Error("Password must be at least 6 characters long.");
        } else if (err.code === "auth/operation-not-allowed") {
          throw new Error("Email signup is not enabled in Firebase Console. Please use 1-Click Developer Access.");
        }
        throw new Error(err.message || "Failed to create account.");
      }
    } else {
      return login(cleanEmail, pass);
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    if (auth) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        const cred = await signInWithPopup(auth, provider);
        const profile = await syncUserToFirestore(cred.user);
        setUser(profile);
        localStorage.setItem("lumora_user", JSON.stringify(profile));
        return profile;
      } catch (err: any) {
        if (err.code === "auth/popup-closed-by-user") {
          throw new Error("Google sign-in popup was closed before completion.");
        } else if (err.code === "auth/popup-blocked") {
          throw new Error("Sign-in popup was blocked by your browser. Please allow popups or use Email login.");
        } else if (err.code === "auth/unauthorized-domain") {
          throw new Error("This domain is not in Firebase authorized domains. Please use Email login or 1-Click Developer Access.");
        }
        throw new Error(err.message || "Google sign-in could not be completed.");
      }
    } else {
      return loginAsDemo();
    }
  };

  const loginAsDemo = (): UserProfile => {
    const profile: UserProfile = {
      uid: "dev_default_user",
      email: "developer@lumora.ai",
      displayName: "Pro Developer (Active)",
      monthlyQuota: 10000,
      role: "developer",
      isDemo: true
    };
    setUser(profile);
    localStorage.setItem("lumora_user", JSON.stringify(profile));
    return profile;
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error("[AuthContext] Logout notice:", e);
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
