
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: Replace these placeholder values with your actual Firebase project configuration!
// You can find these in your Firebase project console:
// Project settings > General > Your apps > SDK setup and configuration > Config
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBwJh2-CUhm7qE2C8NMEytfQm7sbxzKfUc", // Replace with your actual API Key
  authDomain: "fintrack-lite-10936.firebaseapp.com", // Replace with your actual Auth Domain (e.g., project-id.firebaseapp.com)
  projectId: "fintrack-lite-10936", // Replace with your actual Project ID
  storageBucket: "fintrack-lite-10936.firebasestorage.app", // Replace with your actual Storage Bucket (e.g., project-id.appspot.com)
  messagingSenderId: "44749033941", // Replace with your actual Messaging Sender ID
  appId: "1:44749033941:web:fa9dbebe835f2977932d5c", // Replace with your actual App ID
  // measurementId is optional and can be added if Firebase Analytics is used
  // measurementId: "G-HR7ZDD6THC",
};

// Initialize Firebase
// This pattern prevents re-initializing the app on hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

