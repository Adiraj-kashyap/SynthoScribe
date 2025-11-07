import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// IMPORTANT: SECRETS MANAGEMENT
// For this project to work, you must create a `.env.local` file in the root of your project
// and add your Firebase web app's configuration.
//
// Your `.env.local` file should look like this:
//
// REACT_APP_FIREBASE_API_KEY="your-api-key"
// REACT_APP_FIREBASE_AUTH_DOMAIN="your-auth-domain"
// REACT_APP_FIREBASE_PROJECT_ID="your-project-id"
// REACT_APP_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
// REACT_APP_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
// REACT_APP_FIREBASE_APP_ID="your-app-id"
//
// You can get these values from your Firebase project settings.
// Go to Project Settings > General > Your apps > Web app > SDK setup and configuration.
//
// SECURITY NOTE: The `serviceAccountKey.json` you mentioned is for BACKEND (server-side) use only.
// It contains private keys and must NEVER be exposed in a client-side application like this one.
// The configuration below is safe for browsers because access is controlled by Firestore Security Rules.

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

let app: any = null;
let dbInstance: any = null;
let authInstance: any = null;
let functionsInstance: any = null;

// Lazy initialization to reduce initial load time
function initializeFirebase() {
  if (app) return; // Already initialized
  
  if (!firebaseConfig.apiKey) {
    console.warn("Firebase config is missing. Real-time features will be disabled. Please check your .env.local file.");
    return;
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  // Lazy initialize Auth, Firestore and Functions (defer until needed)
  // This reduces critical path by avoiding Firebase SDK initialization on import
}

// Defer Firebase app initialization to reduce initial JS execution (mobile-optimized)
// Only initialize when actually needed
function getAppInstance() {
  if (!app) {
    if (!firebaseConfig.apiKey) return null;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
  }
  return app;
}

// Initialize app lazily - defer until first use
// This reduces initial JS execution time significantly

// Lazy getter for Auth
function getAuthInstance() {
  const appInstance = getAppInstance();
  if (!appInstance) return null;
  if (!authInstance) {
    authInstance = getAuth(appInstance);
  }
  return authInstance;
}

// Lazy getters for Firestore and Functions
function getDb() {
  const appInstance = getAppInstance();
  if (!appInstance) return null;
  if (!dbInstance) {
    dbInstance = getFirestore(appInstance);
  }
  return dbInstance;
}

function getFunctionsInstance() {
  const appInstance = getAppInstance();
  if (!appInstance) return null;
  if (!functionsInstance) {
    functionsInstance = getFunctions(appInstance);
  }
  return functionsInstance;
}

// Export as getters to maintain API compatibility
// These will be called when needed, not on import
export const db = getDb;
export const auth = getAuthInstance;
export { getFunctionsInstance as functions };
