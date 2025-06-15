
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

// Maps the internal keys of firebaseConfigValues to the exact environment variable names.
const expectedEnvVarNames: Record<keyof typeof firebaseConfigValues, string> = {
  apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'NEXT_PUBLIC_FIREBASE_APP_ID',
  measurementId: 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
};

const requiredConfigKeys: (keyof typeof firebaseConfigValues)[] = [
  'apiKey',
  'authDomain',
  'projectId',
];

const missingOrEmptyVars = requiredConfigKeys.filter(key => {
  const value = firebaseConfigValues[key];
  return value === undefined || value === null || String(value).trim() === "";
});

if (missingOrEmptyVars.length > 0) {
  const missingVarDetails = missingOrEmptyVars
    .map(key => expectedEnvVarNames[key])
    .join(', ');
  const currentValuesDetails = requiredConfigKeys
    .map(key => `${expectedEnvVarNames[key]}: ${firebaseConfigValues[key] && String(firebaseConfigValues[key]).trim() !== "" ? 'SET_BUT_POSSIBLY_INVALID' : 'MISSING_OR_EMPTY'}`)
    .join(', ');

  const errorMessage =
    `CRITICAL_FIREBASE_CONFIG_ERROR: Essential Firebase configuration environment variables are missing or empty. ` +
    `Please ensure the following environment variables are correctly set with non-empty values: ${missingVarDetails}. ` +
    'Check your .env.local file (for local development) or your hosting provider settings (e.g., Netlify Environment Variables) for deployment. ' +
    `Current Values (internal mapping check): ${currentValuesDetails}.`;
  
  console.error(errorMessage);
  // This console.error will be visible in your server logs (local terminal or Netlify Function logs).
  // The try-catch below will handle the actual initialization failure if critical config is truly missing.
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
  console.error("Firebase Config Used (values passed to initializeApp):", {
    apiKey: firebaseConfig.apiKey ? 'PRESENT_BUT_POSSIBLY_INVALID' : 'MISSING_OR_EMPTY_IN_CONFIG_OBJECT',
    authDomain: firebaseConfig.authDomain ? 'PRESENT' : 'MISSING_OR_EMPTY_IN_CONFIG_OBJECT',
    projectId: firebaseConfig.projectId ? 'PRESENT' : 'MISSING_OR_EMPTY_IN_CONFIG_OBJECT',
    // Add other non-sensitive config values if needed for debugging, but avoid logging full keys.
  });
  // It's critical to re-throw the error if Firebase cannot initialize,
  // otherwise the app might continue in a broken state.
  throw error; 
}

export { app, auth, db };
