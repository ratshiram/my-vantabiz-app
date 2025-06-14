
"use client";

import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginFormValues, SignupFormValues } from '@/lib/types';
import { useRouter } from 'next/navigation';

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

const MOCK_USER_STORAGE_KEY = 'vantabiz-mock-user';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(MOCK_USER_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Need to convert date strings back to Date objects
        if (parsedUser.trialEndDate) {
          parsedUser.trialEndDate = new Date(parsedUser.trialEndDate);
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem(MOCK_USER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserAndStorage = useCallback((newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(MOCK_USER_STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async (values: LoginFormValues) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app, you'd fetch user data based on credentials
    // For mock, let's assume login always succeeds if email is "user@example.com" for pro, "trial@example.com" for free
    let mockUser: User | null = null;
    if (values.email === "pro@example.com") {
        mockUser = {
            id: 'mock-pro-user-id',
            email: values.email,
            name: 'Pro User',
            tier: 'pro',
            trialEndDate: null,
        };
    } else if (values.email === "trial@example.com") {
         mockUser = {
            id: 'mock-trial-user-id',
            email: values.email,
            name: 'Trial User',
            tier: 'free',
            trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        };
    } else {
        // Simulate failed login
        setIsLoading(false);
        throw new Error("Invalid credentials");
    }
    
    updateUserAndStorage(mockUser);
    setIsLoading(false);
    router.push('/'); // Navigate to dashboard or desired page
  }, [updateUserAndStorage, router]);

  const signup = useCallback(async (values: SignupFormValues) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = {
      id: crypto.randomUUID(),
      email: values.email,
      name: values.name,
      tier: 'free', // New signups start on free trial
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };
    updateUserAndStorage(newUser);
    setIsLoading(false);
    router.push('/'); // Navigate to dashboard or desired page
  }, [updateUserAndStorage, router]);

  const logout = useCallback(() => {
    updateUserAndStorage(null);
    router.push('/login');
  }, [updateUserAndStorage, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
