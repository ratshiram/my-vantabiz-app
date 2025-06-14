
"use client";

import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginFormValues, SignupFormValues } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { app } from '@/lib/firebase'; // Assuming firebase app is initialized and exported from here

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (values: LoginFormValues) => Promise<void>;
  signup: (values: SignupFormValues) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

const auth = getAuth(app);
const db = getFirestore(app);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          let trialEndDate: Date | null = null;
          if (userData.trialEndDate && userData.trialEndDate instanceof Timestamp) {
            trialEndDate = userData.trialEndDate.toDate();
          } else if (userData.trialEndDate && typeof userData.trialEndDate === 'string') {
            trialEndDate = new Date(userData.trialEndDate); // Fallback if stored as string
          }

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: userData.name || firebaseUser.displayName || "",
            tier: userData.tier || 'free',
            trialEndDate: trialEndDate,
          });
        } else {
          // This case might happen if user exists in Auth but not Firestore. Handle as needed.
          // For now, treat as no full profile, default to basic info.
           setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "User",
            tier: 'free', 
            trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default new trial
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // onAuthStateChanged will handle setting user state and fetching data
      router.push('/'); 
    } catch (error) {
      setIsLoading(false);
      console.error("Login failed:", error);
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to login.");
      }
      throw new Error("An unexpected error occurred during login.");
    }
    // setIsLoading(false) is handled by onAuthStateChanged listener
  }, [router]);

  const signup = useCallback(async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;
      
      const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const newUser: User = {
        id: firebaseUser.uid,
        email: values.email,
        name: values.name,
        tier: 'free',
        trialEndDate: trialEndDate,
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        email: values.email,
        name: values.name,
        tier: 'free',
        trialEndDate: Timestamp.fromDate(trialEndDate), // Store as Firestore Timestamp
      });
      
      // setUser(newUser); // onAuthStateChanged will handle this
      router.push('/');
    } catch (error) {
      setIsLoading(false);
      console.error("Signup failed:", error);
      if (error instanceof Error) {
         throw new Error(error.message || "Failed to sign up.");
      }
      throw new Error("An unexpected error occurred during signup.");
    }
    // setIsLoading(false) is handled by onAuthStateChanged listener
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will set user to null
      router.push('/login');
    } catch (error) {
        console.error("Logout failed: ", error);
    } finally {
        setIsLoading(false); // Explicitly set here as onAuthStateChanged might take time
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
