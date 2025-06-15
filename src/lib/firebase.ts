
import { initializeApp, getApps, getApp, type FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// !! IMPORTANT !!
// If you are seeing "Firebase: Error (auth/invalid-api-key)", TRIPLE-CHECK that the value for
// NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file (for local development)
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
  apiKey: 'AIzaSyBwJh2-CUhm7qE2C8NMEytfQm7sbxzKfUc',
  authDomain: 'fintrack-lite-10936.firebaseapp.com',
  projectId: 'fintrack-lite-10936',
  storageBucket: 'fintrack-lite-10936.firebasestorage.app',
  messagingSenderId: '44749033941',
  appId: '1:44749033941:web:fa9dbebe835f2977932d5c',
  measurementId: 'G-HR7ZDD6THC',
};

const requiredConfigKeys: (keyof typeof firebaseConfigValues)[] = [
  'apiKey',
  'authDomain',
  'projectId',
];

// Check for missing or empty *required* environment variables
const missingOrEmptyVars = requiredConfigKeys.filter(key => {
  const value = firebaseConfigValues[key];
  return value === undefined || value === null || String(value).trim() === "";
});

if (missingOrEmptyVars.length > 0) {
  const missingVarDetails = missingOrEmptyVars
    .map(key => expectedEnvVarNames[key]) 
    .join(', ');

  const currentValuesDetails = requiredConfigKeys
    .map(key => {
      const envVarName = expectedEnvVarNames[key]; 
      const value = firebaseConfigValues[key];    
      return `${envVarName}: ${value && String(value).trim() !== "" ? 'SET_BUT_POSSIBLY_INVALID' : 'MISSING_OR_EMPTY'}`;
    })
    .join(', ');

  const errorMessage =
    `CRITICAL_FIREBASE_CONFIG_ERROR: Essential Firebase configuration environment variables are missing or empty. ` +
    `Please ensure the following environment variables are correctly set with non-empty values: ${missingVarDetails}. ` +
    'Check your .env.local file (for local development). ' +
    `Current Status of Required Variables (based on process.env access): ${currentValuesDetails}.`;
  
  console.error(errorMessage);
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
  const configPassedToInitStatus = Object.fromEntries(
    Object.entries(firebaseConfig).map(([key, value]) => [
      key,
      value && String(value).trim() !== "" ? 'PROVIDED_TO_INIT_BUT_POSSIBLY_INVALID' : 'MISSING_OR_EMPTY_IN_CONFIG_OBJECT_FOR_INIT'
    ])
  );
  console.error("Firebase Config Object Passed to initializeApp (values derived from process.env):", configPassedToInitStatus);
  throw error; 
}

export { app, auth, db };
