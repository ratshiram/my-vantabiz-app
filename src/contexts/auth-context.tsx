
"use client";

import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginFormValues, SignupFormValues, AuthProviderProps, UserBusinessDetails } from '@/lib/types';
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
  updateDoc, // Added updateDoc
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
  updateUserBusinessDetails: (details: UserBusinessDetails) => Promise<void>; // New function
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
            businessName: userData.businessName,
            businessAddress: userData.businessAddress,
            businessTaxId: userData.businessTaxId,
            logoUrl: userData.logoUrl,
          });
        } else {
           const defaultTrialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
           const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "User",
            username: "", 
            tier: 'free', 
            trialEndDate: defaultTrialEndDate,
            businessName: "",
            businessAddress: "",
            businessTaxId: "",
            logoUrl: null,
          };
           setUser(newUser);
           await setDoc(userDocRef, { 
             email: newUser.email, 
             name: newUser.name, 
             username: newUser.username, 
             tier: newUser.tier, 
             trialEndDate: Timestamp.fromDate(defaultTrialEndDate),
             createdAt: Timestamp.now(),
             businessName: "",
             businessAddress: "",
             businessTaxId: "",
             logoUrl: null,
            }, { merge: true });
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
      let errorCode = "Unknown error";
      let errorMessage = "An unexpected error occurred during login.";
      
      if (error instanceof Error && (error as AuthError).code) {
        const firebaseError = error as AuthError;
        errorCode = firebaseError.code;
        errorMessage = `Firebase: ${firebaseError.message} (code: ${firebaseError.code})`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error("Login Failed:", errorCode, errorMessage, error); 
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
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
        createdAt: Timestamp.now(),
        businessName: "", // Initialize business fields
        businessAddress: "",
        businessTaxId: "",
        logoUrl: null,
      });
      
      router.push('/');
    } catch (error) {
      setIsLoading(false);
      let errorCode = "Unknown error";
      let errorMessage = "An unexpected error occurred during signup.";

      if (error instanceof Error && (error as AuthError).code) {
        const firebaseError = error as AuthError;
        errorCode = firebaseError.code;
        errorMessage = `Firebase: ${firebaseError.message} (code: ${firebaseError.code})`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error("Signup Failed:", errorCode, errorMessage, error); 
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
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
        setUser(null); // Clear user state on logout
        setIsLoading(false); 
    }
  }, [router, toast]);

  const updateUserBusinessDetails = useCallback(async (details: UserBusinessDetails) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to update business details.", variant: "destructive" });
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    try {
      const userDocRef = doc(db, "users", user.id);
      // Ensure undefined fields are handled correctly for Firestore (it removes fields if value is undefined)
      // To clear a field, you might need to explicitly set it to null or an empty string.
      const detailsToUpdate: Partial<UserBusinessDetails> = {
        businessName: details.businessName ?? "", // Store empty string if undefined
        businessAddress: details.businessAddress ?? "",
        businessTaxId: details.businessTaxId ?? "",
        logoUrl: details.logoUrl === undefined ? null : details.logoUrl, // Store null if undefined
      };

      await updateDoc(userDocRef, detailsToUpdate);
      setUser(prevUser => prevUser ? { ...prevUser, ...detailsToUpdate } : null);
      toast({ title: "Success", description: "Business details updated successfully." });
    } catch (error) {
      console.error("Failed to update business details:", error);
      toast({ title: "Error", description: "Failed to update business details.", variant: "destructive" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);


  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUserBusinessDetails }}>
      {children}
    </AuthContext.Provider>
  );
}
