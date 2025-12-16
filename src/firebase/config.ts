
// src/firebase/config.ts

const firebaseConfig = {
  apiKey: "AIzaSyAKOQmn8mEv03Fa9BaKgDYh0JtxoEudtS4",
  authDomain: "potentially-app-test-126-6eb16.firebaseapp.com",
  projectId: "potentially-app-test-126-6eb16",
  storageBucket: "potentially-app-test-126-6eb16.appspot.com",
  messagingSenderId: "141902978896",
  appId: "1:141902978896:web:21749b8788ba35d1625655",
  measurementId: "G-9XG31C2E6Q"
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
