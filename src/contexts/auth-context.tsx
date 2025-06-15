
"use client";

import React from 'react'; // Changed: Import React default
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
  updateDoc,
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
  updateUserBusinessDetails: (details: UserBusinessDetails) => Promise<void>;
}

const authFirebase = getAuth(app); // Renamed to avoid potential naming conflicts
const dbFirestore = getFirestore(app); // Renamed for clarity

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined); // Changed

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null); // Changed
  const [isLoading, setIsLoading] = React.useState(true); // Changed
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => { // Changed
    const unsubscribe = onAuthStateChanged(authFirebase, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser) {
        const userDocRef = doc(dbFirestore, "users", firebaseUser.uid);
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
           await setDoc(doc(dbFirestore, "users", firebaseUser.uid), { 
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

  const login = React.useCallback(async (values: LoginFormValues) => { // Changed
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(authFirebase, values.email, values.password);
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

  const signup = React.useCallback(async (values: SignupFormValues) => { // Changed
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(authFirebase, values.email, values.password);
      const firebaseUser = userCredential.user;
      
      const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await setDoc(doc(dbFirestore, "users", firebaseUser.uid), {
        name: values.name,
        username: values.username,
        email: values.email,
        tier: 'free',
        trialEndDate: Timestamp.fromDate(trialEndDate),
        createdAt: Timestamp.now(),
        businessName: "", 
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

  const logout = React.useCallback(async () => { // Changed
    setIsLoading(true);
    try {
      await signOut(authFirebase);
      router.push('/login');
    } catch (error) {
        console.error("Logout failed: ", error);
        toast({
            title: "Logout Failed",
            description: "An error occurred while trying to log out.",
            variant: "destructive"
        });
    } finally {
        setUser(null); 
        setIsLoading(false); 
    }
  }, [router, toast]);

  const updateUserBusinessDetails = React.useCallback(async (details: UserBusinessDetails) => { // Changed
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to update business details.", variant: "destructive" });
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    try {
      const userDocRef = doc(dbFirestore, "users", user.id);
      const detailsToUpdate: Partial<UserBusinessDetails> = {
        businessName: details.businessName ?? "", 
        businessAddress: details.businessAddress ?? "",
        businessTaxId: details.businessTaxId ?? "",
        logoUrl: details.logoUrl === undefined ? null : details.logoUrl, 
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
