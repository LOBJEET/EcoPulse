import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeFirestore } from "firebase/firestore";

// WARNING: Replace with your actual Firebase config from Firebase Console
// Go to: Firebase Console > Project Settings > Your app > SDK setup and configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-bucket.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "your-app-id"
};

// debug: ensure config values are loaded
console.log("[firebase] config", firebaseConfig);

// detect missing fields early
Object.entries(firebaseConfig).forEach(([k, v]) => {
  if (!v || v.startsWith("YOUR_")) {
    console.warn(`[firebase] configuration key ${k} is not set`);
  }
});

const app = initializeApp(firebaseConfig);

// initialize auth with async-storage persistence for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Long polling avoids WebChannel hangs on React Native / Expo (addDoc never resolving).
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});