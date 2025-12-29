import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Prevents re-initialization error in Next.js hot-reloading
const app = !getApps().length
  ? initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}")),
    })
  : getApp();

const db = getFirestore(app);

export { db };