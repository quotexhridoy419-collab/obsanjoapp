// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcdPPdfV7CqnqLo1IME0s3dEy2j7BkVBo",
  authDomain: "rbw-farms-live.firebaseapp.com",
  databaseURL: "https://rbw-farms-live-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rbw-farms-live",
  storageBucket: "rbw-farms-live.appspot.com",
  messagingSenderId: "957730193134",
  appId: "1:957730193134:web:your-web-app-id" // Note: A placeholder appId is often sufficient for RTDB/Auth
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);

export { app, db, auth };
