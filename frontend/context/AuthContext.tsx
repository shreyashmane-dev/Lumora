"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
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

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Developer",
            isDemo: false
          };
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
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || email.split("@")[0],
        isDemo: false
      };
      setUser(profile);
      localStorage.setItem("lumora_user", JSON.stringify(profile));
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
    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: email.split("@")[0],
        isDemo: false
      };
      setUser(profile);
      localStorage.setItem("lumora_user", JSON.stringify(profile));
    } else {
      await login(email, pass);
    }
  };

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || "Google Developer",
        isDemo: false
      };
      setUser(profile);
      localStorage.setItem("lumora_user", JSON.stringify(profile));
    } else {
      loginAsDemo();
    }
  };

  const loginAsDemo = () => {
    const profile: UserProfile = {
      uid: "dev_default_user",
      email: "developer@lumora.ai",
      displayName: "Pro Developer",
      isDemo: true
    };
    setUser(profile);
    localStorage.setItem("lumora_user", JSON.stringify(profile));
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
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
