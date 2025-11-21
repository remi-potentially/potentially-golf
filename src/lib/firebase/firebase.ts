// src/lib/firebase.ts

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase Studio / App Hosting injects this automatically.
// It's a JSON string with apiKey, authDomain, projectId, etc.
const rawConfig = process.env.FIREBASE_WEBAPP_CONFIG;

if (!rawConfig) {
  throw new Error(
    "FIREBASE_WEBAPP_CONFIG is not set. Check your Firebase App Hosting configuration."
  );
}

const firebaseConfig = JSON.parse(rawConfig);

// Make sure we only initialize once (Next.js can import this in multiple places)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
