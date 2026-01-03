import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Prevent re-initialization in Next.js
const app = !getApps().length
  ? initializeApp({
      credential: cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      ),
    })
  : getApp();

// Firestore
const db = getFirestore(app);

// Firebase Auth (REQUIRED for Google login)
const auth = getAuth(app);

export { db, auth };
