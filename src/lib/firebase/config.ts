// src/lib/firebase/config.ts

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};


// This function checks that all required environment variables are present.
export function checkFirebaseConfig() {
    const missingVars = Object.entries(firebaseConfig).filter(([, value]) => !value || value.startsWith('YOUR_'));
    if (missingVars.length > 0) {
        console.error("Firebase config is missing a value. Ensure all NEXT_PUBLIC_FIREBASE_* variables are set in your .env file or hardcoded in the config.");
        console.error("Missing variables:", missingVars.map(([key]) => key).join(", "));
        return false;
    }
    return true;
}


export default firebaseConfig;
