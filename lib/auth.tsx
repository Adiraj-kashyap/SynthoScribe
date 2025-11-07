import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './firebase';
import { ADMIN_EMAIL } from '../constants';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
    }
    
    try {
      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      // Set custom parameters to improve popup handling
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithPopup(auth, provider);
      
      // Check if sign-in succeeded (even if there were COOP warnings)
      // The onAuthStateChanged listener will update the user state
      if (auth.currentUser) {
        // Sign-in successful, ignore any COOP warnings
        return;
      }
    } catch (error: any) {
      // COOP warnings are harmless - check if user is actually signed in
      // Sometimes the popup closes with a warning but sign-in still succeeds
      if (auth.currentUser) {
        // Sign-in actually succeeded despite the error
        return;
      }
      
      // Provide more helpful error messages
      if (error?.code === 'auth/configuration-not-found') {
        throw new Error('Firebase Authentication is not configured. Please enable Google Sign-in in Firebase Console.');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled.');
      } else if (error?.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      } else if (error?.code === 'auth/cancelled-popup-request') {
        // Multiple popup requests - ignore, user is likely already signing in
        return;
      }
      
      // For other errors, check one more time if user is signed in
      // (COOP warnings might cause false errors)
      if (!auth.currentUser) {
        throw error;
      }
    }
  };

  const signOut = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized');
    }
    await firebaseSignOut(auth);
  };

  // Compare emails case-insensitively and trim whitespace
  const userEmail = user?.email?.toLowerCase().trim() || '';
  const isAdmin = userEmail === ADMIN_EMAIL;
  
  // Debug logging in development
  if (user && typeof window !== 'undefined') {
    console.log('Auth Debug:', {
      userEmail,
      adminEmail: ADMIN_EMAIL,
      isAdmin,
      match: userEmail === ADMIN_EMAIL
    });
  }

  const value: AuthContextType = {
    user,
    isAdmin,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

