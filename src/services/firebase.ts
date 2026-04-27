import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "@firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const getRequiredEnv = (name: string, value: string | undefined): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(
      `[firebase] Missing required env var: ${name}. Set it for EAS builds with "eas env:create".`
    );
  }
  return trimmed;
};

const firebaseConfig = {
  // IMPORTANT: Access env vars statically so Expo can inline EXPO_PUBLIC_* values in production builds.
  apiKey: getRequiredEnv(
    "EXPO_PUBLIC_FIREBASE_API_KEY",
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY
  ),
  authDomain: getRequiredEnv(
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  ),
  projectId: getRequiredEnv(
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  ),
  storageBucket: getRequiredEnv(
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  ),
  messagingSenderId: getRequiredEnv(
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  ),
  appId: getRequiredEnv(
    "EXPO_PUBLIC_FIREBASE_APP_ID",
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  ),
};

const app = initializeApp(firebaseConfig);

// Initialize auth and firestore
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Long polling avoids WebChannel hangs on React Native / Expo (addDoc never resolving).
export const db = getFirestore(app);