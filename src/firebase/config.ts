
// src/firebase/config.ts

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


// This function checks that all required environment variables are present.
export function checkFirebaseConfig() {
    const missingVars = Object.entries(firebaseConfig).filter(([, value]) => !value);
    if (missingVars.length > 0) {
        console.error("Firebase config is missing a value. Ensure all NEXT_PUBLIC_FIREBASE_* variables are set in your .env file or hardcoded in the config.");
        console.error("Missing variables:", missingVars.map(([key]) => key).join(", "));
        return false;
    }
    return true;
}


export default firebaseConfig;
