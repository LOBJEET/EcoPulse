import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
  bio?: string;
}

export const authService = {
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async register(data: SignUpData) {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // Update user profile with additional info
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: data.displayName,
      });
    }

    return userCredential;
  },

  async logout() {
    return signOut(auth);
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  },
};
