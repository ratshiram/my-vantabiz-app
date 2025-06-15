
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANT:
// You MUST replace these placeholder values with your actual Firebase project configuration!
// You can find these in your Firebase project console:
// Project settings > General > Your apps > SDK setup and configuration > Config

// Option 1: Using hardcoded values (FOR TESTING/DIAGNOSIS ONLY - NOT RECOMMENDED FOR PRODUCTION)
// Ensure these values are copied EXACTLY from your Firebase project console.
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBwJh2-CUhm7qE2C8NMEytfQm7sbxzKfUc", // Replace with your actual API Key
  authDomain: "fintrack-lite-10936.firebaseapp.com", // Replace with your actual Auth Domain (e.g., project-id.firebaseapp.com)
  projectId: "fintrack-lite-10936", // Replace with your actual Project ID
  storageBucket: "fintrack-lite-10936.firebasestorage.app", // Replace with your actual Storage Bucket (e.g., project-id.appspot.com)
  messagingSenderId: "44749033941", // Replace with your actual Messaging Sender ID
  appId: "1:44749033941:web:fa9dbebe835f2977932d5c", // Replace with your actual App ID
  // measurementId is optional and can be added if Firebase Analytics is used
  // measurementId: "YOUR_MEASUREMENT_ID_HERE",
};

// Option 2: Using Environment Variables (RECOMMENDED FOR PRODUCTION)
// This is commented out if you are using Option 1.
// const firebaseConfig: FirebaseOptions = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };


// Initialize Firebase
// This pattern prevents re-initializing the app on hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
