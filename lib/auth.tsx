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
    // Defer Auth initialization to reduce initial JS execution time
    // Use requestIdleCallback or setTimeout to defer non-critical auth check
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    const initAuth = () => {
      const authInstance = auth(); // Call the getter
      if (!authInstance) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      unsubscribe = onAuthStateChanged(authInstance, (user) => {
        if (mounted) {
          setUser(user);
          setLoading(false);
        }
      });
    };

    // Defer auth initialization until after initial render (mobile-optimized)
    // This reduces JS execution time on page load
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(initAuth, { timeout: 2000 });
    } else {
      setTimeout(initAuth, 500); // Increased delay for mobile
    }

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signIn = async () => {
    const authInstance = auth(); // Call the getter
    if (!authInstance) {
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
      
      await signInWithPopup(authInstance, provider);
      
      // Check if sign-in succeeded (even if there were COOP warnings)
      // The onAuthStateChanged listener will update the user state
      if (authInstance.currentUser) {
        // Sign-in successful, ignore any COOP warnings
        return;
      }
    } catch (error: any) {
      // COOP warnings are harmless - check if user is actually signed in
      // Sometimes the popup closes with a warning but sign-in still succeeds
      if (authInstance.currentUser) {
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
      if (!authInstance.currentUser) {
        throw error;
      }
    }
  };

  const signOut = async () => {
    const authInstance = auth(); // Call the getter
    if (!authInstance) {
      throw new Error('Firebase Auth is not initialized');
    }
    await firebaseSignOut(authInstance);
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

