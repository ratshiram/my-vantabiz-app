
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
];

const missingOrEmptyVars = requiredEnvVars.filter(key => {
  const value = firebaseConfigValues[key];
  return value === undefined || value === null || String(value).trim() === "";
});

if (missingOrEmptyVars.length > 0) {
  const errorMessage =
    `CRITICAL_FIREBASE_CONFIG_ERROR: Essential Firebase configuration environment variables are missing or empty. ` +
    `Please ensure the following environment variables are correctly set with non-empty values: ${missingOrEmptyVars.map(v => `NEXT_PUBLIC_FIREBASE_${v.toUpperCase()}`).join(', ')}. ` +
    'Check your .env.local file (for local development) or your hosting provider settings (e.g., Netlify Environment Variables) for deployment. ' +
    `Current Values (masked for security if present): ${requiredEnvVars.map(k => `${k}: ${firebaseConfigValues[k] && String(firebaseConfigValues[k]).trim() !== "" ? 'SET_BUT_POSSIBLY_INVALID' : 'MISSING_OR_EMPTY'}`).join(', ')}`;
  
  console.error(errorMessage);
  // This will be caught by the try-catch below if initialization fails due to truly missing critical config.
  // For "auth/invalid-api-key", firebaseConfigValues.apiKey might be present but incorrect.
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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  auth = getAuth(app); 
  db = getFirestore(app);

} catch (error) {
  console.error("CRITICAL_FIREBASE_INIT_OR_SERVICE_ERROR: Failed to initialize Firebase app or get Auth/Firestore service.", error);
  console.error("Firebase Config Used:", firebaseConfig); // Log the config that was attempted
  // If there's a CRITICAL_FIREBASE_CONFIG_ERROR from above due to missing vars, initializeApp might still proceed
  // but then getAuth/getFirestore could fail, or getAuth might throw auth/invalid-api-key if apiKey is present but wrong.
  // Re-throwing here makes it clear that Firebase setup failed.
  throw error; 
}

export { app, auth, db };
