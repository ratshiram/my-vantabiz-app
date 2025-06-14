
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANT:
// You MUST replace these placeholder values with your actual Firebase project configuration!
// You can find these in your Firebase project console:
// Project settings > General > Your apps > SDK setup and configuration > Config

const firebaseConfig: FirebaseOptions = {
  apiKey: "YOUR_API_KEY_HERE", // Replace with your actual API Key
  authDomain: "YOUR_AUTH_DOMAIN_HERE", // Replace with your actual Auth Domain (e.g., project-id.firebaseapp.com)
  projectId: "YOUR_PROJECT_ID_HERE", // Replace with your actual Project ID
  storageBucket: "YOUR_STORAGE_BUCKET_HERE", // Replace with your actual Storage Bucket (e.g., project-id.appspot.com)
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE", // Replace with your actual Messaging Sender ID
  appId: "YOUR_APP_ID_HERE", // Replace with your actual App ID
  // measurementId is optional and can be added if Firebase Analytics is used
  // measurementId: "YOUR_MEASUREMENT_ID_HERE",
};

// Initialize Firebase
// This pattern prevents re-initializing the app on hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
