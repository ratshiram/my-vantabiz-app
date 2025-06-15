
import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// IMPORTANT:
// You MUST replace these placeholder values with your actual Firebase project configuration!
// You can find these in your Firebase project console:
// Project settings > General > Your apps > SDK setup and configuration > Config

// Option 1: Using hardcoded values (FOR TESTING/DIAGNOSIS ONLY - NOT RECOMMENDED FOR PRODUCTION)
// This section is now commented out in favor of environment variables.
/*
const firebaseConfig_hardcoded: FirebaseOptions = {
  apiKey: "AIzaSyBwJh2-CUhm7qE2C8NMEytfQm7sbxzKfUc", // Replace with your actual API Key
  authDomain: "fintrack-lite-10936.firebaseapp.com", // Replace with your actual Auth Domain (e.g., project-id.firebaseapp.com)
  projectId: "fintrack-lite-10936", // Replace with your actual Project ID
  storageBucket: "fintrack-lite-10936.firebasestorage.app", // Replace with your actual Storage Bucket (e.g., project-id.appspot.com)
  messagingSenderId: "44749033941", // Replace with your actual Messaging Sender ID
  appId: "1:44749033941:web:fa9dbebe835f2977932d5c", // Replace with your actual App ID
  // measurementId is optional and can be added if Firebase Analytics is used
  // measurementId: "YOUR_MEASUREMENT_ID_HERE",
};
*/

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Log a prominent error if essential Firebase config variables are missing.
// This helps in diagnosing "Internal Server Error" if env vars are not set.
if (!apiKey || !authDomain || !projectId) {
  console.error(
    'CRITICAL_FIREBASE_CONFIG_ERROR: Missing essential Firebase configuration. ' +
    'Please ensure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, ' +
    'and NEXT_PUBLIC_FIREBASE_PROJECT_ID are correctly set in your environment variables ' +
    '(.env.local for local development, or in your hosting provider settings for deployment). ' +
    `Details - API_KEY_PRESENT: ${!!apiKey}, AUTH_DOMAIN_PRESENT: ${!!authDomain}, PROJECT_ID_PRESENT: ${!!projectId}`
  );
}

// Option 2: Using Environment Variables (RECOMMENDED FOR PRODUCTION)
const firebaseConfig: FirebaseOptions = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};


// Initialize Firebase
// This pattern prevents re-initializing the app on hot reloads
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
