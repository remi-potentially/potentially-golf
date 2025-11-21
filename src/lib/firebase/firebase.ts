// src/lib/firebase.ts

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Read Firebase config from env.
 *
 * On Firebase App Hosting, FIREBASE_WEBAPP_CONFIG is injected automatically.
 * For local dev we can optionally fall back to NEXT_PUBLIC_FIREBASE_CONFIG.
 */
function loadFirebaseConfig() {
  const raw =
    process.env.FIREBASE_WEBAPP_CONFIG ??
    process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

  if (!raw) {
    // Don’t hard-crash the browser, but log loudly so we know what’s wrong.
    console.error(
      "FIREBASE_WEBAPP_CONFIG / NEXT_PUBLIC_FIREBASE_CONFIG is not set. " +
        "Check your Firebase App Hosting configuration or local env."
    );
    throw new Error(
      "Firebase config missing – check FIREBASE_WEBAPP_CONFIG / NEXT_PUBLIC_FIREBASE_CONFIG."
    );
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse Firebase config JSON:", err, raw);
    throw err;
  }
}

const firebaseConfig = loadFirebaseConfig();

// Only initialise once, even if this module is imported in multiple places.
const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
