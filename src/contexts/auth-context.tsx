
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
  type AuthError // Import AuthError for better type checking, though instanceof Error often suffices
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { app } from '@/lib/firebase'; // Assuming firebase app is initialized and exported from here
import { useToast } from "@/hooks/use-toast"; // Ensure useToast is imported

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
  const { toast } = useToast(); // Initialize toast

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
           setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "User",
            username: "", 
            tier: 'free', 
            trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
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
      router.push('/'); 
    } catch (error) {
      setIsLoading(false);
      let errorMessage = "An unexpected error occurred during login.";
      // Firebase errors usually have a 'code' and 'message'
      if (error instanceof Error && (error as any).code) {
        errorMessage = `Error: ${(error as any).code} - ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Login failed:", error); 
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      // Re-throw if you need to handle it further up the chain, otherwise toast is user feedback
      // throw new Error(errorMessage); 
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
      });
      
      router.push('/');
    } catch (error) {
      setIsLoading(false);
      let errorMessage = "An unexpected error occurred during signup.";
      // Firebase errors usually have a 'code' and 'message'
      if (error instanceof Error && (error as any).code) {
        errorMessage = `Error: ${(error as any).code} - ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Signup failed:", error); 
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      // Re-throw if you need to handle it further up the chain
      // throw new Error(errorMessage);
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
        // onAuthStateChanged will set user to null and isLoading to false eventually
        // but for immediate UI feedback on logout action, we can set isLoading here.
        // However, relying on onAuthStateChanged is generally cleaner.
        // For now, let onAuthStateChanged handle user and final loading state.
        // If router.push('/login') happens before onAuthStateChanged fully processes,
        // the login page might briefly show a loading state or the old user state.
        // To be safe, let's ensure isLoading is false after attempting logout.
        setIsLoading(false);
    }
  }, [router, toast]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
