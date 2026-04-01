export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  bio?: string;
  photoURL?: string;
  createdAt?: Date;
}
