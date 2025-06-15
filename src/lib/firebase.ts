
import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// !! IMPORTANT !!
// If you are seeing "Firebase: Error (auth/invalid-api-key)", TRIPLE-CHECK that the value for
// NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file (for local development)
// or in your Netlify (or other hosting provider) Environment Variables settings
// is EXACTLY CORRECT and matches the API Key from your Firebase project console.
// (Project settings > General > Your apps > SDK setup and configuration > Config > apiKey)
// Also, ensure the variable is not an empty string or just whitespace.
// =================================================================================================

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

const requiredEnvVars: (keyof typeof firebaseConfigValues)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  // storageBucket, messagingSenderId, appId are often important but might not be strictly required for auth/firestore initialization.
  // Add them here if they become critical for your app's core functionality.
];

const missingVars = requiredEnvVars.filter(key => {
  const value = firebaseConfigValues[key];
  return !value || value.trim() === "";
});

if (missingVars.length > 0) {
  const errorMessage =
    `CRITICAL_FIREBASE_CONFIG_ERROR: Essential Firebase configuration environment variables are missing or empty. ` +
    `Please ensure the following environment variables are correctly set with non-empty values: ${missingVars.map(v => `NEXT_PUBLIC_FIREBASE_${v.toUpperCase()}`).join(', ')}. ` +
    'Check .env.local for local development, or your hosting provider settings (e.g., Netlify) for deployment. ' +
    `Current Values (masked for security if present): ${requiredEnvVars.map(k => `${k}: ${firebaseConfigValues[k] ? 'SET' : 'MISSING_OR_EMPTY'}`).join(', ')}`;
  
  console.error(errorMessage);
  // Note: Throwing an error here might be too disruptive if some parts of the app can run without full Firebase.
  // However, for an auth/invalid-api-key, it's likely auth is fundamental.
  // Depending on the app's needs, you might throw here or handle it more gracefully.
  // For now, the console error should be prominent.
}


const firebaseConfig: FirebaseOptions = {
  apiKey: firebaseConfigValues.apiKey,
  authDomain: firebaseConfigValues.authDomain,
  projectId: firebaseConfigValues.projectId,
  storageBucket: firebaseConfigValues.storageBucket,
  messagingSenderId: firebaseConfigValues.messagingSenderId,
  appId: firebaseConfigValues.appId,
  measurementId: firebaseConfigValues.measurementId,
};


// Initialize Firebase
// This pattern prevents re-initializing the app on hot reloads
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// The next line (getAuth) is where "auth/invalid-api-key" will typically throw if the apiKey in firebaseConfig is bad
const auth: Auth = getAuth(app); 
const db: Firestore = getFirestore(app);

export { app, auth, db };
