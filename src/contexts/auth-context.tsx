
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
  type User as FirebaseUser,
  type AuthError
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (values: LoginFormValues) => Promise<void>;
  signup: (values: SignupFormValues) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const db = getFirestore(app);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

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
            trialEndDate = new Date(userData.trialEndDate); 
          }

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: userData.name || firebaseUser.displayName || "",
            username: userData.username || "", 
            tier: userData.tier || 'free',
            trialEndDate: trialEndDate,
          });
        } else {
           // This case might happen if user exists in Auth but not in Firestore (e.g., Firestore doc creation failed)
           // Or for newly created users before Firestore doc is set.
           // We can create a default user object here or handle it based on app logic.
           // For now, creating a basic user object with default trial.
           const defaultTrialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
           setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "User", // Or prompt user to set name
            username: "", // Or prompt user to set username
            tier: 'free', 
            trialEndDate: defaultTrialEndDate, 
          });
           // Optionally, create the Firestore document if it's missing and should exist
           // await setDoc(userDocRef, { email: firebaseUser.email, name: "User", username: "", tier: 'free', trialEndDate: Timestamp.fromDate(defaultTrialEndDate) }, { merge: true });
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
      router.push('/'); 
      // Toast for success is handled by the form if needed, or can be added here
    } catch (error) {
      setIsLoading(false);
      let errorCode = "Unknown error";
      let errorMessage = "An unexpected error occurred during login.";
      
      if (error instanceof Error && (error as AuthError).code) {
        const firebaseError = error as AuthError;
        errorCode = firebaseError.code;
        errorMessage = firebaseError.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error("Login Failed:", errorCode, errorMessage, error); 
      toast({
        title: "Login Failed",
        description: `Error: ${errorCode}. ${errorMessage}`,
        variant: "destructive",
      });
    }
  }, [router, toast]);

  const signup = useCallback(async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const firebaseUser = userCredential.user;
      
      const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await setDoc(doc(db, "users", firebaseUser.uid), {
        name: values.name,
        username: values.username,
        email: values.email,
        tier: 'free',
        trialEndDate: Timestamp.fromDate(trialEndDate),
        createdAt: Timestamp.now(), // Good practice to add creation timestamp
      });
      
      router.push('/');
      // Toast for success is handled by the form if needed, or can be added here
    } catch (error) {
      setIsLoading(false);
      let errorCode = "Unknown error";
      let errorMessage = "An unexpected error occurred during signup.";

      if (error instanceof Error && (error as AuthError).code) {
        const firebaseError = error as AuthError;
        errorCode = firebaseError.code;
        errorMessage = firebaseError.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error("Signup Failed:", errorCode, errorMessage, error); 
      toast({
        title: "Signup Failed",
        description: `Error: ${errorCode}. ${errorMessage}`,
        variant: "destructive",
      });
    }
  }, [router, toast]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
        console.error("Logout failed: ", error);
        toast({
            title: "Logout Failed",
            description: "An error occurred while trying to log out.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false); // Explicitly set loading to false
    }
  }, [router, toast]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

