"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/firebase'; // Use the initialized app

const LOGIN_COUNT_KEY = 'poteniallyLoginCount';

// Define the shape of the context state
interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginCount: number;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginCount: 0,
});

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginCount, setLoginCount] = useState(0);

  useEffect(() => {
    // Only proceed if firebaseApp is initialized
    if (!firebaseApp) {
        setLoading(false);
        console.error("Firebase app is not initialized. Cannot set up auth state listener.");
        return;
    }

    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        const currentCount = parseInt(localStorage.getItem(LOGIN_COUNT_KEY) || '0') + 1;
        localStorage.setItem(LOGIN_COUNT_KEY, currentCount.toString());
        setLoginCount(currentCount);
        setUser(user);
      } else {
        // User is signed out.
        setUser(null);
        setLoginCount(0); // Reset count on sign out
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = { user, loading, loginCount };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
