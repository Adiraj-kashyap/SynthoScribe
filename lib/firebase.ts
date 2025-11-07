import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

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

let app;
let db = null;
let auth = null;
let storage = null;
let functions = null;

// Initialize Firebase only if all config values are provided
if (firebaseConfig.apiKey) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  functions = getFunctions(app);
  
  // Connect to emulator in development if needed
  // Uncomment the line below if you're using Firebase emulators locally
  // if (import.meta.env.DEV) {
  //   connectFunctionsEmulator(functions, 'localhost', 5001);
  // }
} else {
  console.warn("Firebase config is missing. Real-time features will be disabled. Please check your .env.local file.");
}

export { db, auth, storage, functions };
