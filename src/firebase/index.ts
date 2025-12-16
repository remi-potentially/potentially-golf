
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import firebaseConfig from './config';

export { FirebaseClientProvider } from './client-provider';
// Re-export hooks from the provider
export { useAuth, useFirestore, useFirebaseApp, useFirebase } from './provider';

// --- SERVICE INITIALIZATION ---

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// This logic ensures Firebase is initialized only once on the client.
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
}

/**
 * A hook that returns the initialized Firebase App, Auth, and Firestore instances.
 * This is intended for use in client components.
 */
export function useFirebaseInstances() {
  // In a client component, the provider ensures these are initialized.
  const app = useFirebaseApp();
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
