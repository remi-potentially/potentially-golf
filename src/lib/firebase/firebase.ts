// src/lib/firebase/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "./config";

// Initialize Firebase
const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage, firebaseApp };
